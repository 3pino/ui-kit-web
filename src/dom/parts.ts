// DOM の部品（続き）: アイコンだけのボタン・メニューの項目・上のバー・設定のセクション・状態の行・スライダー・補完候補の一覧。
// Svelte の部品（../IconButton.svelte など）と同じ DOM を作る。parity.test.ts が確かめる

import { createIcon } from '../icons.svelte';
import { ICON_BUTTON_ICON_SIZE, MENU_ITEM_ICON_SIZE, STATUS_LINE_ICON_SIZE } from './sizes';
import { appendChildren, cx, div, type Child, type Children } from './util';

// ---- iconButton ----

export type IconButtonOptions = {
  /** 読み上げ用の名前（aria-label）。枠のないアイコンだけのボタンなので必須 */
  label: string;
  /** アイコンの名前 */
  icon?: string;
  iconSize?: number;
  /** 押されている状態（`.active`） */
  active?: boolean;
  disabled?: boolean;
  class?: string;
  /** アイコンのほかに足す中身 */
  children?: Children;
  onClick?: (e: MouseEvent) => void;
};

/** 枠のない、アイコンだけのボタン（`.icon-btn`） */
export function iconButton(opts: IconButtonOptions): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = cx('icon-btn', opts.class);
  el.classList.toggle('active', opts.active ?? false);
  el.setAttribute('aria-label', opts.label);
  if (opts.disabled) el.disabled = true;
  if (opts.icon) el.append(createIcon(opts.icon, { size: opts.iconSize ?? ICON_BUTTON_ICON_SIZE }));
  appendChildren(el, opts.children);
  if (opts.onClick) el.addEventListener('click', opts.onClick);
  return el;
}

// ---- menuItem ----

export type MenuItemOptions = {
  /** 項目の名前など（文字列または要素） */
  children?: Children;
  /** アイコンの名前 */
  icon?: string;
  iconSize?: number;
  danger?: boolean;
  /** 押せない（グレーになる）。reason は項目名の下に小さく常に出す */
  disabled?: boolean;
  /** 押せないときの理由（無効のときだけ出す） */
  reason?: string;
  class?: string;
  onClick?: (e: MouseEvent) => void;
};

/** メニューの 1 項目（`.menu-item`。`role="menuitem"`） */
export function menuItem(opts: MenuItemOptions = {}): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = cx('menu-item', opts.class);
  el.classList.toggle('menu-item-danger', opts.danger ?? false);
  el.setAttribute('role', 'menuitem');
  const disabled = opts.disabled ?? false;
  el.disabled = disabled;
  if (disabled) {
    el.setAttribute('aria-disabled', 'true');
    if (opts.reason !== undefined) el.title = opts.reason;
  }
  if (opts.icon) el.append(createIcon(opts.icon, { size: opts.iconSize ?? MENU_ITEM_ICON_SIZE }));
  if (disabled && opts.reason) {
    const label = document.createElement('span');
    label.className = 'menu-item-label';
    appendChildren(label, opts.children);
    const reason = document.createElement('span');
    reason.className = 'menu-item-reason';
    reason.textContent = opts.reason;
    label.append(reason);
    el.append(label);
  } else {
    appendChildren(el, opts.children);
  }
  if (opts.onClick) el.addEventListener('click', opts.onClick);
  return el;
}

// ---- panelBar ----

export type PanelBarOptions = {
  class?: string;
  /** 題名や場所（残りの幅を使う） */
  children?: Children;
  /** 右に並べる操作 */
  actions?: Children;
};

/** 全画面パネルの見出しの行（`.top-bar .panel-bar`）。左に題名や場所、右に操作 */
export function panelBar(opts: PanelBarOptions = {}): HTMLElement {
  const el = document.createElement('header');
  el.className = cx('top-bar', 'panel-bar', opts.class);
  const main = div('panel-bar-main');
  appendChildren(main, opts.children);
  el.append(main);
  appendChildren(el, opts.actions);
  return el;
}

// ---- section ----

export type SectionOptions = {
  title: string;
  class?: string;
  children?: Children;
};

/** 設定画面のセクション（`.setting-section`）。区切り線 + 見出し + 中身 */
export function section(opts: SectionOptions): HTMLElement {
  const el = document.createElement('section');
  el.className = cx('setting-section', opts.class);
  const hr = document.createElement('hr');
  hr.className = 'divider setting-section-divider';
  const h = document.createElement('h2');
  h.className = 'setting-section-title';
  h.textContent = opts.title;
  el.append(hr, h);
  appendChildren(el, opts.children);
  return el;
}

// ---- statusLine ----

export type StatusKind = 'default' | 'muted' | 'ok' | 'accent' | 'warn' | 'error';

