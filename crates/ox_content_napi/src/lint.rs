use std::collections::{HashMap, HashSet};
use std::sync::LazyLock;

use napi_derive::napi;
use regex::Regex;
use serde::Deserialize;
use unicode_normalization::UnicodeNormalization;

const SUPPORTED_MARKDOWN_LINT_LANGUAGES: [&str; 6] = ["en", "ja", "zh", "fr", "de", "pl"];
const DEFAULT_LANGUAGES: [&str; 1] = ["en"];

static HEADING_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s{0,3}(#{1,6})[ \t]+(.+?)\s*#*\s*$").unwrap());
static FENCE_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s{0,3}(`{3,}|~{3,})").unwrap());
static LIST_PREFIX_PATTERN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^\s{0,3}(?:#{1,6}[ \t]+|>\s?|(?:[-*+]|(?:\d+[.)]))[ \t]+)").unwrap()
});
static REFERENCE_DEFINITION_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s{0,3}\[[^\]]+\]:").unwrap());
static URL_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?iu)\b(?:https?://|mailto:|www\.)\S+").unwrap());
static HTML_TAG_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?u)</?[\p{L}!][^>]*>").unwrap());
static FOOTNOTE_PATTERN: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\[\^[^\]]+\]").unwrap());
static LATIN_WORD_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?u)\p{Latin}+(?:['’-]\p{Latin}+)*").unwrap());
static CJK_RUN_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?u)[\p{Han}\p{Hiragana}\p{Katakana}ー]+").unwrap());

static LINT_DICTIONARY_DATA: LazyLock<LintDictionaryData> = LazyLock::new(|| {
    serde_json::from_str(include_str!(
        "../../../npm/vite-plugin-ox-content/src/lint-dictionaries.json"
    ))
    .expect("lint dictionaries JSON should be valid")
});

#[derive(Deserialize)]
struct LintDictionaryData {
    global: Vec<String>,
    #[serde(rename = "byLanguage")]
    by_language: HashMap<String, Vec<String>>,
}

#[napi(object)]
#[derive(Clone)]
pub struct JsMarkdownLintLanguageWords {
    pub language: String,
    pub words: Vec<String>,
}

#[napi(object)]
#[derive(Default, Clone)]
pub struct JsMarkdownLintDictionaryOptions {
    pub words: Option<Vec<String>>,
    pub by_language: Option<Vec<JsMarkdownLintLanguageWords>>,
    pub ignored_words: Option<Vec<String>>,
}

#[napi(object)]
#[derive(Default, Clone)]
pub struct JsMarkdownLintRuleOptions {
    pub duplicate_headings: Option<bool>,
    pub heading_increment: Option<bool>,
    pub max_consecutive_blank_lines: Option<u32>,
    pub repeated_punctuation: Option<bool>,
    pub repeated_words: Option<bool>,
    pub spellcheck: Option<bool>,
    pub trailing_spaces: Option<bool>,
}

#[napi(object)]
#[derive(Default, Clone)]
pub struct JsMarkdownLintOptions {
    pub languages: Option<Vec<String>>,
    pub rules: Option<JsMarkdownLintRuleOptions>,
    pub dictionary: Option<JsMarkdownLintDictionaryOptions>,
}

#[napi(object)]
#[derive(Clone)]
pub struct JsMarkdownLintDiagnostic {
    pub rule_id: String,
    pub severity: String,
    pub message: String,
    pub line: u32,
    pub column: u32,
    pub end_line: u32,
    pub end_column: u32,
    pub language: Option<String>,
    pub suggestions: Option<Vec<String>>,
}

#[napi(object)]
pub struct JsMarkdownLintResult {
    pub diagnostics: Vec<JsMarkdownLintDiagnostic>,
    pub error_count: u32,
    pub warning_count: u32,
    pub info_count: u32,
    pub masked_document: String,
}

#[derive(Clone)]
struct InternalMarkdownLintOptions {
    dictionary: InternalMarkdownLintDictionary,
    languages: Vec<String>,
    rules: InternalMarkdownLintRules,
}

#[derive(Clone, Default)]
struct InternalMarkdownLintDictionary {
    words: Vec<String>,
    by_language: HashMap<String, Vec<String>>,
    ignored_words: Vec<String>,
}

#[derive(Clone)]
struct InternalMarkdownLintRules {
    duplicate_headings: bool,
    heading_increment: bool,
    max_consecutive_blank_lines: u32,
    repeated_punctuation: bool,
    repeated_words: bool,
    spellcheck: bool,
    trailing_spaces: bool,
}

struct DictionaryBundle {
    active_languages: HashSet<String>,
    ignored_words: HashSet<String>,
    latin_words: HashSet<String>,
    latin_suggestion_words: Vec<String>,
    per_language: HashMap<String, HashSet<String>>,
}

#[derive(Clone)]
struct Token {
    end: usize,
    language: String,
    start: usize,
    text: String,
}

struct MarkdownLintState {
    diagnostics: Vec<JsMarkdownLintDiagnostic>,
    masked_lines: Vec<String>,
}

#[napi(js_name = "lintMarkdown")]
pub fn lint_markdown(
    source: String,
    options: Option<JsMarkdownLintOptions>,
) -> JsMarkdownLintResult {
    let normalized_options = normalize_lint_options(options);
    let state = collect_markdown_lint_state(&source, &normalized_options);
    summarize_diagnostics(sort_diagnostics(state.diagnostics), state.masked_lines.join("\n"))
}

fn normalize_lint_options(options: Option<JsMarkdownLintOptions>) -> InternalMarkdownLintOptions {
    let options = options.unwrap_or_default();
    let languages = options
        .languages
        .unwrap_or_else(|| DEFAULT_LANGUAGES.iter().map(ToString::to_string).collect())
        .into_iter()
        .filter(|language| is_supported_language(language))
        .collect::<Vec<_>>();
    let dictionary = options.dictionary.unwrap_or_default();
    let rules = options.rules.unwrap_or_default();

    InternalMarkdownLintOptions {
        dictionary: InternalMarkdownLintDictionary {
            words: dictionary.words.unwrap_or_default(),
            by_language: dictionary
                .by_language
                .unwrap_or_default()
                .into_iter()
                .filter(|entry| is_supported_language(&entry.language))
                .map(|entry| (entry.language, entry.words))
                .collect(),
            ignored_words: dictionary.ignored_words.unwrap_or_default(),
        },
        languages: if languages.is_empty() {
            DEFAULT_LANGUAGES.iter().map(ToString::to_string).collect()
        } else {
            dedupe_strings(languages)
        },
        rules: InternalMarkdownLintRules {
            duplicate_headings: rules.duplicate_headings.unwrap_or(true),
            heading_increment: rules.heading_increment.unwrap_or(true),
            max_consecutive_blank_lines: rules.max_consecutive_blank_lines.unwrap_or(1),
            repeated_punctuation: rules.repeated_punctuation.unwrap_or(true),
            repeated_words: rules.repeated_words.unwrap_or(true),
            spellcheck: rules.spellcheck.unwrap_or(true),
            trailing_spaces: rules.trailing_spaces.unwrap_or(true),
        },
    }
}

fn collect_markdown_lint_state(
    source: &str,
    normalized_options: &InternalMarkdownLintOptions,
) -> MarkdownLintState {
    let dictionary = create_dictionary_bundle(normalized_options);
    let mut diagnostics = Vec::new();
    let mut masked_lines = Vec::new();
    let mut seen_headings = HashMap::new();

    let mut blank_line_streak = 0_u32;
    let mut html_comment_open = false;
    let mut in_fence = false;
    let mut fence_char = '\0';
    let mut fence_length = 0_usize;
    let mut frontmatter_open = false;
    let mut frontmatter_checked = false;
    let mut previous_heading_depth = 0_usize;

    for (index, raw_line) in source.split('\n').enumerate() {
        let line = raw_line.strip_suffix('\r').unwrap_or(raw_line);
        let line_number = index + 1;
        let trimmed = line.trim();

        if !frontmatter_checked {
            frontmatter_checked = true;
            if trimmed == "---" {
                frontmatter_open = true;
                masked_lines.push(create_skipped_line_mask(line));
                continue;
            }
        }

        if frontmatter_open {
            if trimmed == "---" || trimmed == "..." {
                frontmatter_open = false;
            }
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        if html_comment_open {
            if line.contains("-->") {
                html_comment_open = false;
            }
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        if !in_fence && trimmed.starts_with("<!--") {
            if !trimmed.contains("-->") {
                html_comment_open = true;
            }
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        if in_fence {
            if is_fence_close(line, fence_char, fence_length) {
                in_fence = false;
                fence_char = '\0';
                fence_length = 0;
            }
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        if let Some(fence_match) = FENCE_PATTERN.find(line) {
            let fence = &line[fence_match.start()..fence_match.end()];
            in_fence = true;
            fence_char = fence.chars().next().unwrap_or('\0');
            fence_length = fence.chars().count();
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        if normalized_options.rules.trailing_spaces {
            let trailing_length = get_trailing_whitespace_length(line);
            if trailing_length > 0 {
                let line_length = count_code_points(line);
                let start_column = line_length.saturating_sub(trailing_length) + 1;
                diagnostics.push(create_diagnostic(
                    "trailing-spaces",
                    "Trailing whitespace is not allowed.".to_string(),
                    line_number,
                    start_column,
                    line_length + 1,
                    None,
                    None,
                ));
            }
        }

        if trimmed.is_empty() {
            blank_line_streak += 1;
            if blank_line_streak > normalized_options.rules.max_consecutive_blank_lines {
                let limit = normalized_options.rules.max_consecutive_blank_lines;
                diagnostics.push(create_diagnostic(
                    "max-consecutive-blank-lines",
                    format!(
                        "More than {limit} blank line{} in a row.",
                        if limit == 1 { "" } else { "s" }
                    ),
                    line_number,
                    1,
                    1,
                    None,
                    None,
                ));
            }
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        blank_line_streak = 0;

        if let Some(captures) = HEADING_PATTERN.captures(line) {
            let depth = captures.get(1).map_or(0, |value| value.as_str().chars().count());
            let heading_text = captures
                .get(2)
                .map(|value| collapse_whitespace(&get_visible_text(value.as_str())))
                .unwrap_or_default();
            let normalized_heading = normalize_latin_word(&heading_text);

            if normalized_options.rules.heading_increment
                && previous_heading_depth > 0
                && depth > previous_heading_depth + 1
            {
                diagnostics.push(create_diagnostic(
                    "heading-increment",
                    format!("Heading depth jumps from h{previous_heading_depth} to h{depth}."),
                    line_number,
                    1,
                    depth + 1,
                    None,
                    None,
                ));
            }

            previous_heading_depth = depth;

            if normalized_options.rules.duplicate_headings && !normalized_heading.is_empty() {
                if let Some(first_seen_line) = seen_headings.get(&normalized_heading) {
                    diagnostics.push(create_diagnostic(
                        "duplicate-heading",
                        format!("Heading text duplicates the heading on line {first_seen_line}."),
                        line_number,
                        1,
                        count_code_points(line) + 1,
                        None,
                        None,
                    ));
                } else {
                    seen_headings.insert(normalized_heading, line_number);
                }
            }
        }

        if REFERENCE_DEFINITION_PATTERN.is_match(line) || is_indented_code_block_line(line) {
            masked_lines.push(create_skipped_line_mask(line));
            continue;
        }

        let masked_line = mask_markdown_line(line);
        masked_lines.push(masked_line.clone());

        if normalized_options.rules.repeated_punctuation {
            diagnostics.extend(collect_repeated_punctuation_diagnostics(line_number, &masked_line));
        }

        let mut tokens = collect_tokens(&masked_line, &normalized_options.languages, &dictionary);
        tokens.sort_by(|left, right| left.start.cmp(&right.start));

        if normalized_options.rules.repeated_words {
            let mut previous_comparable_token: Option<Token> = None;

            for token in &tokens {
                if should_ignore_repeated_word_token(token) {
                    continue;
                }

                if let Some(previous_token) = &previous_comparable_token {
                    if normalize_comparable_word(&previous_token.text)
                        == normalize_comparable_word(&token.text)
                    {
                        diagnostics.push(create_diagnostic(
                            "repeated-word",
                            format!("Repeated word \"{}\" looks accidental.", token.text),
                            line_number,
                            token.start + 1,
                            token.end + 1,
                            Some(token.language.clone()),
                            None,
                        ));
                    }
                }

                previous_comparable_token = Some(token.clone());
            }
        }

        if normalized_options.rules.spellcheck {
            for token in &tokens {
                if !should_spellcheck_token(token, &dictionary)
                    || is_known_token(token, &dictionary)
                {
                    continue;
                }

                let suggestions = if token.language == "ja" || token.language == "zh" {
                    None
                } else {
                    let values =
                        suggest_latin_words(&token.text, &dictionary.latin_suggestion_words);
                    if values.is_empty() {
                        None
                    } else {
                        Some(values)
                    }
                };

                diagnostics.push(create_diagnostic(
                    "spellcheck",
                    format!("Unknown {} word \"{}\".", token.language, token.text),
                    line_number,
                    token.start + 1,
                    token.end + 1,
                    Some(token.language.clone()),
                    suggestions,
                ));
            }
        }
    }

    MarkdownLintState { diagnostics, masked_lines }
}

fn create_dictionary_bundle(options: &InternalMarkdownLintOptions) -> DictionaryBundle {
    let mut per_language = HashMap::new();

    for language in SUPPORTED_MARKDOWN_LINT_LANGUAGES {
        let mut words = HashSet::new();

        if let Some(base_words) = LINT_DICTIONARY_DATA.by_language.get(language) {
            for word in base_words {
                words.insert(normalize_word_for_set(word));
            }
        }

        for word in &LINT_DICTIONARY_DATA.global {
            words.insert(normalize_word_for_set(word));
        }

        if let Some(extra_words) = options.dictionary.by_language.get(language) {
            for word in extra_words {
                words.insert(normalize_word_for_set(word));
            }
        }

        per_language.insert(language.to_string(), words);
    }

    let mut latin_words = HashSet::new();
    let mut latin_suggestion_words = HashSet::new();

    for language in &options.languages {
        if language == "ja" || language == "zh" {
            continue;
        }

        if let Some(words) = per_language.get(language) {
            for word in words {
                latin_words.insert(word.clone());
                latin_suggestion_words.insert(word.clone());
            }
        }
    }

    for word in &options.dictionary.words {
        let normalized_word = normalize_word_for_set(word);
        latin_words.insert(normalized_word.clone());
        latin_suggestion_words.insert(normalized_word.clone());

        for language in SUPPORTED_MARKDOWN_LINT_LANGUAGES {
            per_language.entry(language.to_string()).or_default().insert(normalized_word.clone());
        }
    }

    let ignored_words =
        options.dictionary.ignored_words.iter().map(|word| normalize_word_for_set(word)).collect();

    let active_languages = options
        .languages
        .iter()
        .filter(|language| {
            let base_words =
                LINT_DICTIONARY_DATA.by_language.get((*language).as_str()).map_or(0, Vec::len);
            let extra_words =
                options.dictionary.by_language.get((*language).as_str()).map_or(0, Vec::len);
            base_words > 0 || extra_words > 0
        })
        .cloned()
        .collect();

    DictionaryBundle {
        active_languages,
        ignored_words,
        latin_words,
        latin_suggestion_words: {
            let mut values = latin_suggestion_words.into_iter().collect::<Vec<_>>();
            values.sort();
            values
        },
        per_language,
    }
}

fn collect_tokens(
    masked_line: &str,
    languages: &[String],
    dictionary: &DictionaryBundle,
) -> Vec<Token> {
    let mut tokens = collect_latin_tokens(masked_line, languages, dictionary);

    for value in CJK_RUN_PATTERN.find_iter(masked_line) {
        let start = byte_to_char_index(masked_line, value.start());
        tokens.extend(collect_cjk_tokens(value.as_str(), start, languages, dictionary));
    }

    tokens
}

fn collect_latin_tokens(
    masked_line: &str,
    languages: &[String],
    dictionary: &DictionaryBundle,
) -> Vec<Token> {
    let latin_languages = languages
        .iter()
        .filter(|language| language.as_str() != "ja" && language.as_str() != "zh")
        .cloned()
        .collect::<Vec<_>>();

    if latin_languages.is_empty() {
        return Vec::new();
    }

    let fallback_language = latin_languages[0].clone();
    let mut tokens = Vec::new();

    for value in LATIN_WORD_PATTERN.find_iter(masked_line) {
        let text = value.as_str().to_string();
        let start = byte_to_char_index(masked_line, value.start());
        let end = start + count_code_points(value.as_str());
        tokens.push(Token { end, language: fallback_language.clone(), start, text });
    }

    assign_latin_languages(tokens, &latin_languages, dictionary, &fallback_language)
}

fn collect_cjk_tokens(
    run: &str,
    start_offset: usize,
    languages: &[String],
    dictionary: &DictionaryBundle,
) -> Vec<Token> {
    let has_kana =
        run.chars().any(|value| matches!(value, '\u{3040}'..='\u{309F}' | '\u{30A0}'..='\u{30FF}'));

    let mut candidates = Vec::new();

    if has_kana && languages.iter().any(|language| language == "ja") {
        candidates.push("ja".to_string());
    } else {
        if languages.iter().any(|language| language == "zh") {
            candidates.push("zh".to_string());
        }
        if languages.iter().any(|language| language == "ja") {
            candidates.push("ja".to_string());
        }
    }

    if candidates.is_empty() {
        return Vec::new();
    }

    let mut best_candidate: Option<(usize, Vec<Token>)> = None;

    for language in candidates {
        let tokens = segment_cjk_run(run, start_offset, &language, dictionary);
        let known_count = tokens.iter().filter(|token| is_known_token(token, dictionary)).count();

        match &best_candidate {
            Some((best_known_count, best_tokens))
                if known_count < *best_known_count
                    || (known_count == *best_known_count && tokens.len() >= best_tokens.len()) => {}
            _ => best_candidate = Some((known_count, tokens)),
        }
    }

    best_candidate.map_or_else(Vec::new, |(_, tokens)| tokens)
}

fn segment_cjk_run(
    run: &str,
    start_offset: usize,
    language: &str,
    dictionary: &DictionaryBundle,
) -> Vec<Token> {
    let Some(words) = dictionary.per_language.get(language) else {
        return vec![Token {
            end: start_offset + count_code_points(run),
            language: language.to_string(),
            start: start_offset,
            text: run.to_string(),
        }];
    };

    let mut dictionary_words = words.iter().cloned().collect::<Vec<_>>();
    dictionary_words.sort_by(|left, right| right.chars().count().cmp(&left.chars().count()));

    let total_chars = count_code_points(run);
    let mut tokens = Vec::new();
    let mut char_index = 0;

    while char_index < total_chars {
        let start_byte = char_to_byte_index(run, char_index);
        let best_match = dictionary_words.iter().find_map(|word| {
            let word_length = count_code_points(word);
            let end_char = char_index + word_length;
            if end_char > total_chars {
                return None;
            }

            let end_byte = char_to_byte_index(run, end_char);
            (run[start_byte..end_byte] == *word).then_some((word.clone(), word_length))
        });

        if let Some((word, word_length)) = best_match {
            tokens.push(Token {
                end: start_offset + char_index + word_length,
                language: language.to_string(),
                start: start_offset + char_index,
                text: word,
            });
            char_index += word_length;
            continue;
        }

        let end_char = char_index + 1;
        let end_byte = char_to_byte_index(run, end_char);
        tokens.push(Token {
            end: start_offset + end_char,
            language: language.to_string(),
            start: start_offset + char_index,
            text: run[start_byte..end_byte].to_string(),
        });
        char_index = end_char;
    }

    if tokens.iter().all(|token| count_code_points(&token.text) == 1) {
        return vec![Token {
            end: start_offset + count_code_points(run),
            language: language.to_string(),
            start: start_offset,
            text: run.to_string(),
        }];
    }

    tokens
}

fn assign_latin_languages(
    tokens: Vec<Token>,
    languages: &[String],
    dictionary: &DictionaryBundle,
    fallback_language: &str,
) -> Vec<Token> {
    let mut scores =
        languages.iter().map(|language| (language.clone(), 0_usize)).collect::<HashMap<_, _>>();

    for token in &tokens {
        let matching_languages = get_matching_latin_languages(&token.text, languages, dictionary);
        if matching_languages.len() == 1 {
            let language = &matching_languages[0];
            *scores.entry(language.clone()).or_default() += 1;
        }
    }

    let dominant_language = scores
        .into_iter()
        .max_by(|left, right| left.1.cmp(&right.1))
        .map_or_else(|| fallback_language.to_string(), |(language, _)| language);

    tokens
        .into_iter()
        .map(|token| {
            let matching_languages =
                get_matching_latin_languages(&token.text, languages, dictionary);
            let inferred_language = matching_languages
                .first()
                .cloned()
                .or_else(|| infer_latin_language_from_characters(&token.text, languages));

            Token {
                language: inferred_language.unwrap_or_else(|| dominant_language.clone()),
                ..token
            }
        })
        .collect()
}

fn get_matching_latin_languages(
    word: &str,
    languages: &[String],
    dictionary: &DictionaryBundle,
) -> Vec<String> {
    let normalized_word = normalize_word_for_set(word);

    languages
        .iter()
        .filter(|language| {
            dictionary
                .per_language
                .get((*language).as_str())
                .is_some_and(|words| words.contains(&normalized_word))
        })
        .cloned()
        .collect()
}

fn infer_latin_language_from_characters(word: &str, languages: &[String]) -> Option<String> {
    if languages.iter().any(|language| language == "pl")
        && word.chars().any(|value| {
            matches!(
                value,
                'ą' | 'ć'
                    | 'ę'
                    | 'ł'
                    | 'ń'
                    | 'ó'
                    | 'ś'
                    | 'ź'
                    | 'ż'
                    | 'Ą'
                    | 'Ć'
                    | 'Ę'
                    | 'Ł'
                    | 'Ń'
                    | 'Ó'
                    | 'Ś'
                    | 'Ź'
                    | 'Ż'
            )
        })
    {
        return Some("pl".to_string());
    }

    if languages.iter().any(|language| language == "de")
        && word.chars().any(|value| matches!(value, 'ä' | 'ö' | 'ü' | 'ß' | 'Ä' | 'Ö' | 'Ü'))
    {
        return Some("de".to_string());
    }

    if languages.iter().any(|language| language == "fr")
        && word.chars().any(|value| {
            matches!(
                value,
                'à' | 'â'
                    | 'æ'
                    | 'ç'
                    | 'é'
                    | 'è'
                    | 'ê'
                    | 'ë'
                    | 'î'
                    | 'ï'
                    | 'ô'
                    | 'œ'
                    | 'ù'
                    | 'û'
                    | 'ü'
                    | 'ÿ'
                    | 'À'
                    | 'Â'
                    | 'Æ'
                    | 'Ç'
                    | 'É'
                    | 'È'
                    | 'Ê'
                    | 'Ë'
                    | 'Î'
                    | 'Ï'
                    | 'Ô'
                    | 'Œ'
                    | 'Ù'
                    | 'Û'
                    | 'Ü'
                    | 'Ÿ'
            )
        })
    {
        return Some("fr".to_string());
    }

    None
}

fn collect_repeated_punctuation_diagnostics(
    line_number: usize,
    masked_line: &str,
) -> Vec<JsMarkdownLintDiagnostic> {
    let chars = masked_line.chars().collect::<Vec<_>>();
    let mut diagnostics = Vec::new();
    let mut index = 0;

    while index + 1 < chars.len() {
        let value = chars[index];
        if !is_repeated_punctuation_char(value) || chars[index + 1] != value {
            index += 1;
            continue;
        }

        let start = index;
        let mut end = index + 1;
        while end < chars.len() && chars[end] == value {
            end += 1;
        }

        diagnostics.push(create_diagnostic(
            "repeated-punctuation",
            format!(
                "Repeated punctuation \"{}\" looks accidental.",
                chars[start..end].iter().collect::<String>()
            ),
            line_number,
            start + 1,
            end + 1,
            None,
            None,
        ));
        index = end;
    }

    diagnostics
}

fn should_ignore_repeated_word_token(token: &Token) -> bool {
    if token.language == "ja" || token.language == "zh" {
        return count_code_points(&token.text) <= 1;
    }

    normalize_comparable_word(&token.text).chars().count() <= 1
}

fn should_spellcheck_token(token: &Token, dictionary: &DictionaryBundle) -> bool {
    let normalized = normalize_word_for_set(&token.text);

    if normalized.is_empty() || dictionary.ignored_words.contains(&normalized) {
        return false;
    }

    if !dictionary.active_languages.contains(&token.language) {
        return false;
    }

    if token.text.contains('_')
        || token.text.contains('/')
        || token.text.contains('\\')
        || token.text.chars().any(char::is_numeric)
    {
        return false;
    }

    if is_uppercase_token(&token.text) {
        return false;
    }

    if token.language == "ja" || token.language == "zh" {
        if token.language == "ja" && token.text.chars().all(is_hiragana) {
            return count_code_points(&token.text) > 2;
        }

        return count_code_points(&token.text) > 1;
    }

    normalize_comparable_word(&token.text).chars().count() > 2
}

fn is_known_token(token: &Token, dictionary: &DictionaryBundle) -> bool {
    let normalized = normalize_word_for_set(&token.text);
    if normalized.is_empty() || dictionary.ignored_words.contains(&normalized) {
        return true;
    }

    if token.language == "ja" || token.language == "zh" {
        return dictionary
            .per_language
            .get(token.language.as_str())
            .is_some_and(|words| words.contains(&normalized));
    }

    dictionary.latin_words.contains(&normalized)
}

fn suggest_latin_words(word: &str, candidates: &[String]) -> Vec<String> {
    let normalized_word = normalize_latin_word(word);
    let first_char = normalized_word.chars().next();
    let mut suggestions = candidates
        .iter()
        .filter(|candidate| {
            let candidate_length = candidate.chars().count();
            let word_length = normalized_word.chars().count();
            candidate_length.abs_diff(word_length) <= 2
        })
        .filter(|candidate| candidate.chars().next() == first_char)
        .map(|candidate| (candidate.clone(), levenshtein(&normalized_word, candidate)))
        .filter(|(_, distance)| *distance <= 2)
        .collect::<Vec<_>>();

    suggestions.sort_by(|left, right| left.1.cmp(&right.1).then_with(|| left.0.cmp(&right.0)));

    dedupe_strings(suggestions.into_iter().take(3).map(|(candidate, _)| candidate).collect())
}

fn summarize_diagnostics(
    diagnostics: Vec<JsMarkdownLintDiagnostic>,
    masked_document: String,
) -> JsMarkdownLintResult {
    let error_count =
        diagnostics.iter().filter(|diagnostic| diagnostic.severity == "error").count();
    let warning_count =
        diagnostics.iter().filter(|diagnostic| diagnostic.severity == "warning").count();
    let info_count = diagnostics.iter().filter(|diagnostic| diagnostic.severity == "info").count();

    JsMarkdownLintResult {
        diagnostics,
        error_count: error_count as u32,
        warning_count: warning_count as u32,
        info_count: info_count as u32,
        masked_document,
    }
}

fn sort_diagnostics(
    mut diagnostics: Vec<JsMarkdownLintDiagnostic>,
) -> Vec<JsMarkdownLintDiagnostic> {
    diagnostics.sort_by(|left, right| {
        left.line
            .cmp(&right.line)
            .then_with(|| left.column.cmp(&right.column))
            .then_with(|| left.rule_id.cmp(&right.rule_id))
    });
    diagnostics
}

fn create_diagnostic(
    rule_id: &str,
    message: String,
    line: usize,
    column: usize,
    end_column: usize,
    language: Option<String>,
    suggestions: Option<Vec<String>>,
) -> JsMarkdownLintDiagnostic {
    JsMarkdownLintDiagnostic {
        rule_id: rule_id.to_string(),
        severity: "warning".to_string(),
        message,
        line: line as u32,
        column: column as u32,
        end_line: line as u32,
        end_column: end_column as u32,
        language,
        suggestions,
    }
}

fn create_skipped_line_mask(line: &str) -> String {
    " ".repeat(count_code_points(line))
}

fn get_trailing_whitespace_length(line: &str) -> usize {
    line.chars().rev().take_while(|value| *value == ' ' || *value == '\t').count()
}

fn is_fence_close(line: &str, fence_char: char, fence_length: usize) -> bool {
    let trimmed = line.trim_start();
    let fence = fence_char.to_string().repeat(fence_length);

    if !trimmed.starts_with(&fence) {
        return false;
    }

    trimmed.chars().enumerate().all(|(index, value)| index < fence_length || value == fence_char)
}

fn is_indented_code_block_line(line: &str) -> bool {
    line.starts_with('\t') || line.starts_with("    ")
}

fn get_visible_text(text: &str) -> String {
    collapse_whitespace(&mask_markdown_line(text))
}

fn mask_markdown_line(line: &str) -> String {
    let mut chars = line.chars().collect::<Vec<_>>();

    if let Some(prefix_match) = LIST_PREFIX_PATTERN.find(line) {
        let (start, end) = byte_range_to_char_range(line, prefix_match.start(), prefix_match.end());
        blank_range(&mut chars, start, end);
    }

    for value in FOOTNOTE_PATTERN.find_iter(line) {
        let (start, end) = byte_range_to_char_range(line, value.start(), value.end());
        blank_range(&mut chars, start, end);
    }

    for value in URL_PATTERN.find_iter(line) {
        let (start, end) = byte_range_to_char_range(line, value.start(), value.end());
        blank_range(&mut chars, start, end);
    }

    for value in HTML_TAG_PATTERN.find_iter(line) {
        let (start, end) = byte_range_to_char_range(line, value.start(), value.end());
        blank_range(&mut chars, start, end);
    }

    mask_inline_code(line, &mut chars);
    mask_link_targets(line, &mut chars);

    for value in &mut chars {
        if matches!(*value, '\\' | '*' | '_' | '~' | '|' | '!' | '[' | ']' | '(' | ')') {
            *value = ' ';
        }
    }

    chars.into_iter().collect()
}

fn mask_inline_code(line: &str, chars: &mut [char]) {
    let line_chars = line.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < line_chars.len() {
        if line_chars[index] != '`' {
            index += 1;
            continue;
        }

        let mut tick_count = 1;
        while index + tick_count < line_chars.len() && line_chars[index + tick_count] == '`' {
            tick_count += 1;
        }

        if let Some(close_index) = find_backtick_fence(&line_chars, index + tick_count, tick_count)
        {
            blank_range(chars, index, close_index + tick_count);
            index = close_index + tick_count;
        } else {
            blank_range(chars, index, index + tick_count);
            index += tick_count;
        }
    }
}

