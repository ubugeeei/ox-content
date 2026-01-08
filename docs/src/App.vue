<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { apiNav } from '../api/nav';

// Search state
const searchQuery = ref('');
const searchResults = ref<Array<{ id: string; title: string; url: string; score: number; snippet: string }>>([]);
const showSearchModal = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);
let searchIndex: any = null;
let searchTimeout: number | null = null;

// BM25 scoring
function computeIdf(df: number, docCount: number): number {
  return Math.log((docCount - df + 0.5) / (df + 0.5) + 1.0);
}

function getFieldBoost(field: string): number {
  switch (field) {
    case 'Title': return 10.0;
    case 'Heading': return 5.0;
    case 'Body': return 1.0;
    case 'Code': return 0.5;
    default: return 1.0;
  }
}

// Tokenizer for queries
function tokenizeQuery(text: string): string[] {
  const tokens: string[] = [];
  let current = '';

  for (const char of text) {
    const isCjk = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(char);

    if (isCjk) {
      if (current) {
        tokens.push(current.toLowerCase());
        current = '';
      }
      tokens.push(char);
    } else if (/[a-zA-Z0-9_]/.test(char)) {
      current += char;
    } else if (current) {
      tokens.push(current.toLowerCase());
      current = '';
    }
  }

  if (current) {
    tokens.push(current.toLowerCase());
  }

  return tokens;
}

// Load search index
async function loadSearchIndex() {
  if (searchIndex) return;

  try {
    const base = import.meta.env.BASE_URL || '/ox-content/';
    const res = await fetch(`${base}search-index.json`);
    searchIndex = await res.json();
  } catch (err) {
    console.warn('[ox-content] Failed to load search index:', err);
  }
}

// Search function
async function performSearch(query: string) {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  await loadSearchIndex();

  if (!searchIndex) {
    searchResults.value = [];
    return;
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    searchResults.value = [];
    return;
  }

  const k1 = 1.2;
  const b = 0.75;
  const docScores = new Map<number, { score: number; matches: Set<string> }>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const isLast = i === tokens.length - 1;

    // Find matching terms
    let matchingTerms: string[] = [];
    if (isLast && token.length >= 2) {
      matchingTerms = Object.keys(searchIndex.index).filter((term: string) => term.startsWith(token));
    } else if (searchIndex.index[token]) {
      matchingTerms = [token];
    }

    for (const term of matchingTerms) {
      const postings = searchIndex.index[term] || [];
      const df = searchIndex.df[term] || 1;
      const idf = computeIdf(df, searchIndex.doc_count);

      for (const posting of postings) {
        const doc = searchIndex.documents[posting.doc_idx];
        if (!doc) continue;

        const docLen = doc.body.length;
        const tf = posting.tf;
        const boost = getFieldBoost(posting.field);

        const score = idf * ((tf * (k1 + 1.0)) / (tf + k1 * (1.0 - b + b * docLen / searchIndex.avg_dl))) * boost;

        if (!docScores.has(posting.doc_idx)) {
          docScores.set(posting.doc_idx, { score: 0, matches: new Set() });
        }
        const entry = docScores.get(posting.doc_idx)!;
        entry.score += score;
        entry.matches.add(term);
      }
    }
  }

  // Convert to results
  const results = Array.from(docScores.entries())
    .map(([docIdx, data]) => {
      const doc = searchIndex.documents[docIdx];
      const matches = Array.from(data.matches);

      // Generate snippet
      let snippet = '';
      if (doc.body) {
        const bodyLower = doc.body.toLowerCase();
        let firstPos = -1;
        for (const match of matches) {
          const pos = bodyLower.indexOf(match);
          if (pos !== -1 && (firstPos === -1 || pos < firstPos)) {
            firstPos = pos;
          }
        }

        const start = Math.max(0, firstPos - 50);
        const end = Math.min(doc.body.length, start + 150);
        snippet = doc.body.slice(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < doc.body.length) snippet = snippet + '...';
      }

      return {
        id: doc.id,
        title: doc.title,
        url: doc.url,
        score: data.score,
        snippet,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  searchResults.value = results;
  selectedIndex.value = 0;
}

// Debounced search
function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = window.setTimeout(() => {
    performSearch(searchQuery.value);
  }, 150);
}

// Open search modal
function openSearch() {
  showSearchModal.value = true;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
}

// Close search modal
function closeSearch() {
  showSearchModal.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  selectedIndex.value = 0;
}

// Handle keyboard navigation in search
function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeSearch();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++;
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    }
  } else if (e.key === 'Enter' && searchResults.value[selectedIndex.value]) {
    e.preventDefault();
    navigateToResult(searchResults.value[selectedIndex.value]);
  }
}

