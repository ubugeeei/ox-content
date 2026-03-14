<script setup lang="ts">
import { ref } from "vue";

const currentPage = ref<"home" | "utils" | "math">("home");
</script>

<template>
  <div class="app">
    <header>
      <h1>Source Docs Example</h1>
      <p>Dogfooding ox-content with Vue components</p>
    </header>

    <nav>
      <button :class="{ active: currentPage === 'home' }" @click="currentPage = 'home'">
        Home
      </button>
      <button :class="{ active: currentPage === 'utils' }" @click="currentPage = 'utils'">
        Utils API
      </button>
      <button :class="{ active: currentPage === 'math' }" @click="currentPage = 'math'">
        Math API
      </button>
    </nav>

    <main>
      <div v-if="currentPage === 'home'" class="home">
        <h2>Welcome to the API Documentation</h2>
        <p>
          This example demonstrates how <strong>Ox Content</strong> can be used to generate
          documentation from source code JSDoc comments, with interactive Vue components embedded
          for a rich documentation experience.
        </p>

        <div class="features">
          <div class="feature">
            <h3>Auto-generated</h3>
            <p>Documentation is extracted from JSDoc/TSDoc comments automatically.</p>
          </div>
          <div class="feature">
            <h3>Interactive</h3>
            <p>Vue components provide searchable, filterable API viewers.</p>
          </div>
          <div class="feature">
            <h3>Dogfooding</h3>
            <p>This example uses ox-content to document ox-content examples!</p>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === 'utils'" class="docs-page">
        <h2>Utils Module</h2>
        <p>String manipulation utilities.</p>

        <div class="generated-notice">
          This documentation was auto-generated from <code>src/utils.ts</code>
        </div>

        <!-- The actual generated markdown would be loaded here -->
        <div class="api-section">
          <h3>capitalize</h3>
          <code class="signature">function capitalize(str: string): string</code>
          <p>Capitalizes the first letter of a string.</p>

          <h3>truncate</h3>
          <code class="signature"
            >function truncate(str: string, maxLength: number, suffix?: string): string</code
          >
          <p>Truncates a string to a specified length.</p>

          <h3>toKebabCase</h3>
          <code class="signature">function toKebabCase(str: string): string</code>
          <p>Converts a string to kebab-case.</p>
        </div>
      </div>

      <div v-else-if="currentPage === 'math'" class="docs-page">
        <h2>Math Module</h2>
        <p>Mathematical operations and utilities.</p>

        <div class="generated-notice">
          This documentation was auto-generated from <code>src/math.ts</code>
        </div>

        <div class="api-section">
          <h3>add</h3>
          <code class="signature">function add(a: number, b: number): number</code>
          <p>Adds two numbers together.</p>

          <h3>multiply</h3>
          <code class="signature">function multiply(a: number, b: number): number</code>
          <p>Multiplies two numbers.</p>

          <h3>Calculator</h3>
          <code class="signature">class Calculator</code>
          <p>Calculator class for chained operations.</p>
        </div>
      </div>
    </main>

    <footer>
      <p>Generated with <a href="https://github.com/ubugeeei/ox-content">Ox Content</a></p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

header h1 {
  margin: 0;
  font-size: 28px;
  color: #1a1a1a;
}

header p {
  color: #666;
  margin: 8px 0 0;
}

nav {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  justify-content: center;
}

nav button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

nav button:hover {
  background: #f5f5f5;
}

nav button.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.home h2 {
  text-align: center;
}

.home > p {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 30px;
  color: #555;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.feature h3 {
  margin: 0 0 8px;
  color: #007acc;
}

.feature p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.docs-page h2 {
  margin-bottom: 8px;
}

.docs-page > p {
  color: #666;
  margin-bottom: 20px;
}

.generated-notice {
  background: #e8f4fc;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  color: #0066cc;
  margin-bottom: 24px;
}

.generated-notice code {
  background: rgba(0, 102, 204, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

.api-section h3 {
  margin: 24px 0 8px;
  font-size: 18px;
}

.api-section .signature {
  display: block;
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 8px;
}

.api-section p {
  color: #555;
  margin: 0;
}

footer {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 13px;
}

footer a {
  color: #007acc;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
