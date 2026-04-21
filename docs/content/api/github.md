# github.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts)**

> 9 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`getAttribute`](#getattribute) `function` `getAttribute(el: Element, name: string): string | undefined` - Get element attribute value.
- [`formatNumber`](#formatnumber) `function` `formatNumber(num: number): string` - Format number with K/M suffix.
- [`fetchRepoData`](#fetchrepodata) `function` `fetchRepoData( repo: string, options: Required<GitHubOptions>, ): Promise<GitHubRepoData | null>` - Fetch repository data from GitHub API.
- [`createGitHubCard`](#creategithubcard) `function` `createGitHubCard(repoData: GitHubRepoData): Element` - Create GitHub card element from repo data.
- [`createFallbackCard`](#createfallbackcard) `function` `createFallbackCard(repo: string): Element` - Create fallback element when repo data is unavailable.
- [`collectGitHubRepos`](#collectgithubrepos) `function` `collectGitHubRepos(html: string): Promise<string[]>` - Collect all GitHub repos from HTML for pre-fetching.
- [`prefetchGitHubRepos`](#prefetchgithubrepos) `function` `prefetchGitHubRepos( repos: string[], options?: GitHubOptions, ): Promise<Map<string, GitHubRepoData | null>>` - Pre-fetch all GitHub repos data.
- [`rehypeGitHub`](#rehypegithub) `function` `rehypeGitHub(repoDataMap: Map<string, GitHubRepoData | null>)` - Rehype plugin to transform GitHub components.
- [`transformGitHub`](#transformgithub) `function` `transformGitHub( html: string, repoDataMap?: Map<string, GitHubRepoData | null>, options?: GitHubOptions, ): Promise<string>` - Transform GitHub components in HTML.

## Reference

<details id="getattribute" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getAttribute</code><code class="ox-api-entry__signature">getAttribute(el: Element, name: string): string | undefined</code><span class="ox-api-entry__description">Get element attribute value.</span></summary>
  <div class="ox-api-entry__body">
<p>Get element attribute value.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L45">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getAttribute(el: Element, name: string): string | undefined</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string | undefined</code></p>
</div>
  </div>
</details>

<details id="formatnumber" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">formatNumber</code><code class="ox-api-entry__signature">formatNumber(num: number): string</code><span class="ox-api-entry__description">Format number with K/M suffix.</span></summary>
  <div class="ox-api-entry__body">
<p>Format number with K/M suffix.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L55">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function formatNumber(num: number): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="fetchrepodata" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">fetchRepoData</code><code class="ox-api-entry__signature">fetchRepoData( repo: string, options: Required&lt;GitHubOptions&gt;, ): Promise&lt;GitHubRepoData | null&gt;</code><span class="ox-api-entry__description">Fetch repository data from GitHub API.</span></summary>
  <div class="ox-api-entry__body">
<p>Fetch repository data from GitHub API.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L68">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function fetchRepoData(
  repo: string,
  options: Required&lt;GitHubOptions&gt;,
  ): Promise&lt;GitHubRepoData | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;GitHubRepoData | null&gt;</code></p>
</div>
  </div>
</details>

<details id="creategithubcard" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createGitHubCard</code><code class="ox-api-entry__signature">createGitHubCard(repoData: GitHubRepoData): Element</code><span class="ox-api-entry__description">Create GitHub card element from repo data.</span></summary>
  <div class="ox-api-entry__body">
<p>Create GitHub card element from repo data.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L114">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createGitHubCard(repoData: GitHubRepoData): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<details id="createfallbackcard" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createFallbackCard</code><code class="ox-api-entry__signature">createFallbackCard(repo: string): Element</code><span class="ox-api-entry__description">Create fallback element when repo data is unavailable.</span></summary>
  <div class="ox-api-entry__body">
<p>Create fallback element when repo data is unavailable.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L262">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createFallbackCard(repo: string): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<details id="collectgithubrepos" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">collectGitHubRepos</code><code class="ox-api-entry__signature">collectGitHubRepos(html: string): Promise&lt;string[]&gt;</code><span class="ox-api-entry__description">Collect all GitHub repos from HTML for pre-fetching.</span></summary>
  <div class="ox-api-entry__body">
<p>Collect all GitHub repos from HTML for pre-fetching.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L312">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function collectGitHubRepos(html: string): Promise&lt;string[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string[]&gt;</code></p>
</div>
  </div>
</details>

<details id="prefetchgithubrepos" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">prefetchGitHubRepos</code><code class="ox-api-entry__signature">prefetchGitHubRepos( repos: string[], options?: GitHubOptions, ): Promise&lt;Map&lt;string, GitHubRepoData | null&gt;&gt;</code><span class="ox-api-entry__description">Pre-fetch all GitHub repos data.</span></summary>
  <div class="ox-api-entry__body">
<p>Pre-fetch all GitHub repos data.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L327">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function prefetchGitHubRepos(
  repos: string[],
  options?: GitHubOptions,
  ): Promise&lt;Map&lt;string, GitHubRepoData | null&gt;&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Map&lt;string, GitHubRepoData | null&gt;&gt;</code></p>
</div>
  </div>
</details>

<details id="rehypegithub" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeGitHub</code><code class="ox-api-entry__signature">rehypeGitHub(repoDataMap: Map&lt;string, GitHubRepoData | null&gt;)</code><span class="ox-api-entry__description">Rehype plugin to transform GitHub components.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin to transform GitHub components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L347">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function rehypeGitHub(repoDataMap: Map&lt;string, GitHubRepoData | null&gt;)</code></pre>
</div>
  </div>
</details>

<details id="transformgithub" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformGitHub</code><code class="ox-api-entry__signature">transformGitHub( html: string, repoDataMap?: Map&lt;string, GitHubRepoData | null&gt;, options?: GitHubOptions, ): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Transform GitHub components in HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform GitHub components in HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L381">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformGitHub(
  html: string,
  repoDataMap?: Map&lt;string, GitHubRepoData | null&gt;,
  options?: GitHubOptions,
  ): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

