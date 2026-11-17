<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { focusFirstIn } from './modalFocus';

  // モーダルダイアログ。見た目はグローバルの .modal（@3pino/design-system の components.css）
  let { title, onclose, children, width = 420 }: { title: string; onclose: () => void; children: Snippet; width?: number } =
    $props();
  let box: HTMLDivElement | undefined = $state();

  // 開いたとき最初の入力欄・ボタンにフォーカスし、閉じたら元に戻す（DOM の modal と同じ）
  onMount(() => focusFirstIn(box));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="modal-scrim" role="presentation" onclick={onclose}></div>
<div class="modal" role="dialog" aria-modal="true" aria-label={title} bind:this={box} style:--modal-w="{width}px">
  <h2 class="modal-title">{title}</h2>
  {@render children()}
</div>
