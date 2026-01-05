<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiNav } from '../api/nav';

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
});

const pageTitle = computed(() => {
  const item = findNavItem(nav, currentPath.value);
  return item?.title || 'Ox Content';
});
</script>

<template>
  <div class="Layout">
    <!-- Nav Bar -->
    <nav class="VPNav">
      <div class="VPNavBar">
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
              <div class="VPNavBarSearch" />
              <nav class="VPNavBarMenu">
                <a href="#/" class="VPNavBarMenuLink" @click.prevent="navigate('/')">Guide</a>
                <a href="https://github.com/ubugeeei/ox-content" target="_blank" class="VPNavBarMenuLink">GitHub</a>
              </nav>
              <div class="VPNavBarAppearance" />
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
    <aside class="VPSidebar" :class="{ open: sidebarOpen }">
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
    <main class="VPContent">
      <div class="VPDoc">
        <div class="container">
          <div class="content">
            <div class="content-container">
              <article class="main" v-if="content">
                <div class="vp-doc" v-html="content.html" />
              </article>
              <div v-else class="loading">Loading...</div>
            </div>
          </div>

          <!-- TOC -->
          <div class="aside" v-if="content?.toc?.length">
            <div class="aside-container">
              <div class="aside-content">
                <nav class="VPDocAsideOutline">
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
  </div>
</template>

<style>
:root {
  --vp-c-brand-1: #bd34fe;
  --vp-c-brand-2: #a855f7;
  --vp-c-brand-3: #9333ea;
  --vp-c-brand-soft: rgba(189, 52, 254, 0.14);

  --vp-c-bg: #1b1b1f;
  --vp-c-bg-soft: #222224;
  --vp-c-bg-mute: #2a2a2d;
  --vp-c-bg-alt: #161618;

  --vp-c-text-1: rgba(255, 255, 245, 0.86);
  --vp-c-text-2: rgba(235, 235, 245, 0.6);
  --vp-c-text-3: rgba(235, 235, 245, 0.38);

  --vp-c-divider: rgba(82, 82, 89, 0.32);
  --vp-c-border: rgba(82, 82, 89, 0.68);

  --vp-c-green-1: #3dd68c;
  --vp-c-green-soft: rgba(61, 214, 140, 0.14);

  --vp-sidebar-width: 272px;
  --vp-nav-height: 64px;

  --vp-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --vp-font-family-mono: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, 'Courier New', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--vp-nav-height) + 24px);
}

body {
  font-family: var(--vp-font-family-base);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.Layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Nav */
.VPNav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: var(--vp-nav-height);
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.VPNavBar {
  height: 100%;
}

.VPNavBar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  height: 100%;
  padding: 0 24px 0 24px;
}

.VPNavBar .title {
  flex-shrink: 0;
}

.VPNavBar .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.VPNavBar .logo-icon {
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #41d1ff 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
}

.VPNavBar .logo-text {
  color: var(--vp-c-text-1);
}

