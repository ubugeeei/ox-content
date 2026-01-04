<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  start?: number;
}>();

const count = ref(props.start ?? 0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}
</script>

<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <span class="count">{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}

.count {
  min-width: 2rem;
  text-align: center;
  font-weight: 600;
}

button {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}
</style>
