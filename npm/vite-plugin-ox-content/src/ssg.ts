/**
 * SSG (Static Site Generation) module for ox-content
 */

import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";
import { transformMarkdown } from "./transform";
import { generateOgImages } from "./og-image";
import type { OgImagePageEntry } from "./og-image";
import { transformAllPlugins } from "./plugins";
import type { TransformAllOptions } from "./plugins";
import { protectMermaidSvgs, restoreMermaidSvgs } from "./plugins/mermaid-protect";
import { transformIslands, hasIslands } from "./island";
import type {
  ResolvedOptions,
  ResolvedSsgOptions,
  SsgOptions,
  TocEntry,
  HeroConfig,
  FeatureConfig,
} from "./types";
import { resolveTheme, themeToNapi } from "./theme";
import type { ResolvedThemeConfig } from "./theme";

/**
 * Navigation item for SSG.
 */
export interface SsgNavItem {
  title: string;
  path: string;
  href: string;
  children?: SsgNavItem[];
}

/**
 * Entry page configuration for SSG (passed to Rust).
 */
export interface SsgEntryPageConfig {
  hero?: HeroConfig;
  features?: FeatureConfig[];
}

/**
 * Page data for SSG.
 */
export interface SsgPageData {
  title: string;
  description?: string;
  content: string;
  toc: TocEntry[];
  frontmatter: Record<string, unknown>;
  path: string;
  href: string;
  /** Entry page configuration (if layout: entry) */
  entryPage?: SsgEntryPageConfig;
}

/**
 * Default HTML template for SSG pages with navigation.
 */
