//! Search query engine with BM25 scoring.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::index::SearchIndex;
use crate::tokenizer::tokenize_query;

/// Search options.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchOptions {
    /// Maximum number of results to return.
    #[serde(default = "default_limit")]
    pub limit: usize,
    /// Enable prefix matching for the last token.
    #[serde(default = "default_prefix")]
    pub prefix: bool,
    /// Enable fuzzy matching (edit distance).
    #[serde(default)]
    pub fuzzy: bool,
    /// Minimum score threshold (0.0 - 1.0).
    #[serde(default)]
    pub threshold: f64,
}

fn default_limit() -> usize {
    10
}

fn default_prefix() -> bool {
    true
}

impl Default for SearchOptions {
    fn default() -> Self {
        Self { limit: 10, prefix: true, fuzzy: false, threshold: 0.0 }
    }
}

/// A search result with relevance score.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// Document ID.
    pub id: String,
    /// Document title.
    pub title: String,
    /// Document URL.
    pub url: String,
    /// Relevance score.
    pub score: f64,
    /// Matched terms.
    pub matches: Vec<String>,
    /// Content snippet with highlights.
    pub snippet: String,
}

/// BM25 parameters.
const K1: f64 = 1.2;
const B: f64 = 0.75;

impl SearchIndex {
    /// Searches the index with the given query.
    #[must_use]
    pub fn search(&self, query: &str, options: &SearchOptions) -> Vec<SearchResult> {
        if query.is_empty() || self.is_empty() {
            return Vec::new();
        }

        let tokens = tokenize_query(query);
        if tokens.is_empty() {
            return Vec::new();
        }

        // Calculate scores for each document
        let mut doc_scores: HashMap<usize, (f64, Vec<String>)> = HashMap::new();

        for (i, token) in tokens.iter().enumerate() {
            let is_last = i == tokens.len() - 1;

            // Get matching terms (exact or prefix)
            let matching_terms = self.find_matching_terms(token, is_last && options.prefix);

            for term in matching_terms {
                if let Some(postings) = self.index.get(&term) {
                    let df = self.df.get(&term).copied().unwrap_or(1);
                    let idf = self.compute_idf(df);

                    for posting in postings {
                        let doc = &self.documents[posting.doc_idx];
                        #[allow(clippy::cast_precision_loss)]
                        let doc_len = doc.body.len() as f64;
                        let tf = f64::from(posting.tf);

                        // BM25 score with field boost
                        let score = idf
                            * ((tf * (K1 + 1.0))
                                / K1.mul_add(1.0 - B + B * doc_len / self.avg_dl, tf))
                            * posting.field.boost();

                        let entry = doc_scores.entry(posting.doc_idx).or_insert((0.0, Vec::new()));
                        entry.0 += score;
                        if !entry.1.contains(&term) {
                            entry.1.push(term.clone());
                        }
                    }
                }
            }
        }

        // Convert to results and sort by score
        let mut results: Vec<SearchResult> = doc_scores
            .into_iter()
            .filter(|(_, (score, _))| *score >= options.threshold)
            .map(|(doc_idx, (score, matches))| {
                let doc = &self.documents[doc_idx];
                let snippet = self.generate_snippet(&doc.body, &matches, 150);
                SearchResult {
                    id: doc.id.clone(),
                    title: doc.title.clone(),
                    url: doc.url.clone(),
                    score,
                    matches,
                    snippet,
                }
            })
            .collect();

        // Sort by score descending
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

        // Limit results
        results.truncate(options.limit);

        results
    }

    /// Computes IDF (Inverse Document Frequency).
    #[allow(clippy::cast_precision_loss)]
    fn compute_idf(&self, df: usize) -> f64 {
        let n = self.doc_count as f64;
        let df = df as f64;
        ((n - df + 0.5) / (df + 0.5)).ln_1p()
    }

    /// Finds terms matching the query term (exact or prefix).
    fn find_matching_terms(&self, token: &str, prefix_match: bool) -> Vec<String> {
        if prefix_match && token.len() >= 2 {
            self.index.keys().filter(|term| term.starts_with(token)).cloned().collect()
        } else if self.index.contains_key(token) {
            vec![token.to_string()]
        } else {
            Vec::new()
        }
    }

    /// Generates a snippet of text around matched terms.
    #[allow(clippy::unused_self)]
    fn generate_snippet(&self, body: &str, matches: &[String], max_len: usize) -> String {
        if body.is_empty() {
            return String::new();
        }

        let body_lower = body.to_lowercase();

        // Find the first match position
        let mut first_match_pos = None;
        for term in matches {
            if let Some(pos) = body_lower.find(term) {
                if first_match_pos.is_none() || pos < first_match_pos.unwrap() {
                    first_match_pos = Some(pos);
                }
            }
        }

        let start_pos = first_match_pos.unwrap_or(0);

        // Calculate snippet window
        let chars: Vec<char> = body.chars().collect();
        let total_chars = chars.len();

        // Find a good start position (at word boundary, before match)
        let context_before = max_len / 3;
        let mut snippet_start = start_pos.saturating_sub(context_before);

        // Adjust to word boundary
        while snippet_start > 0 && !chars[snippet_start].is_whitespace() {
            snippet_start -= 1;
        }
        if snippet_start > 0 {
            snippet_start += 1; // Skip the whitespace
        }

        // Calculate end position
        let snippet_end = (snippet_start + max_len).min(total_chars);

        // Build snippet
        let mut snippet: String = chars[snippet_start..snippet_end].iter().collect();

        // Add ellipsis if needed
        if snippet_start > 0 {
            snippet = format!("...{snippet}");
        }
        if snippet_end < total_chars {
            snippet = format!("{snippet}...");
        }

        snippet
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::index::SearchIndexBuilder;

    #[test]
    fn test_search_basic() {
        let mut builder = SearchIndexBuilder::new();
        builder.add_simple(
            "1",
            "Getting Started",
            "/getting-started",
            "Welcome to the documentation. This guide will help you get started quickly.",
        );
        builder.add_simple(
            "2",
            "Installation Guide",
            "/installation",
            "Learn how to install the package on your system.",
        );
        builder.add_simple(
            "3",
            "API Reference",
            "/api",
            "Complete API documentation for developers.",
        );

        let index = builder.build();
        let options = SearchOptions::default();

        let results = index.search("getting started", &options);
        assert!(!results.is_empty());
        assert_eq!(results[0].id, "1");

        let results = index.search("install", &options);
        assert!(!results.is_empty());
        assert_eq!(results[0].id, "2");
    }

    #[test]
    fn test_search_prefix() {
        let mut builder = SearchIndexBuilder::new();
        builder.add_simple("1", "Documentation", "/docs", "Complete documentation.");

        let index = builder.build();
        let options = SearchOptions { prefix: true, ..Default::default() };

        let results = index.search("doc", &options);
        assert!(!results.is_empty());
    }

    #[test]
    fn test_search_empty() {
        let index = SearchIndexBuilder::new().build();
        let options = SearchOptions::default();

        let results = index.search("test", &options);
        assert!(results.is_empty());
    }

    #[test]
    fn test_search_limit() {
        let mut builder = SearchIndexBuilder::new();
        for i in 0..20 {
            builder.add_simple(
                &format!("{i}"),
                &format!("Test {i}"),
                &format!("/test-{i}"),
                "test content",
            );
        }

        let index = builder.build();
        let options = SearchOptions { limit: 5, ..Default::default() };

        let results = index.search("test", &options);
        assert_eq!(results.len(), 5);
    }
}
