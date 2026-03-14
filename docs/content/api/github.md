# github.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts)**

## getAttribute

`function`

Get element attribute value.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L45)**

```typescript
function getAttribute(el: Element, name: string): string | undefined;
```

### Returns

`string | undefined` -

---

## formatNumber

`function`

Format number with K/M suffix.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L55)**

```typescript
function formatNumber(num: number): string;
```

### Returns

`string` -

---

## fetchRepoData

`function`

Fetch repository data from GitHub API.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L68)**

```typescript
export async function fetchRepoData(
  repo: string,
  options: Required<GitHubOptions>,
): Promise<GitHubRepoData | null>;
```

### Returns

`Promise<GitHubRepoData | null>` -

---

## createGitHubCard

`function`

Create GitHub card element from repo data.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L114)**

```typescript
function createGitHubCard(repoData: GitHubRepoData): Element;
```

### Returns

`Element` -

---

## createFallbackCard

`function`

Create fallback element when repo data is unavailable.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L262)**

```typescript
function createFallbackCard(repo: string): Element;
```

### Returns

`Element` -

---

## collectGitHubRepos

`function`

Collect all GitHub repos from HTML for pre-fetching.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L312)**

```typescript
export async function collectGitHubRepos(html: string): Promise<string[]>;
```

### Returns

`Promise<string[]>` -

---

## prefetchGitHubRepos

`function`

Pre-fetch all GitHub repos data.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L327)**

```typescript
export async function prefetchGitHubRepos(
  repos: string[],
  options?: GitHubOptions,
): Promise<Map<string, GitHubRepoData | null>>;
```

### Returns

`Promise<Map<string, GitHubRepoData | null>>` -

---

## rehypeGitHub

`function`

Rehype plugin to transform GitHub components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L347)**

```typescript
function rehypeGitHub(repoDataMap: Map<string, GitHubRepoData | null>);
```

---

## transformGitHub

`function`

Transform GitHub components in HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/github.ts#L381)**

```typescript
export async function transformGitHub(
  html: string,
  repoDataMap?: Map<string, GitHubRepoData | null>,
  options?: GitHubOptions,
): Promise<string>;
```

### Returns

`Promise<string>` -

---
