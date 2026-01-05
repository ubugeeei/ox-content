<script>
  let { type = 'info', title = '', children } = $props();

  const colors = {
    info: { bg: '#1e3a5f', border: '#3b82f6' },
    warning: { bg: '#422006', border: '#f59e0b' },
    error: { bg: '#450a0a', border: '#ef4444' },
    success: { bg: '#052e16', border: '#22c55e' },
  };

  const color = $derived(colors[type] || colors.info);
</script>

<div
  class="alert"
  style="background: {color.bg}; border-left: 4px solid {color.border};"
>
  {#if title}
    <strong>{title}</strong>
  {/if}
  {@render children?.()}
</div>

<style>
  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }

  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
</style>