// Navigate to search result
function navigateToResult(result: { url: string }) {
  const path = result.url.replace(/^\/ox-content/, '');
  navigate(path);
  closeSearch();
}

// Global keyboard shortcut
function handleGlobalKeydown(e: KeyboardEvent) {
  // Open search with / or Cmd/Ctrl+K
  if (
    (e.key === '/' && !showSearchModal.value && !(e.target instanceof HTMLInputElement)) ||
    ((e.metaKey || e.ctrlKey) && e.key === 'k')
  ) {
    e.preventDefault();
    openSearch();
  }
}

// Navigation structure
const nav = [
  { title: 'Guide', path: '/', file: () => import('../index.md') },
  { title: 'Getting Started', path: '/getting-started', file: () => import('../getting-started.md') },
  { title: 'Architecture', path: '/architecture', file: () => import('../architecture.md') },
  {
    title: 'Packages',
    children: [
      { title: 'vite-plugin-ox-content', path: '/packages/vite-plugin', file: () => import('../packages/vite-plugin-ox-content.md') },
      { title: 'Vue Integration', path: '/packages/vue', file: () => import('../packages/vite-plugin-ox-content-vue.md') },
      { title: 'React Integration', path: '/packages/react', file: () => import('../packages/vite-plugin-ox-content-react.md') },
      { title: 'Svelte Integration', path: '/packages/svelte', file: () => import('../packages/vite-plugin-ox-content-svelte.md') },
    ],
  },
  {
    title: 'API Reference',
    children: apiNav.map((item) => ({
      ...item,
      file: () => import(`../api/${item.path.split('/').pop()}.md`),
    })),
  },
  {
    title: 'Examples',
    children: [
      { title: 'Basic SSG', path: '/examples/ssg-vite', file: () => import('../examples/ssg-vite.md') },
      { title: 'Vue Integration', path: '/examples/integ-vue', file: () => import('../examples/integ-vue.md') },
      { title: 'React Integration', path: '/examples/integ-react', file: () => import('../examples/integ-react.md') },
      { title: 'Svelte Integration', path: '/examples/integ-svelte', file: () => import('../examples/integ-svelte.md') },
    ],
  },
];

const currentPath = ref(window.location.hash.slice(1) || '/');
const content = ref<{ html: string; frontmatter: Record<string, unknown>; toc: any[] } | null>(null);
const sidebarOpen = ref(false);

