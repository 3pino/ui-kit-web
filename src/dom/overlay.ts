// DOM の部品（重ねて出すもの）: ポップアップのメニューと、モーダルのダイアログ。
// Svelte の部品（../Menu.svelte・../Modal.svelte）と同じ DOM を作る。幕（背景）と本体の 2 つの要素が並ぶので、要素を 1 つ返すのでなく、
// 置く（mount）と外す（close）を持つ入れ物を返す。置き場所の測り方・フォーカスの扱いは、Svelte の部品と同じ関数（../menuPlacement・../modalFocus）

import { focusFirstIn } from '../modalFocus';
import { menuPlacement } from '../menuPlacement';
import { appendChildren, cx, div, type Children } from './util';

// ---- menu ----

export type MenuOptions = {
  /** 読み上げ用の名前（aria-label） */
  label?: string;
  /** 位置は使う側が class で決める（親の既定の位置は top: 100% + 6px を想定） */
  class?: string;
  /** 渡すと、外側を押したら呼ばれる透明な幕を出す */
  onClose?: () => void;
  /** メニューの項目（menuItem で作る） */
  children?: Children;
};

export type MenuHandle = {
  /** 並べて置く要素（幕（onClose を渡したときだけ）→ メニュー） */
  elements: HTMLElement[];
  /** `<div class="menu" role="menu">` */
  menu: HTMLDivElement;
  /** parent の末尾に置き、画面の下・左右にはみ出すなら位置を直す（置いたときに一度だけ測る） */
  mount(parent: Node): void;
  /** 外す。onClose は呼ばない */
  close(): void;
};

/** ポップアップのメニュー（`.menu` と、あれば幕 `.menu-backdrop`） */
export function menu(opts: MenuOptions = {}): MenuHandle {
  const elements: HTMLElement[] = [];
  if (opts.onClose) {
    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'menu-backdrop';
    backdrop.setAttribute('aria-label', '閉じる');
    const cb = opts.onClose;
    backdrop.addEventListener('click', () => cb());
    elements.push(backdrop);
  }
  const el = div(cx('menu', opts.class));
  el.setAttribute('role', 'menu');
  if (opts.label !== undefined) el.setAttribute('aria-label', opts.label);
  appendChildren(el, opts.children);
  elements.push(el);
  return {
    elements,
    menu: el,
    mount(parent) {
      for (const e of elements) parent.appendChild(e);
      const p = menuPlacement(el);
      // 上に出すときは、親の top の指定より強く（インラインで）上端を外し、ボタンの上に 6px 空けて置く
      if (p.up) {
        el.style.top = 'auto';
        el.style.bottom = '100%';
        el.style.marginBottom = '6px';
      }
      if (p.shift) el.style.translate = `${p.shift}px 0`;
    },
    close() {
      for (const e of elements) e.remove();
    },
  };
}

// ---- modal ----

export type ModalOptions = {
  title: string;
  /** 幅（px）。既定は 420 */
  width?: number;
  /** Esc か、外側（幕）を押したら呼ばれる。閉じるのは呼ぶ側（close()） */
  onClose: () => void;
  /** 本文（title の下）。ボタンの並びは `.modal-actions` */
  children?: Children;
};

export type ModalHandle = {
  /** 並べて置く要素（幕 → 本体） */
  elements: HTMLElement[];
  /** `<div class="modal" role="dialog">` */
  box: HTMLDivElement;
  /** parent（既定は document.body）の末尾に置き、最初の入力欄・ボタンにフォーカスし、Esc を待つ */
  mount(parent?: Node): void;
  /** 外し、Esc の待ちをやめ、フォーカスを元に戻す。onClose は呼ばない */
  close(): void;
};

/** モーダルのダイアログ（`.modal-scrim` + `.modal`） */
export function modal(opts: ModalOptions): ModalHandle {
  const scrim = div('modal-scrim');
  scrim.setAttribute('role', 'presentation');
  scrim.addEventListener('click', () => opts.onClose());
  const box = div('modal');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', opts.title);
  box.style.setProperty('--modal-w', `${opts.width ?? 420}px`);
  const h = document.createElement('h2');
  h.className = 'modal-title';
  h.textContent = opts.title;
  box.append(h);
  appendChildren(box, opts.children);

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') opts.onClose();
  };
  let restore: (() => void) | undefined;
  return {
    elements: [scrim, box],
    box,
    mount(parent = document.body) {
      if (restore) return;
      parent.appendChild(scrim);
      parent.appendChild(box);
      restore = focusFirstIn(box);
      window.addEventListener('keydown', onKey);
    },
    close() {
      if (!restore) return;
      window.removeEventListener('keydown', onKey);
      scrim.remove();
      box.remove();
      restore();
      restore = undefined;
    },
  };
}