export const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}{{#siteName}} - {{siteName}}{{/siteName}}</title>
  {{#description}}<meta name="description" content="{{description}}">{{/description}}
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{{title}}{{#siteName}} - {{siteName}}{{/siteName}}">
  {{#description}}<meta property="og:description" content="{{description}}">{{/description}}
  {{#ogImage}}<meta property="og:image" content="{{ogImage}}">{{/ogImage}}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{title}}{{#siteName}} - {{siteName}}{{/siteName}}">
  {{#description}}<meta name="twitter:description" content="{{description}}">{{/description}}
  {{#ogImage}}<meta name="twitter:image" content="{{ogImage}}">{{/ogImage}}
  <style>
    :root {
      --sidebar-width: 260px;
      --header-height: 60px;
      --max-content-width: 960px;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      --color-bg: #ffffff;
      --color-bg-alt: #f8f9fa;
      --color-text: #1a1a1a;
      --color-text-muted: #666666;
      --color-border: #e5e7eb;
      --color-primary: #b7410e;
      --color-primary-hover: #ce5937;
      --color-code-bg: #1e293b;
      --color-code-text: #e2e8f0;
    }
    [data-theme="dark"] {
      --color-bg: #141414;
      --color-bg-alt: #141414;
      --color-text: #e5e5e5;
      --color-text-muted: #a3a3a3;
      --color-border: #2a2a2a;
      --color-primary: #c9714a;
      --color-primary-hover: #d4845f;
      --color-code-bg: #1a1a1a;
      --color-code-text: #e5e5e5;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --color-bg: #141414;
        --color-bg-alt: #141414;
        --color-text: #e5e5e5;
        --color-text-muted: #a3a3a3;
        --color-border: #2a2a2a;
        --color-primary: #c9714a;
        --color-primary-hover: #d4845f;
        --color-code-bg: #1a1a1a;
        --color-code-text: #e5e5e5;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      line-height: 1.7;
      color: var(--color-text);
      background: var(--color-bg);
    }
    a { color: var(--color-primary); text-decoration: none; }
    a:hover { color: var(--color-primary-hover); text-decoration: underline; }

    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      z-index: 100;
    }
    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }
    .header-title:hover { text-decoration: none; }
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.75rem;
    }
    .menu-toggle svg { display: block; }
    .menu-toggle path { stroke: var(--color-text); }
    .header-actions { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }
    .search-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 0.875rem;
      transition: border-color 0.15s, color 0.15s;
    }
    .search-button:hover { border-color: var(--color-primary); color: var(--color-text); }
    .search-button svg { width: 16px; height: 16px; }
    .search-button kbd {
      padding: 0.125rem 0.375rem;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    @media (max-width: 640px) {
      .search-button span, .search-button kbd { display: none; }
      .search-button { padding: 0.5rem; }
    }
    .search-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      justify-content: center;
      padding-top: 10vh;
    }
    .search-modal-overlay.open { display: flex; }
    .search-modal {
      width: 100%;
      max-width: 560px;
      margin: 0 1rem;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
      max-height: 70vh;
      display: flex;
      flex-direction: column;
    }
    .search-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    .search-header svg { flex-shrink: 0; color: var(--color-text-muted); }
    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 1rem;
      color: var(--color-text);
    }
    .search-input::placeholder { color: var(--color-text-muted); }
    .search-close {
      padding: 0.25rem 0.5rem;
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      cursor: pointer;
    }
    .search-results {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .search-result {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: var(--color-text);
      text-decoration: none;
    }
    .search-result:hover, .search-result.selected { background: var(--color-bg-alt); text-decoration: none; }
    .search-result-title { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .search-result-snippet { font-size: 0.8125rem; color: var(--color-text-muted); }
    .search-empty { padding: 2rem 1rem; text-align: center; color: var(--color-text-muted); }
    .search-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-bg-alt);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .search-footer kbd {
      padding: 0.125rem 0.375rem;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-family: var(--font-mono);
    }
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      color: var(--color-text-muted);
      transition: background 0.15s, color 0.15s;
    }
    .theme-toggle:hover { background: var(--color-bg-alt); color: var(--color-text); }
    .theme-toggle svg { display: block; width: 20px; height: 20px; }
    .theme-toggle .icon-sun { display: none; }
    .theme-toggle .icon-moon { display: block; }
    [data-theme="dark"] .theme-toggle .icon-sun { display: block; }
    [data-theme="dark"] .theme-toggle .icon-moon { display: none; }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) .theme-toggle .icon-sun { display: block; }
      :root:not([data-theme="light"]) .theme-toggle .icon-moon { display: none; }
    }

    /* Layout */
    .layout {
      display: flex;
      padding-top: var(--header-height);
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--color-bg-alt);
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
      padding: 1.5rem 1rem;
    }
    .nav-section { margin-bottom: 1.5rem; }
    .nav-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
      padding: 0 0.75rem;
    }
    .nav-list { list-style: none; }
    .nav-item { margin: 0.125rem 0; }
    .nav-link {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--color-text);
      font-size: 0.875rem;
      transition: background 0.15s;
    }
    .nav-link:hover {
      background: var(--color-border);
      text-decoration: none;
    }
    .nav-link.active {
      background: var(--color-primary);
      color: white;
    }

    /* Main content */
    .main {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: 2rem;
      min-width: 0;
      overflow-x: hidden;
    }
    .content {
      max-width: var(--max-content-width);
      margin: 0 auto;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    }

    /* TOC (right sidebar) */
    .toc {
      position: fixed;
      top: calc(var(--header-height) + 2rem);
      right: 2rem;
      width: 200px;
      font-size: 0.8125rem;
    }
    .toc-title {
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--color-text-muted);
    }
    .toc-list { list-style: none; }
    .toc-item { margin: 0.375rem 0; }
    .toc-link {
      color: var(--color-text-muted);
      display: block;
      padding-left: calc((var(--depth, 1) - 1) * 0.75rem);
    }
    .toc-link:hover { color: var(--color-primary); }
    @media (max-width: 1200px) { .toc { display: none; } }

    /* Typography */
    .content h1 { font-size: 2.25rem; margin-bottom: 1rem; line-height: 1.2; }
    .content h2 { font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
    .content h3 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; }
    .content h4 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .content p { margin-bottom: 1rem; }
    .content ul, .content ol { margin: 1rem 0; padding-left: 1.5rem; }
    .content li { margin: 0.375rem 0; }
    .content blockquote {
      border-left: 4px solid var(--color-primary);
      padding: 0.5rem 1rem;
      margin: 1rem 0;
      background: var(--color-bg-alt);
      border-radius: 0 6px 6px 0;
    }
    .content code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      background: var(--color-bg-alt);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      word-break: break-all;
    }
    .content pre {
      background: var(--color-code-bg);
      color: var(--color-code-text);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      line-height: 1.5;
    }
    .content pre code {
      background: transparent;
      padding: 0;
      font-size: 0.8125rem;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.875rem;
    }
    .content th, .content td {
      border: 1px solid var(--color-border);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    .content th { background: var(--color-bg-alt); font-weight: 600; }
    .content img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
    .content img[alt*="Logo"] { max-width: 200px; display: block; margin: 1rem 0; }
    .content img[alt*="Architecture"] { max-width: 600px; }
    .content img[alt*="Benchmark"] { max-width: 680px; }
    .content hr { border: none; border-top: 1px solid var(--color-border); margin: 2rem 0; }

    /* Responsive */
    @media (max-width: 768px) {
      .menu-toggle { display: block; }
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 99;
        width: 280px;
      }
      .sidebar.open { transform: translateX(0); }
      .main { margin-left: 0; padding: 1rem 0.75rem; }
      .content { padding: 0 0.25rem; }
      .content h1 { font-size: 1.5rem; line-height: 1.3; margin-bottom: 0.75rem; }
      .content h2 { font-size: 1.2rem; margin-top: 2rem; }
      .content h3 { font-size: 1.1rem; }
      .content p { font-size: 0.9375rem; margin-bottom: 0.875rem; }
      .content ul, .content ol { padding-left: 1.25rem; font-size: 0.9375rem; }
      .content pre {
        padding: 0.75rem;
        font-size: 0.75rem;
        margin: 1rem -0.75rem;
        border-radius: 0;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .content code { font-size: 0.8125em; }
      .content table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        font-size: 0.8125rem;
        margin: 1rem -0.75rem;
        width: calc(100% + 1.5rem);
      }
      .content th, .content td { padding: 0.5rem 0.75rem; white-space: nowrap; }
      .content img { margin: 1rem 0; }
      .content img[alt*="Logo"] { max-width: 150px; }
      .content img[alt*="Architecture"] { max-width: 100%; }
      .content img[alt*="Benchmark"] { max-width: 100%; }
      .content blockquote { padding: 0.5rem 0.75rem; margin: 1rem 0; font-size: 0.9375rem; }
      .header { padding: 0 1rem; }
      .header-title { font-size: 1rem; }
      .header-title img { width: 24px; height: 24px; }
      .overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 98;
      }
      .overlay.open { display: block; }
    }

    /* Extra small devices */
    @media (max-width: 480px) {
      .main { padding: 0.75rem 0.5rem; }
      .content h1 { font-size: 1.35rem; }
      .content pre { font-size: 0.6875rem; padding: 0.625rem; }
      .content table { font-size: 0.75rem; }
      .content th, .content td { padding: 0.375rem 0.5rem; }
    }
  </style>
</head>
<body>
  <header class="header">
    <button class="menu-toggle" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    <a href="{{base}}index.html" class="header-title">
      <img src="{{base}}logo.svg" alt="" width="28" height="28" style="margin-right: 8px; vertical-align: middle;" />
      {{siteName}}
    </a>
    <div class="header-actions">
      <button class="search-button" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span>Search</span>
        <kbd>/</kbd>
      </button>
      <button class="theme-toggle" aria-label="Toggle theme">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </header>
  <div class="search-modal-overlay">
    <div class="search-modal">
      <div class="search-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input type="text" class="search-input" placeholder="Search documentation..." />
        <button class="search-close">Esc</button>
      </div>
      <div class="search-results"></div>
      <div class="search-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
        <span><kbd>Enter</kbd> to select</span>
        <span><kbd>Esc</kbd> to close</span>
      </div>
    </div>
  </div>
  <div class="overlay"></div>
  <div class="layout">
    <aside class="sidebar">
      <nav>
{{navigation}}
      </nav>
    </aside>
    <main class="main">
      <article class="content">
{{content}}
      </article>
    </main>
{{#hasToc}}
    <aside class="toc">
      <div class="toc-title">On this page</div>
      <ul class="toc-list">
{{toc}}
      </ul>
    </aside>
{{/hasToc}}
  </div>
  <script>
    // Menu toggle
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    if (toggle && sidebar && overlay) {
      const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });
      overlay.addEventListener('click', close);
      sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const getPreferredTheme = () => {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    const setTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    };
    // Initialize theme
    setTheme(getPreferredTheme());
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // Search functionality
    const searchButton = document.querySelector('.search-button');
    const searchOverlay = document.querySelector('.search-modal-overlay');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const searchClose = document.querySelector('.search-close');
    let searchIndex = null;
    let selectedIndex = 0;
    let results = [];

    const openSearch = () => {
      searchOverlay.classList.add('open');
      searchInput.focus();
    };
    const closeSearch = () => {
      searchOverlay.classList.remove('open');
      searchInput.value = '';
      searchResults.innerHTML = '';
      selectedIndex = 0;
      results = [];
    };

    // Load search index
    const loadSearchIndex = async () => {
      if (searchIndex) return;
      try {
        const res = await fetch('{{base}}search-index.json');
        searchIndex = await res.json();
      } catch (e) {
        console.warn('Failed to load search index:', e);
      }
    };

    // Tokenize query
    const tokenize = (text) => {
      const tokens = [];
      let current = '';
      for (const char of text) {
        const isCjk = /[\\u4E00-\\u9FFF\\u3400-\\u4DBF\\u3040-\\u309F\\u30A0-\\u30FF\\uAC00-\\uD7AF]/.test(char);
        if (isCjk) {
          if (current) { tokens.push(current.toLowerCase()); current = ''; }
          tokens.push(char);
        } else if (/[a-zA-Z0-9_]/.test(char)) {
          current += char;
        } else if (current) {
          tokens.push(current.toLowerCase());
          current = '';
        }
      }
      if (current) tokens.push(current.toLowerCase());
      return tokens;
    };

    // Perform search
    const performSearch = async (query) => {
      if (!query.trim()) {
        searchResults.innerHTML = '';
        results = [];
        return;
      }
      await loadSearchIndex();
      if (!searchIndex) {
        searchResults.innerHTML = '<div class="search-empty">Search index not available</div>';
        return;
      }

      const tokens = tokenize(query);
      if (!tokens.length) {
        searchResults.innerHTML = '';
        results = [];
        return;
      }

      const k1 = 1.2, b = 0.75;
      const docScores = new Map();

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isLast = i === tokens.length - 1;
        let matchingTerms = [];
        if (isLast && token.length >= 2) {
          matchingTerms = Object.keys(searchIndex.index).filter(t => t.startsWith(token));
        } else if (searchIndex.index[token]) {
          matchingTerms = [token];
        }

        for (const term of matchingTerms) {
          const postings = searchIndex.index[term] || [];
          const df = searchIndex.df[term] || 1;
          const idf = Math.log((searchIndex.doc_count - df + 0.5) / (df + 0.5) + 1.0);

          for (const posting of postings) {
            const doc = searchIndex.documents[posting.doc_idx];
            if (!doc) continue;
            const boost = posting.field === 'Title' ? 10 : posting.field === 'Heading' ? 5 : 1;
            const tf = posting.tf;
            const docLen = doc.body.length;
            const score = idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLen / searchIndex.avg_dl))) * boost;

            if (!docScores.has(posting.doc_idx)) {
              docScores.set(posting.doc_idx, { score: 0, matches: new Set() });
            }
            const entry = docScores.get(posting.doc_idx);
            entry.score += score;
            entry.matches.add(term);
          }
        }
      }

      results = Array.from(docScores.entries())
        .map(([docIdx, data]) => {
          const doc = searchIndex.documents[docIdx];
          let snippet = '';
          if (doc.body) {
            const bodyLower = doc.body.toLowerCase();
            let firstPos = -1;
            for (const match of data.matches) {
              const pos = bodyLower.indexOf(match);
              if (pos !== -1 && (firstPos === -1 || pos < firstPos)) firstPos = pos;
            }
            const start = Math.max(0, firstPos - 50);
            const end = Math.min(doc.body.length, start + 150);
            snippet = doc.body.slice(start, end);
            if (start > 0) snippet = '...' + snippet;
            if (end < doc.body.length) snippet += '...';
          }
          return { ...doc, score: data.score, snippet };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      selectedIndex = 0;
      renderResults();
    };

    const renderResults = () => {
      if (!results.length) {
        searchResults.innerHTML = '<div class="search-empty">No results found</div>';
        return;
      }
      searchResults.innerHTML = results.map((r, i) =>
        '<a href="' + r.url + '" class="search-result' + (i === selectedIndex ? ' selected' : '') + '">' +
        '<div class="search-result-title">' + r.title + '</div>' +
        (r.snippet ? '<div class="search-result-snippet">' + r.snippet + '</div>' : '') +
        '</a>'
      ).join('');
    };

    // Event listeners
    if (searchButton) searchButton.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    if (searchOverlay) searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(searchInput.value), 150);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
        else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (selectedIndex < results.length - 1) { selectedIndex++; renderResults(); }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedIndex > 0) { selectedIndex--; renderResults(); }
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          window.location.href = results[selectedIndex].url;
        }
      });
    }

    // Global keyboard shortcut (/ or Cmd+K)
    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' && !(e.target instanceof HTMLInputElement)) ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        openSearch();
      }
    });
  </script>