function findNavItem(items: any[], path: string): any {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findNavItem(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

async function loadContent(path: string) {
  const item = findNavItem(nav, path);
  if (item?.file) {
    try {
      const mod = await item.file();
      content.value = mod.default || mod;
    } catch (e) {
      content.value = { html: '<p>Page not found</p>', frontmatter: {}, toc: [] };
    }
  }
}

function navigate(path: string) {
  currentPath.value = path;
  window.location.hash = path;
  loadContent(path);
  sidebarOpen.value = false;
}

onMounted(() => {
  loadContent(currentPath.value);
  window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash.slice(1) || '/';
    loadContent(currentPath.value);
  });

  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const pageTitle = computed(() => {
  const item = findNavItem(nav, currentPath.value);
  return item?.title || 'Ox Content';
});
</script>

<template>
  <div class="Layout">
    <!-- Nav Bar -->
    <nav class="OXNav">
      <div class="OXNavBar">
        <div class="container">
          <div class="title">
            <a href="#/" class="logo" @click.prevent="navigate('/')">
              <span class="logo-icon">OX</span>
              <span class="logo-text">Ox Content</span>
            </a>
          </div>
          <div class="content">
            <div class="curtain" />
            <div class="content-body">
              <div class="OXNavBarSearch">
                <button class="search-button" @click="openSearch" aria-label="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span class="search-text">Search</span>
                  <span class="search-shortcut">
                    <kbd>/</kbd>
                  </span>
                </button>
              </div>
              <nav class="OXNavBarMenu">
                <a href="#/" class="OXNavBarMenuLink" @click.prevent="navigate('/')">Guide</a>
                <a href="https://github.com/ubugeeei/ox-content" target="_blank" class="OXNavBarMenuLink">GitHub</a>
              </nav>
              <div class="OXNavBarAppearance" />
            </div>
          </div>
          <div class="hamburger" :class="{ active: sidebarOpen }" @click="sidebarOpen = !sidebarOpen">
            <span class="top" />
            <span class="middle" />
            <span class="bottom" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="OXSidebar" :class="{ open: sidebarOpen }">
      <div class="curtain" @click="sidebarOpen = false" />
      <nav class="nav">
        <template v-for="group in nav" :key="group.path || group.title">
          <div class="group" v-if="group.children">
            <p class="title">{{ group.title }}</p>
            <div class="items">
              <a
                v-for="item in group.children"
                :key="item.path"
                :href="'#' + item.path"
                class="link"
                :class="{ active: currentPath === item.path }"
                @click.prevent="navigate(item.path)"
              >
                {{ item.title }}
              </a>
            </div>
          </div>
          <div class="group" v-else>
            <a
              :href="'#' + group.path"
              class="link"
              :class="{ active: currentPath === group.path }"
              @click.prevent="navigate(group.path)"
            >
              {{ group.title }}
            </a>
          </div>
        </template>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="OXContent">
      <div class="OXDoc">
        <div class="container">
          <div class="content">
            <div class="content-container">
              <article class="main" v-if="content">
                <div class="ox-doc" v-html="content.html" />
              </article>
              <div v-else class="loading">Loading...</div>
            </div>
          </div>

          <!-- TOC -->
          <div class="aside" v-if="content?.toc?.length">
            <div class="aside-container">
              <div class="aside-content">
                <nav class="OXDocAsideOutline">
                  <div class="content">
                    <div class="outline-title">On this page</div>
                    <nav class="outline-nav">
                      <a
                        v-for="item in content.toc"
                        :key="item.slug"
                        :href="'#' + item.slug"
                        class="outline-link"
                        :class="'level-' + item.depth"
                      >
                        {{ item.text }}
                      </a>
                    </nav>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Search Modal -->
    <Teleport to="body">
      <div v-if="showSearchModal" class="search-modal-overlay" @click.self="closeSearch">
        <div class="search-modal">
          <div class="search-modal-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search documentation..."
              @input="onSearchInput"
              @keydown="handleSearchKeydown"
            />
            <button class="search-close" @click="closeSearch">
              <kbd>Esc</kbd>
            </button>
          </div>
          <div class="search-results" v-if="searchResults.length > 0">
            <a
              v-for="(result, index) in searchResults"
              :key="result.id"
              :href="'#' + result.url.replace(/^\/ox-content/, '')"
              class="search-result"
              :class="{ selected: index === selectedIndex }"
              @click.prevent="navigateToResult(result)"
              @mouseenter="selectedIndex = index"
            >
              <div class="result-title">{{ result.title }}</div>
              <div class="result-snippet" v-if="result.snippet">{{ result.snippet }}</div>
            </a>
          </div>
          <div class="search-empty" v-else-if="searchQuery && !searchResults.length">
            <p>No results found for "{{ searchQuery }}"</p>
          </div>
          <div class="search-footer">
            <span class="search-hint">
              <kbd class="arrow-key">&uarr;</kbd>
              <kbd class="arrow-key">&darr;</kbd>
              to navigate
            </span>
            <span class="search-hint">
              <kbd>Enter</kbd>
              to select
            </span>
            <span class="search-hint">
              <kbd>Esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
:root {
  --ox-c-brand-1: #bd34fe;
  --ox-c-brand-2: #a855f7;
  --ox-c-brand-3: #9333ea;
  --ox-c-brand-soft: rgba(189, 52, 254, 0.14);

  --ox-c-bg: #1b1b1f;
  --ox-c-bg-soft: #222224;
  --ox-c-bg-mute: #2a2a2d;
  --ox-c-bg-alt: #161618;

  --ox-c-text-1: rgba(255, 255, 245, 0.86);
  --ox-c-text-2: rgba(235, 235, 245, 0.6);
  --ox-c-text-3: rgba(235, 235, 245, 0.38);

  --ox-c-divider: rgba(82, 82, 89, 0.32);
  --ox-c-border: rgba(82, 82, 89, 0.68);

  --ox-c-green-1: #3dd68c;
  --ox-c-green-soft: rgba(61, 214, 140, 0.14);

  --ox-sidebar-width: 272px;
  --ox-nav-height: 64px;

  --ox-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --ox-font-family-mono: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, 'Courier New', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--ox-nav-height) + 24px);
}

body {
  font-family: var(--ox-font-family-base);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--ox-c-text-1);
  background-color: var(--ox-c-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

.Layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Nav */
.OXNav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: var(--ox-nav-height);
  background-color: var(--ox-c-bg);
  border-bottom: 1px solid var(--ox-c-divider);
}

.OXNavBar {
  height: 100%;
}

.OXNavBar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  height: 100%;
  padding: 0 24px 0 24px;
}