.VPNavBar .content {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.VPNavBar .content-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.VPNavBarMenu {
  display: flex;
  gap: 24px;
}

.VPNavBarMenuLink {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.VPNavBarMenuLink:hover {
  color: var(--vp-c-brand-1);
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
  background: var(--vp-c-text-1);
  transition: all 0.25s;
}

/* Sidebar */
.VPSidebar {
  position: fixed;
  top: var(--vp-nav-height);
  bottom: 0;
  left: 0;
  z-index: 30;
  width: var(--vp-sidebar-width);
  padding: 32px 32px 96px;
  background-color: var(--vp-c-bg-alt);
  overflow-y: auto;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.VPSidebar .nav {
  width: 100%;
}

.VPSidebar .group {
  margin-bottom: 24px;
}

.VPSidebar .title {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.VPSidebar .items {
  display: flex;
  flex-direction: column;
}

.VPSidebar .link {
  display: block;
  padding: 6px 0;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.VPSidebar .link:hover {
  color: var(--vp-c-text-1);
}

.VPSidebar .link.active {
  color: var(--vp-c-brand-1);
}

/* Content */
.VPContent {
  flex: 1;
  padding-top: var(--vp-nav-height);
  padding-left: var(--vp-sidebar-width);
}

.VPDoc .container {
  display: flex;
  margin: 0 auto;
  max-width: 1440px;
}

.VPDoc .content {
  flex: 1;
  min-width: 0;
  padding: 48px 32px 96px;
  max-width: 784px;
}

.VPDoc .content-container {
  margin: 0 auto;
}

.VPDoc .aside {
  flex-shrink: 0;
  width: 224px;
  padding: 48px 32px 32px 0;
}

.VPDoc .aside-container {
  position: sticky;
  top: calc(var(--vp-nav-height) + 32px);
}

/* TOC */
.VPDocAsideOutline .outline-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.VPDocAsideOutline .outline-nav {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--vp-c-divider);
}

.VPDocAsideOutline .outline-link {
  display: block;
  padding: 4px 0 4px 16px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.25s;
}

.VPDocAsideOutline .outline-link:hover {
  color: var(--vp-c-text-1);
}

.VPDocAsideOutline .outline-link.level-3 {
  padding-left: 28px;
}

.VPDocAsideOutline .outline-link.level-4 {
  padding-left: 40px;
}

/* VitePress Doc Styles */
.vp-doc {
  font-size: 16px;
  line-height: 1.7;
}

.vp-doc h1 {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 0;
  letter-spacing: -0.02em;
}

.vp-doc h1 + p {
  margin-top: 16px;
  font-size: 18px;
  color: var(--vp-c-text-2);
}

.vp-doc h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  margin: 48px 0 16px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
  letter-spacing: -0.02em;
}

.vp-doc h2:first-child {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.vp-doc h3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  margin: 32px 0 8px;
  letter-spacing: -0.01em;
}

.vp-doc h4 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  margin: 24px 0 8px;
}

.vp-doc p {
  margin: 16px 0;
  color: var(--vp-c-text-1);
}

.vp-doc a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.25s;
}

.vp-doc a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.vp-doc strong {
  font-weight: 600;
}

.vp-doc code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875em;
  background-color: var(--vp-c-bg-mute);
  padding: 3px 6px;
  border-radius: 4px;
}

.vp-doc pre {
  margin: 16px 0;
  padding: 20px 24px;
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
  overflow-x: auto;
}

.vp-doc pre code {
  background: none;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
}

.vp-doc ul,
.vp-doc ol {
  margin: 16px 0;
  padding-left: 24px;
}

.vp-doc li {
  margin: 8px 0;
}

.vp-doc li::marker {
  color: var(--vp-c-text-3);
}

.vp-doc blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 4px;
}

.vp-doc blockquote p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.vp-doc hr {
  margin: 32px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

.vp-doc table {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
}

.vp-doc th,
.vp-doc td {
  padding: 12px 16px;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
}

.vp-doc th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

.vp-doc img {
  max-width: 100%;
  border-radius: 8px;
}

/* Shiki Theme Override */
.vp-doc pre .shiki {
  background-color: transparent !important;
}

/* Loading */
.loading {
  padding: 48px;
  color: var(--vp-c-text-2);
}

/* Responsive */
@media (max-width: 1280px) {
  .VPDoc .aside {
    display: none;
  }
}

@media (max-width: 960px) {
  .VPNavBarMenu {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .VPContent {
    padding-left: 0;
  }

  .VPSidebar {
    transform: translateX(-100%);
    width: 100%;
    max-width: 320px;
    background-color: var(--vp-c-bg);
  }

  .VPSidebar.open {
    transform: translateX(0);
  }

  .VPSidebar .curtain {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }

  .VPSidebar.open .curtain {
    opacity: 1;
    pointer-events: auto;
  }

  .VPDoc .content {
    padding: 24px 24px 96px;
  }
}
</style>