</body>
</html>`;

/**
 * Bare HTML template (no navigation, no styles).
 */
export const BARE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
</head>
<body>
{{content}}
</body>
</html>`;

/**
 * Resolves SSG options with defaults.
 */
export function resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions {
  if (ssg === false) {
    return {
      enabled: false,
      extension: ".html",
      clean: false,
      bare: false,
      generateOgImage: false,
    };
  }

  if (ssg === true || ssg === undefined) {
    return {
      enabled: true,
      extension: ".html",
      clean: false,
      bare: false,
      generateOgImage: false,
      theme: resolveTheme(undefined),
    };
  }

  return {
    enabled: ssg.enabled ?? true,
    extension: ssg.extension ?? ".html",
    clean: ssg.clean ?? false,
    bare: ssg.bare ?? false,
    siteName: ssg.siteName,
    ogImage: ssg.ogImage,
    generateOgImage: ssg.generateOgImage ?? false,
    siteUrl: ssg.siteUrl,
    theme: resolveTheme(ssg.theme),
  };
}

/**
 * Simple mustache-like template rendering.
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Handle conditionals: {{#key}}content{{/key}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    return data[key] ? content : "";
  });

  // Handle simple replacements: {{key}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return "";
  });

  return result;
}

/**
 * Extracts title from content or frontmatter.
 */
