<script lang="ts">
  import type { Snippet } from 'svelte';
  import { menuPlacement } from './menuPlacement';

  // ポップアップのメニュー。見た目はグローバルの .menu（@3pino/design-system の components.css）、位置は class で使う側が決める。
  // onclose を渡すと、外側を押したら閉じる透明な幕を出し、Esc でも閉じる（Esc は、ここで止めて、下の画面の Esc（選択解除・パネルを閉じるなど）には届けない）。
  // 開いたときに画面の下からはみ出すなら、位置の基準（ボタン）の上側に出す（親の既定の位置は top: 100% + 6px を想定）
  let {
    label,
    class: className = '',
    onclose,
    children,
  }: {
    label?: string;
    class?: string;
    onclose?: () => void;
    children?: Snippet;
  } = $props();

  let el: HTMLDivElement | undefined = $state();
  /** 上側に出しているか */
  let up = $state(false);
  /** 左右にはみ出す分だけ横にずらす量（px。画面の端から 8px 空ける） */
  let shift = $state(0);

  function onKey(ev: KeyboardEvent): void {
    // 変換中の Esc（入力をやめる操作）は、ここでは扱わない
    if (!onclose || ev.key !== 'Escape' || ev.isComposing) return;
    ev.preventDefault();
    ev.stopPropagation();
    onclose();
  }

  // 開いたとき（マウントしたとき）に一度だけ測る（測り方は menuPlacement.ts）。
  // 使える横の範囲は画面ではなくシェルの中身（広い画面で左に縦に並ぶナビバーは含めない）
  $effect(() => {
    if (!el) return;
    const p = menuPlacement(el);
    up = p.up;
    shift = p.shift;
  });
</script>

<svelte:window onkeydowncapture={onKey} />

{#if onclose}
  <button type="button" class="menu-backdrop" aria-label="閉じる" onclick={onclose}></button>
{/if}
<!-- 上に出すときは、親の top の指定より強く（インラインで）上端を外し、ボタンの上に 6px 空けて置く -->
<div
  bind:this={el}
  class="menu {className}"
  role="menu"
  aria-label={label}
  style:top={up ? 'auto' : null}
  style:bottom={up ? '100%' : null}
  style:margin-bottom={up ? '6px' : null}
  style:translate={shift ? `${shift}px 0` : null}
>
  {@render children?.()}
</div>
