// DOM の部品が共通で使う小さな道具

export function div(className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

/** 中身に置けるもの。文字列は文字として入る（HTML としては読まない） */
export type Child = Node | string;
export type Children = Child | readonly Child[] | null | undefined;

/** 中身を足す（null・undefined は何も足さない） */
export function appendChildren(el: Element, children: Children): void {
  if (children === null || children === undefined) return;
  el.append(...(Array.isArray(children) ? (children as readonly Child[]) : [children as Child]));
}

/** クラスの名前をつなぐ（空は飛ばす） */
export function cx(...names: (string | undefined | false)[]): string {
  return names.filter(Boolean).join(' ');
}