.OXNavBar .title {
  flex-shrink: 0;
}

.OXNavBar .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.OXNavBar .logo-icon {
  background: linear-gradient(135deg, var(--ox-c-brand-1) 0%, #41d1ff 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
}

.OXNavBar .logo-text {
  color: var(--ox-c-text-1);
}

.OXNavBar .content {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.OXNavBar .content-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.OXNavBarMenu {
  display: flex;
  gap: 24px;
}

.OXNavBarMenuLink {
  color: var(--ox-c-text-1);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.OXNavBarMenuLink:hover {
  color: var(--ox-c-brand-1);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--ox-c-text-1);
  transition: all 0.25s;
}

/* Sidebar */
.OXSidebar {
  position: fixed;
  top: var(--ox-nav-height);
  bottom: 0;
  left: 0;
  z-index: 30;
  width: var(--ox-sidebar-width);
  padding: 32px 32px 96px;
  background-color: var(--ox-c-bg-alt);
  overflow-y: auto;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.OXSidebar .nav {
  width: 100%;
}

.OXSidebar .group {
  margin-bottom: 24px;
}

.OXSidebar .title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ox-c-text-1);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.OXSidebar .items {
  display: flex;
  flex-direction: column;
}

.OXSidebar .link {
  display: block;
  padding: 6px 0;
  color: var(--ox-c-text-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.OXSidebar .link:hover {
  color: var(--ox-c-text-1);
}

.OXSidebar .link.active {
  color: var(--ox-c-brand-1);
}

/* Content */
.OXContent {
  flex: 1;
  padding-top: var(--ox-nav-height);
  padding-left: var(--ox-sidebar-width);
}

.OXDoc .container {
  display: flex;
  margin: 0 auto;
  max-width: 1440px;
}

.OXDoc .content {
  flex: 1;
  min-width: 0;
  padding: 48px 32px 96px;
  max-width: 784px;
  overflow-x: hidden;
}

.OXDoc .content-container {
  margin: 0 auto;
}

.OXDoc .aside {
  flex-shrink: 0;
  width: 224px;
  padding: 48px 32px 32px 0;
}

.OXDoc .aside-container {
  position: sticky;
  top: calc(var(--ox-nav-height) + 32px);
}

/* TOC */
.OXDocAsideOutline .outline-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ox-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.OXDocAsideOutline .outline-nav {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--ox-c-divider);
}

.OXDocAsideOutline .outline-link {
  display: block;
  padding: 4px 0 4px 16px;
  color: var(--ox-c-text-2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.25s;
}

.OXDocAsideOutline .outline-link:hover {
  color: var(--ox-c-text-1);
}

.OXDocAsideOutline .outline-link.level-3 {
  padding-left: 28px;
}

.OXDocAsideOutline .outline-link.level-4 {
  padding-left: 40px;
}

/* VitePress Doc Styles */
.ox-doc {
  font-size: 16px;
  line-height: 1.7;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.ox-doc h1 {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 0;
  letter-spacing: -0.02em;
}

.ox-doc h1 + p {
  margin-top: 16px;
  font-size: 18px;
  color: var(--ox-c-text-2);
}

.ox-doc h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  margin: 48px 0 16px;
  padding-top: 24px;
  border-top: 1px solid var(--ox-c-divider);
  letter-spacing: -0.02em;
}

.ox-doc h2:first-child {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.ox-doc h3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  margin: 32px 0 8px;
  letter-spacing: -0.01em;
}

.ox-doc h4 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  margin: 24px 0 8px;
}

.ox-doc p {
  margin: 16px 0;
  color: var(--ox-c-text-1);
}

.ox-doc a {
  color: var(--ox-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.25s;
}

.ox-doc a:hover {
  color: var(--ox-c-brand-2);
  text-decoration: underline;
}

.ox-doc strong {
  font-weight: 600;
}

.ox-doc code {
  font-family: var(--ox-font-family-mono);
  font-size: 0.875em;
  background-color: var(--ox-c-bg-mute);
  padding: 3px 6px;
  border-radius: 4px;
  word-break: break-all;
}

.ox-doc pre {
  margin: 16px 0;
  padding: 20px 24px;
  background-color: var(--ox-c-bg-alt);
  border-radius: 8px;
  overflow-x: auto;
}

.ox-doc pre code {
  background: none;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
}

.ox-doc ul,
.ox-doc ol {
  margin: 16px 0;
  padding-left: 24px;
}

.ox-doc li {
  margin: 8px 0;
}

.ox-doc li::marker {
  color: var(--ox-c-text-3);
}

.ox-doc blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: var(--ox-c-bg-soft);
  border-left: 4px solid var(--ox-c-brand-1);
  border-radius: 4px;
}

.ox-doc blockquote p {
  margin: 0;
  color: var(--ox-c-text-2);
}

.ox-doc hr {
  margin: 32px 0;
  border: none;
  border-top: 1px solid var(--ox-c-divider);
}

.ox-doc table {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ox-doc th,
.ox-doc td {
  padding: 12px 16px;
  text-align: left;
  border: 1px solid var(--ox-c-divider);
}

.ox-doc th {
  background-color: var(--ox-c-bg-soft);
  font-weight: 600;
}

.ox-doc img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

/* Shiki Theme Override */
.ox-doc pre .shiki {
  background-color: transparent !important;
}

/* Loading */
.loading {
  padding: 48px;
  color: var(--ox-c-text-2);
}

/* Responsive */
@media (max-width: 1280px) {
  .OXDoc .aside {
    display: none;
  }
}

/* Search Button */
.OXNavBarSearch {
  display: flex;
  align-items: center;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--ox-c-bg-soft);
  border: 1px solid var(--ox-c-divider);
  border-radius: 8px;
  color: var(--ox-c-text-2);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s;
}

.search-button:hover {
  border-color: var(--ox-c-brand-1);
  color: var(--ox-c-text-1);
}

.search-text {
  display: none;
}

.search-shortcut {
  display: none;
}

@media (min-width: 640px) {
  .search-button {
    padding: 8px 12px;
    min-width: 180px;
    justify-content: flex-start;
  }

  .search-text {
    display: inline;
  }

  .search-shortcut {
    display: inline;
    margin-left: auto;
  }
}

.search-shortcut kbd {
  padding: 2px 6px;
  background-color: var(--ox-c-bg-mute);
  border-radius: 4px;
  font-family: var(--ox-font-family-mono);
  font-size: 12px;
}

/* Search Modal */
.search-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 100%;
  max-width: 600px;
  margin: 0 16px;
  background-color: var(--ox-c-bg);
  border: 1px solid var(--ox-c-divider);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.search-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--ox-c-divider);
}

.search-icon {
  flex-shrink: 0;
  color: var(--ox-c-text-3);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--ox-c-text-1);
}