fn mask_link_targets(line: &str, chars: &mut [char]) {
    let line_chars = line.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index + 1 < line_chars.len() {
        if line_chars[index] != ']' {
            index += 1;
            continue;
        }

        if line_chars[index + 1] == '(' {
            let mut depth = 1_i32;
            let mut cursor = index + 2;
            while cursor < line_chars.len() && depth > 0 {
                if line_chars[cursor] == '(' {
                    depth += 1;
                } else if line_chars[cursor] == ')' {
                    depth -= 1;
                }
                cursor += 1;
            }
            blank_range(chars, index, cursor);
            index = cursor;
            continue;
        }

        if line_chars[index + 1] == '[' {
            let mut cursor = index + 2;
            while cursor < line_chars.len() {
                if line_chars[cursor] == ']' {
                    blank_range(chars, index, cursor + 1);
                    index = cursor + 1;
                    break;
                }
                cursor += 1;
            }
        } else {
            index += 1;
        }
    }
}

fn find_backtick_fence(chars: &[char], start: usize, tick_count: usize) -> Option<usize> {
    let mut index = start;

    while index + tick_count <= chars.len() {
        if chars[index..index + tick_count].iter().all(|value| *value == '`') {
            return Some(index);
        }
        index += 1;
    }

    None
}

fn blank_range(chars: &mut [char], start: usize, end: usize) {
    let safe_start = start.min(chars.len());
    let safe_end = end.min(chars.len());
    for value in chars.iter_mut().take(safe_end).skip(safe_start) {
        *value = ' ';
    }
}