export type StatusLineOptions = {
  kind?: StatusKind;
  /** アイコンの名前 */
  icon?: string;
  /** 回るアイコンを出す（icon より優先） */
  busy?: boolean;
  class?: string;
  children?: Children;
};

/** アイコン付きの 1 行の状態表示（`.status-line`） */
export function statusLine(opts: StatusLineOptions = {}): HTMLParagraphElement {
  const kind = opts.kind ?? 'default';
  const el = document.createElement('p');
  el.className = cx('status-line', kind !== 'default' && `status-line-${kind}`, opts.class);
  if (opts.busy) el.append(createIcon('loader-circle', { size: STATUS_LINE_ICON_SIZE, class: 'spin' }));
  else if (opts.icon) el.append(createIcon(opts.icon, { size: STATUS_LINE_ICON_SIZE }));
  appendChildren(el, opts.children);
  return el;
}

// ---- slider ----

export type SliderOptions = {
  /** 読み上げ用の名前（aria-label）。見える名前は setting の name などで横に出す */
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  /** 右に出す値の書き方（既定は数のまま）。例: (v) => `${v}%` */
  format?: (v: number) => string;
  disabled?: boolean;
  class?: string;
  /** 動かしている間 */
  onInput?: (value: number) => void;
  /** 離したとき */
  onChange?: (value: number) => void;
};

/** 範囲のスライダー（`.slider`。ネイティブの `input[type=range]` と、今の値） */
export function slider(opts: SliderOptions): HTMLDivElement {
  const format = opts.format ?? ((v: number) => String(v));
  const el = div(cx('slider', opts.class));
  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'slider-input';
  input.min = String(opts.min ?? 0);
  input.max = String(opts.max ?? 100);
  input.step = String(opts.step ?? 1);
  input.value = String(opts.value ?? 0);
  input.disabled = opts.disabled ?? false;
  input.setAttribute('aria-label', opts.label);
  const out = document.createElement('span');
  out.className = 'slider-value';
  const sync = (): void => {
    const v = Number(input.value);
    input.setAttribute('aria-valuetext', format(v));
    out.textContent = format(v);
  };
  sync();
  input.addEventListener('input', () => {
    sync();
    opts.onInput?.(Number(input.value));
  });
  input.addEventListener('change', () => opts.onChange?.(Number(input.value)));
  el.append(input, out);
  return el;
}

// ---- suggestList ----

export type SuggestListOptions<T> = {
  items: readonly T[];
  /** 選択中の候補の位置 */
  index?: number;
  label: string;
  class?: string;
  /** 候補 1 つ分の中身 */
  render: (item: T) => Child | readonly Child[];
  onPick: (item: T) => void;
  onClose?: () => void;
};

export type SuggestListHandle<T> = {
  /** `<ul class="suggest-list">` */
  el: HTMLUListElement;
  /** 選択中の候補の位置（読み書きできる。書くと見た目も変わる） */
  index: number;
  /** 候補を入れ替える（位置が範囲を超えるときは先頭に戻さず、そのまま。使う側が index を直す） */
  update(items: readonly T[], index?: number): void;
  /** 入力欄の keydown から呼ぶ。候補の操作（上下・Enter・Tab・Esc）に使ったキーなら処理して true を返す */
  keydown(e: KeyboardEvent): boolean;
};

/** 入力欄の補完候補の一覧（`.suggest-list`。メンションなど） */
export function suggestList<T>(opts: SuggestListOptions<T>): SuggestListHandle<T> {
  const el = document.createElement('ul');
  el.className = cx('suggest-list', opts.class);
  el.setAttribute('role', 'listbox');
  el.setAttribute('aria-label', opts.label);
  let items = opts.items;
  let index = opts.index ?? 0;

  const paint = (): void => {
    el.replaceChildren(
      ...items.map((it, i) => {
        const li = document.createElement('li');
        li.className = 'suggest-list-option';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === index));
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'suggest-list-item';
        b.classList.toggle('suggest-list-item-selected', i === index);
        // 押しても入力欄からフォーカスを奪わない
        b.addEventListener('mousedown', (e) => e.preventDefault());
        b.addEventListener('click', () => opts.onPick(it));
        const content = opts.render(it);
        b.append(...(Array.isArray(content) ? (content as readonly Child[]) : [content as Child]));
        li.append(b);
        return li;
      }),
    );
  };
  paint();

  return {
    el,
    get index() {
      return index;
    },
    set index(v: number) {
      index = v;
      paint();
    },
    update(next, nextIndex) {
      items = next;
      if (nextIndex !== undefined) index = nextIndex;
      paint();
    },
    keydown(e) {
      const n = items.length;
      if (n === 0) return false;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        index = (index + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
        paint();
        return true;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        opts.onPick(items[index]);
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        opts.onClose?.();
        return true;
      }
      return false;
    },
  };
}