function extractTitle(content: string, frontmatter: Record<string, unknown>): string {
  if (frontmatter.title && typeof frontmatter.title === "string") {
    return frontmatter.title;
  }

  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return "Untitled";
}

/**
 * Generates navigation HTML from nav groups.
 */
function _generateNavHtml(navGroups: NavGroup[], currentPath: string): string {
  return navGroups
    .map((group) => {
      const items = group.items
        .map((item) => {
          const isActive = item.path === currentPath;
          const activeClass = isActive ? " active" : "";
          return `              <li class="nav-item"><a href="${item.href}" class="nav-link${activeClass}">${item.title}</a></li>`;
        })
        .join("\n");

      return `          <div class="nav-section">
            <div class="nav-title">${group.title}</div>
            <ul class="nav-list">
${items}
            </ul>
          </div>`;
    })
    .join("\n");
}

/**
 * Generates TOC HTML from toc entries.
 */
function _generateTocHtml(toc: TocEntry[]): string {
  const flattenToc = (entries: TocEntry[], depth = 1): string[] => {
    const items: string[] = [];
    for (const entry of entries) {
      items.push(
        `        <li class="toc-item"><a href="#${entry.slug}" class="toc-link" style="--depth: ${depth}">${entry.text}</a></li>`,
      );
      if (entry.children && entry.children.length > 0) {
        items.push(...flattenToc(entry.children, depth + 1));
      }
    }
    return items;
  };
  return flattenToc(toc).join("\n");
}