fn byte_range_to_char_range(text: &str, start: usize, end: usize) -> (usize, usize) {
    (byte_to_char_index(text, start), byte_to_char_index(text, end))
}

fn byte_to_char_index(text: &str, byte_index: usize) -> usize {
    text[..byte_index.min(text.len())].chars().count()
}

fn char_to_byte_index(text: &str, char_index: usize) -> usize {
    if char_index == 0 {
        return 0;
    }

    text.char_indices().nth(char_index).map_or(text.len(), |(index, _)| index)
}

fn normalize_comparable_word(word: &str) -> String {
    normalize_latin_word(word).chars().filter(|value| !matches!(value, '\'' | '’' | '-')).collect()
}

fn normalize_word_for_set(word: &str) -> String {
    if word.chars().any(is_cjk_char) {
        word.nfc().collect::<String>().trim().to_string()
    } else {
        normalize_latin_word(word)
    }
}

fn normalize_latin_word(word: &str) -> String {
    word.nfc().collect::<String>().to_lowercase()
}

fn collapse_whitespace(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn count_code_points(text: &str) -> usize {
    text.chars().count()
}

fn dedupe_strings(values: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut deduped = Vec::new();

    for value in values {
        if seen.insert(value.clone()) {
            deduped.push(value);
        }
    }

    deduped
}

fn is_supported_language(language: &str) -> bool {
    SUPPORTED_MARKDOWN_LINT_LANGUAGES.contains(&language)
}

fn is_repeated_punctuation_char(value: char) -> bool {
    matches!(value, '!' | '?' | '！' | '？' | '。' | '、' | '，')
}

fn is_uppercase_token(value: &str) -> bool {
    let mut chars = value.chars();
    let Some(first_char) = chars.next() else {
        return false;
    };

    first_char.is_uppercase()
        && chars.all(|character| character.is_uppercase() || character.is_numeric())
}

fn is_hiragana(value: char) -> bool {
    matches!(value, '\u{3040}'..='\u{309F}')
}

fn is_cjk_char(value: char) -> bool {
    matches!(
        value,
        '\u{3040}'..='\u{309F}' | '\u{30A0}'..='\u{30FF}' | '\u{4E00}'..='\u{9FFF}'
    )
}

fn levenshtein(left: &str, right: &str) -> usize {
    if left == right {
        return 0;
    }

    let left_chars = left.chars().collect::<Vec<_>>();
    let right_chars = right.chars().collect::<Vec<_>>();

    if left_chars.is_empty() {
        return right_chars.len();
    }
    if right_chars.is_empty() {
        return left_chars.len();
    }

    let mut previous_row = (0..=right_chars.len()).collect::<Vec<_>>();
    let mut current_row = vec![0; right_chars.len() + 1];

    for (left_index, left_value) in left_chars.iter().enumerate() {
        current_row[0] = left_index + 1;

        for (right_index, right_value) in right_chars.iter().enumerate() {
            let substitution_cost = usize::from(left_value != right_value);
            current_row[right_index + 1] = *[
                current_row[right_index] + 1,
                previous_row[right_index + 1] + 1,
                previous_row[right_index] + substitution_cost,
            ]
            .iter()
            .min()
            .unwrap();
        }

        previous_row.clone_from(&current_row);
    }

    previous_row[right_chars.len()]
}
