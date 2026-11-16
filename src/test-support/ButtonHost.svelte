<script lang="ts">
  // parity.test.ts 用の入れ物（テストのためだけ）。Button に、文字を中身（children）として渡す
  import Button from '../Button.svelte';

  let {
    text,
    variant,
    icon,
    label,
    disabled,
  }: { text?: string; variant?: 'primary' | 'danger' | 'ghost'; icon?: string; label?: string; disabled?: boolean } = $props();
</script>

{#if text}
  <Button {variant} {icon} {label} {disabled}>{text}</Button>
{:else}
  <Button {variant} {icon} {label} {disabled} />
{/if}