/**
 * Generates bare HTML page (no navigation, no styles).
 */
export function generateBareHtmlPage(content: string, title: string): string {
  return renderTemplate(BARE_HTML_TEMPLATE, {
    title,
    content,
  });
}

/**
 * Generates HTML page with navigation using Rust NAPI bindings.
 */
export async function generateHtmlPage(
  pageData: SsgPageData,
  navGroups: NavGroup[],
  siteName: string,
  base: string,
  ogImage?: string,
  theme?: ResolvedThemeConfig,
): Promise<string> {
  const mod = await import("@ox-content/napi");

  // Convert TocEntry to the format expected by Rust
  const tocForRust = pageData.toc.map((entry) => ({
    depth: entry.depth,
    text: entry.text,
    slug: entry.slug,
  }));

  // Convert NavGroup to the format expected by Rust
  const navGroupsForRust = navGroups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      title: item.title,
      path: item.path,
      href: item.href,
    })),
  }));

  // Convert theme to NAPI format if provided
  const themeForRust = theme ? themeToNapi(theme) : undefined;

  // Convert entry page to NAPI format if provided
  const entryPageForRust = pageData.entryPage
    ? {
        hero: pageData.entryPage.hero
          ? {
              name: pageData.entryPage.hero.name,
              text: pageData.entryPage.hero.text,
              tagline: pageData.entryPage.hero.tagline,
              image: pageData.entryPage.hero.image
                ? {
                    src: pageData.entryPage.hero.image.src,
                    alt: pageData.entryPage.hero.image.alt,
                    width: pageData.entryPage.hero.image.width,
                    height: pageData.entryPage.hero.image.height,
                  }
                : undefined,
              actions: pageData.entryPage.hero.actions?.map((a) => ({
                theme: a.theme,
                text: a.text,
                link: a.link,
              })),
            }
          : undefined,
        features: pageData.entryPage.features?.map((f) => ({
          icon: f.icon,
          title: f.title,
          details: f.details,
          link: f.link,
          linkText: f.linkText,
        })),
      }
    : undefined;

  return mod.generateSsgHtml(
    {
      title: pageData.title,
      description: pageData.description,
      content: pageData.content,
      toc: tocForRust,
      path: pageData.path,
      entryPage: entryPageForRust,
    },
    navGroupsForRust,
    {
      siteName,
      base,
      ogImage,
      theme: themeForRust,
    },
  );
}

