<script setup lang="ts">
defineProps<{
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
}>();
</script>

<template>
  <div :class="['alert', `alert-${type ?? 'info'}`]">
    <strong v-if="title">{{ title }}</strong>
    <slot />
  </div>
</template>

<style scoped>
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.alert-info {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.alert-warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.alert-error {
  background: #fee2e2;
  border-left: 4px solid #ef4444;
}

.alert-success {
  background: #dcfce7;
  border-left: 4px solid #22c55e;
}
</style>
