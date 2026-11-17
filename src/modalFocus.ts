// モーダルを開いたときのフォーカスの扱い（Modal.svelte と、DOM の modal が同じものを使う）

/** 開いたとき: 中の最初の入力欄・主ボタン・ボタンにフォーカスを移す。返す関数を呼ぶと（閉じるとき）、元のフォーカスに戻す */
export function focusFirstIn(box: HTMLElement | undefined): () => void {
  const prev = document.activeElement as HTMLElement | null;
  box?.querySelector<HTMLElement>('input, button.primary, button')?.focus();
  return () => prev?.focus?.();
}