/**
 * Converts a markdown file path to its corresponding HTML output path.
 */
export function getOutputPath(
  inputPath: string,
  srcDir: string,
  outDir: string,
  extension: string,
): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, extension);

  if (baseName.endsWith(`index${extension}`)) {
    return path.join(outDir, baseName);
  }

  const dirName = baseName.replace(new RegExp(`\\${extension}$`), "");
  return path.join(outDir, dirName, `index${extension}`);
}

/**
 * Converts a markdown file path to a relative URL path.
 */
function getUrlPath(inputPath: string, srcDir: string): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, "");

  if (baseName === "index" || baseName.endsWith("/index")) {
    return baseName.replace(/\/?index$/, "") || "/";
  }

  return baseName;
}

/**
 * Converts a markdown file path to an href.
 */
function getHref(inputPath: string, srcDir: string, base: string, extension: string): string {
  const urlPath = getUrlPath(inputPath, srcDir);
  if (urlPath === "/" || urlPath === "") {
    return `${base}index${extension}`;
  }
  return `${base}${urlPath}/index${extension}`;
}

/**
 * Gets the OG image output path for a given markdown file.
 */
function getOgImagePath(inputPath: string, srcDir: string, outDir: string): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, "");

  if (baseName === "index" || baseName.endsWith("/index")) {
    const dirPath = baseName.replace(/\/?index$/, "") || "";
    return path.join(outDir, dirPath, "og-image.png");
  }

  return path.join(outDir, baseName, "og-image.png");
}

/**
 * Gets the OG image URL for use in meta tags.
 * If siteUrl is provided, returns an absolute URL (required for SNS sharing).
 */
function getOgImageUrl(inputPath: string, srcDir: string, base: string, siteUrl?: string): string {
  const urlPath = getUrlPath(inputPath, srcDir);
  let relativePath: string;
  if (urlPath === "/" || urlPath === "") {
    relativePath = `${base}og-image.png`;
  } else {
    relativePath = `${base}${urlPath}/og-image.png`;
  }

  // Return absolute URL if siteUrl is provided
  if (siteUrl) {
    const cleanSiteUrl = siteUrl.replace(/\/$/, "");
    return `${cleanSiteUrl}${relativePath}`;
  }

  return relativePath;
}

/**
 * Gets display title from file path.
 */
function getDisplayTitle(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));

  if (fileName === "index") {
    const dirName = path.basename(path.dirname(filePath));
    if (dirName && dirName !== ".") {
      return formatTitle(dirName);
    }
    return "Home";
  }

  return formatTitle(fileName);
}

/**
 * Formats a file/dir name as a title.
 */
