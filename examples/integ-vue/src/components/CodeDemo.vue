<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  code: string;
  language?: string;
}>();

const copied = ref(false);

async function copyCode() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="code-demo">
    <div class="code-header">
      <span class="language">{{ language ?? 'code' }}</span>
      <button @click="copyCode" class="copy-btn">
        {{ copied ? '✓ Copied!' : 'Copy' }}
      </button>
    </div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-demo {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.language {
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.copy-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.copy-btn:hover {
  background: #e85d2c;
}

pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

code {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #d4d4d4;
}
</style>