.search-input::placeholder {
  color: var(--ox-c-text-3);
}

.search-close {
  flex-shrink: 0;
  padding: 4px 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.search-close kbd {
  padding: 4px 8px;
  background-color: var(--ox-c-bg-soft);
  border: 1px solid var(--ox-c-divider);
  border-radius: 4px;
  color: var(--ox-c-text-2);
  font-family: var(--ox-font-family-mono);
  font-size: 12px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.search-result {
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--ox-c-text-1);
  cursor: pointer;
  transition: background-color 0.15s;
}

.search-result:hover,
.search-result.selected {
  background-color: var(--ox-c-bg-soft);
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.result-snippet {
  font-size: 13px;
  color: var(--ox-c-text-2);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--ox-c-text-2);
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--ox-c-divider);
  background-color: var(--ox-c-bg-soft);
}

.search-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ox-c-text-3);
}

.search-hint kbd {
  padding: 2px 6px;
  background-color: var(--ox-c-bg);
  border: 1px solid var(--ox-c-divider);
  border-radius: 4px;
  font-family: var(--ox-font-family-mono);
  font-size: 11px;
}

.search-hint kbd.arrow-key {
  padding: 2px 4px;
}

/* Mobile search modal adjustments */
@media (max-width: 640px) {
  .search-modal-overlay {
    padding-top: 0;
    align-items: stretch;
  }

  .search-modal {
    margin: 0;
    max-width: 100%;
    border-radius: 0;
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .search-modal-header {
    padding: 12px;
    gap: 8px;
  }

  .search-results {
    flex: 1;
    max-height: none;
  }

  .search-footer {
    gap: 8px;
    padding: 8px 12px;
    flex-wrap: wrap;
  }

  .search-hint {
    font-size: 11px;
  }

  .search-hint:first-child {
    display: none;
  }
}

@media (max-width: 960px) {
  .OXNavBarMenu {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .OXContent {
    padding-left: 0;
  }

  .OXSidebar {
    transform: translateX(-100%);
    width: 100%;
    max-width: 320px;
    background-color: var(--ox-c-bg);
  }

  .OXSidebar.open {
    transform: translateX(0);
  }

  .OXSidebar .curtain {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }

  .OXSidebar.open .curtain {
    opacity: 1;
    pointer-events: auto;
  }

  .OXDoc .content {
    padding: 24px 24px 96px;
  }
}
</style>