function formatTitle(name: string): string {
  return name
    .replace(/[-_]([a-z])/g, (_, char) => " " + char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Collects all markdown files from the source directory.
 */
export async function collectMarkdownFiles(srcDir: string): Promise<string[]> {
  const pattern = path.join(srcDir, "**/*.{md,markdown}");
  const files = await glob(pattern, {
    nodir: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
  });
  return files.sort();
}

/**
 * Navigation group for hierarchical navigation.
 */
interface NavGroup {
  title: string;
  items: SsgNavItem[];
}

/**
 * Builds navigation items from markdown files, grouped by directory.
 */
function buildNavItems(
  markdownFiles: string[],
  srcDir: string,
  base: string,
  extension: string,
): NavGroup[] {
  const groups = new Map<string, SsgNavItem[]>();

  // Define the order of groups (api at the bottom)
  const groupOrder = ["", "examples", "packages", "api"];

  for (const file of markdownFiles) {
    const relativePath = path.relative(srcDir, file);
    const parts = relativePath.split(path.sep);

    // Determine group: first directory or '' for root files
    let groupKey = "";
    if (parts.length > 1) {
      groupKey = parts[0];
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    const urlPath = getUrlPath(file, srcDir);

    // Use "Overview" for root index.md, otherwise use getDisplayTitle
    let title: string;
    if (urlPath === "/" || urlPath === "") {
      title = "Overview";
    } else {
      title = getDisplayTitle(file);
    }

    groups.get(groupKey)!.push({
      title,
      path: urlPath,
      href: getHref(file, srcDir, base, extension),
    });
  }

  // Sort items within each group: index files first, then alphabetically
  const sortItems = (items: SsgNavItem[]) => {
    return items.sort((a, b) => {
      // Root index (Overview) comes first
      const aIsRoot = a.path === "/" || a.path === "";
      const bIsRoot = b.path === "/" || b.path === "";
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;
      // Otherwise, maintain alphabetical order by title
      return a.title.localeCompare(b.title);
    });
  };

  // Convert to array and sort by group order
  const result: NavGroup[] = [];

  for (const key of groupOrder) {
    const items = groups.get(key);
    if (items && items.length > 0) {
      result.push({
        title: key === "" ? "Guide" : formatTitle(key),
        items: sortItems(items),
      });
      groups.delete(key);
    }
  }

  // Add any remaining groups
  for (const [key, items] of groups) {
    if (items.length > 0) {
      result.push({
        title: formatTitle(key),
        items: sortItems(items),
      });
    }
  }

  return result;
}

/**
 * Builds all markdown files to static HTML.
 */
export async function buildSsg(
  options: ResolvedOptions,
  root: string,
): Promise<{ files: string[]; errors: string[] }> {
  const ssgOptions = options.ssg;
  if (!ssgOptions.enabled) {
    return { files: [], errors: [] };
  }

  const srcDir = path.resolve(root, options.srcDir);
  const outDir = path.resolve(root, options.outDir);
  const base = options.base.endsWith("/") ? options.base : options.base + "/";
  const generatedFiles: string[] = [];
  const errors: string[] = [];

  // Clean output directory if requested
  if (ssgOptions.clean) {
    try {
      await fs.rm(outDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  }

  // Collect markdown files
  const markdownFiles = await collectMarkdownFiles(srcDir);

  // Build navigation
  const navItems = buildNavItems(markdownFiles, srcDir, base, ssgOptions.extension);

  // Get site name from options or package.json
  let siteName = ssgOptions.siteName ?? "Documentation";
  if (!ssgOptions.siteName) {
    try {
      const pkgPath = path.join(root, "package.json");
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
      if (pkg.name) {
        siteName = formatTitle(pkg.name);
      }
    } catch {
      // Use default
    }
  }

  // Collect OG image entries for batch rendering
  const ogImageEntries: OgImagePageEntry[] = [];
  // Map from inputPath to OG image URL (filled after batch render)
  const ogImageUrlMap = new Map<string, string>();

  // Determine if OG images should be generated
  const shouldGenerateOgImages =
    (options.ogImage || ssgOptions.generateOgImage) && !ssgOptions.bare;

  // Collect page metadata for OG image generation
  interface PageProcessResult {
    inputPath: string;
    transformedHtml: string;
    title: string;
    description?: string;
    frontmatter: Record<string, unknown>;
    toc: TocEntry[];
  }
  const pageResults: PageProcessResult[] = [];

  // Process each file: transform markdown and collect metadata
  for (const inputPath of markdownFiles) {
    try {
      const content = await fs.readFile(inputPath, "utf-8");
      // Pass SSG options to transform for .md -> .html link conversion in Rust
      // The sourcePath is used to determine if the file is an index file for correct relative link resolution
      const result = await transformMarkdown(content, inputPath, options, {
        convertMdLinks: true,
        baseUrl: base,
        sourcePath: inputPath,
      });

      // Apply built-in plugin transformations (No-JS First)
      let transformedHtml = result.html;

      // Protect mermaid SVGs from rehype processing in plugins
      const { html: protectedHtml, svgs: mermaidSvgs } =
        protectMermaidSvgs(transformedHtml);
      transformedHtml = protectedHtml;

      // Transform Tabs, YouTube, GitHub, OGP, Mermaid plugins
      const pluginOptions: TransformAllOptions = {
        tabs: true,
        youtube: true,
        github: true,
        ogp: true,
        mermaid: true,
        githubToken: process.env.GITHUB_TOKEN,
      };
      transformedHtml = await transformAllPlugins(transformedHtml, pluginOptions);

      // Transform Island components
      if (hasIslands(transformedHtml)) {
        const islandResult = await transformIslands(transformedHtml);
        transformedHtml = islandResult.html;
      }

      // Restore protected mermaid SVGs
      transformedHtml = restoreMermaidSvgs(transformedHtml, mermaidSvgs);

      const title = extractTitle(transformedHtml, result.frontmatter);
      const description = result.frontmatter.description as string | undefined;

      pageResults.push({
        inputPath,
        transformedHtml,
        title,
        description,
        frontmatter: result.frontmatter,
        toc: result.toc,
      });

      // Collect OG image entry if generation is enabled
      if (shouldGenerateOgImages) {
        const ogImageOutputPath = getOgImagePath(inputPath, srcDir, outDir);
        const { layout: _layout, ...frontmatterRest } = result.frontmatter;
        ogImageEntries.push({
          props: {
            ...frontmatterRest,
            title,
            description,
            siteName,
          },
          outputPath: ogImageOutputPath,
        });
        // Pre-compute URL so HTML can reference it
        ogImageUrlMap.set(
          inputPath,
          getOgImageUrl(inputPath, srcDir, base, ssgOptions.siteUrl),
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to process ${inputPath}: ${errorMessage}`);
    }
  }

  // Batch generate OG images (Chromium-based)
  if (shouldGenerateOgImages && ogImageEntries.length > 0) {
    try {
      const ogResults = await generateOgImages(
        ogImageEntries,
        options.ogImageOptions,
        root,
      );
      let ogSuccessCount = 0;
      for (const result of ogResults) {
        if (result.error) {
          errors.push(`OG image failed for ${result.outputPath}: ${result.error}`);
        } else {
          generatedFiles.push(result.outputPath);
          ogSuccessCount++;
        }
      }
      if (ogSuccessCount > 0) {
        const cachedCount = ogResults.filter((r) => r.cached && !r.error).length;
        console.log(
          `[ox-content:og-image] Generated ${ogSuccessCount} OG images` +
            (cachedCount > 0 ? ` (${cachedCount} from cache)` : ""),
        );
      }
    } catch (err) {
      // Non-fatal: OG image failures never block the SSG build
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[ox-content:og-image] Batch generation failed: ${errorMessage}`);
    }
  }

  // Generate HTML pages
  for (const pageResult of pageResults) {
    try {
      const { inputPath, transformedHtml, title, description, frontmatter, toc } = pageResult;

      // Determine OG image URL for this page
      let pageOgImage = ssgOptions.ogImage; // fallback to static URL
      if (shouldGenerateOgImages && ogImageUrlMap.has(inputPath)) {
        pageOgImage = ogImageUrlMap.get(inputPath);
      }

      // Check if this is an entry page (layout: entry)
      let entryPage: SsgEntryPageConfig | undefined;
      if (frontmatter.layout === "entry") {
        entryPage = {
          hero: frontmatter.hero as HeroConfig | undefined,
          features: frontmatter.features as FeatureConfig[] | undefined,
        };
      }

      // Generate HTML based on bare option
      let html: string;
      if (ssgOptions.bare) {
        html = generateBareHtmlPage(transformedHtml, title);
      } else {
        const pageData: SsgPageData = {
          title,
          description,
          content: transformedHtml,
          toc,
          frontmatter,
          path: getUrlPath(inputPath, srcDir),
          href: getHref(inputPath, srcDir, base, ssgOptions.extension),
          entryPage,
        };
        html = await generateHtmlPage(pageData, navItems, siteName, base, pageOgImage, ssgOptions.theme);
      }

      // Write output file
      const outputPath = getOutputPath(inputPath, srcDir, outDir, ssgOptions.extension);

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html, "utf-8");

      generatedFiles.push(outputPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to generate HTML for ${pageResult.inputPath}: ${errorMessage}`);
    }
  }

  return { files: generatedFiles, errors };
}
