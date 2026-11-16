// フレームワークに依らない DOM の部品。Svelte の部品と同じクラスを付けた、同じ DOM を作る。
// 見た目は @3pino/design-system のクラス（components.css）。アイコンの名前の引き方は ../icons.svelte（差し替えられる）
//
//   import * as dom from '@3pino/ui-kit/dom';
//   parent.append(dom.button({ text: '保存', variant: 'primary', onClick: save }));

import { createIcon } from '../icons.svelte';
import {
  BUTTON_ICON_ONLY_SIZE,
  BUTTON_ICON_SIZE,
  NAV_BAR_ICON_SIZE,
  SEGMENTED_ICON_SIZE,
  SETTING_ROW_ICON_SIZE,
} from './sizes';

export * from './sizes';

function div(className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

// ---- icon ----

export type IconOptions = {
  /** 大きさ（px）。既定は 24 */
  size?: number;
  class?: string;
  /** 読み上げ用の名前。省略すると飾り（aria-hidden） */
  label?: string;
};

/** アイコンの <svg>（`.icon`）。name は Lucide の名前か、アプリ・プラグインが登録した名前 */
export function icon(name: string, opts: IconOptions = {}): SVGSVGElement {
  return createIcon(name, { size: opts.size, class: opts.class, label: opts.label });
}

// ---- button ----

export type ButtonOptions = {
  /** 文字。省略するなら icon と label が要る */
  text?: string;
  /** アイコンの名前 */
  icon?: string;
  variant?: 'primary' | 'danger' | 'ghost';
  /** 読み上げ用の名前。アイコンだけのボタンでは必須 */
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
};

/** 引数が足りないなどの、呼び方の誤り */
export class DomArgumentError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'DomArgumentError';
  }
}

/** ボタン（`.btn`）。文字だけ・アイコン+文字・アイコンだけ（`.btn-icon-only`） */
export function button(opts: ButtonOptions): HTMLButtonElement {
  const text = opts.text ?? '';
  if (!text && !opts.icon) throw new DomArgumentError('ui.button には text か icon を渡してください');
  if (!text && !opts.label) throw new DomArgumentError('アイコンだけのボタンには label（読み上げ用の名前）を渡してください');
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'btn';
  if (opts.variant === 'primary') el.classList.add('primary');
  if (opts.variant === 'danger') el.classList.add('danger');
  if (opts.variant === 'ghost') el.classList.add('ghost');
  if (opts.icon) el.append(createIcon(opts.icon, { size: text ? BUTTON_ICON_SIZE : BUTTON_ICON_ONLY_SIZE }));
  if (text) el.append(text);
  else el.classList.add('btn-icon-only');
  if (opts.label) el.setAttribute('aria-label', opts.label);
  el.disabled = opts.disabled ?? false;
  if (opts.onClick) {
    const cb = opts.onClick;
    el.addEventListener('click', () => cb());
  }
  return el;
}

// ---- toggle ----

export type ToggleOptions = {
  value: boolean;
  onChange?: (value: boolean) => void;
  /** 読み上げ用の名前 */
  label?: string;
};

/** トグルスイッチ（`.toggle`。`<button role="switch">`）。押すと見た目も切り替わる */
export function toggle(opts: ToggleOptions): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'toggle';
  el.setAttribute('role', 'switch');
  if (opts.label) el.setAttribute('aria-label', opts.label);
  const thumb = document.createElement('span');
  thumb.className = 'toggle-thumb';
  el.append(thumb);
  let value = opts.value;
  const sync = (): void => {
    el.classList.toggle('toggle-on', value);
    el.setAttribute('aria-checked', String(value));
  };
  sync();
  el.addEventListener('click', () => {
    value = !value;
    sync();
    opts.onChange?.(value);
  });
  return el;
}

// ---- input ----

export type InputOptions = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

/** 1 行の入力欄（`.input`） */
export function input(opts: InputOptions = {}): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  el.className = 'input';
  el.value = opts.value ?? '';
  if (opts.placeholder) el.placeholder = opts.placeholder;
  if (opts.onChange) {
    const cb = opts.onChange;
    el.addEventListener('input', () => cb(el.value));
  }
  return el;
}

// ---- segmented ----

export type SegmentedOption = { value: string; label: string; icon?: string };

export type SegmentedOptions = {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  /** 読み上げ用の名前 */
  label?: string;
};

/** 横に並んだ選択肢から 1 つを選ぶボタン（`.segmented`）。選ぶと見た目も切り替わる */
export function segmented(opts: SegmentedOptions): HTMLDivElement {
  const el = div('segmented');
  el.setAttribute('role', 'radiogroup');
  if (opts.label) el.setAttribute('aria-label', opts.label);
  let value = opts.value;
  const buttons: [string, HTMLButtonElement][] = [];
  const sync = (): void => {
    for (const [v, b] of buttons) {
      b.classList.toggle('segmented-option-selected', v === value);
      b.setAttribute('aria-checked', String(v === value));
    }
  };
  for (const o of opts.options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'segmented-option';
    b.setAttribute('role', 'radio');
    if (o.icon) b.append(createIcon(o.icon, { size: SEGMENTED_ICON_SIZE }));
    b.append(o.label);
    b.addEventListener('click', () => {
      if (value === o.value) return;
      value = o.value;
      sync();
      opts.onChange?.(value);
    });
    buttons.push([o.value, b]);
    el.append(b);
  }
  sync();
  return el;
}

// ---- navbar ----

export type NavBarItem = { id: string; label: string; icon: string; badge?: number | string | null };

export type NavBarOptions = {
  items: NavBarItem[];
  selected?: string;
  onSelect?: (id: string) => void;
  /** 読み上げ用の名前 */
  label?: string;
};

/** タブのバー（`.nav-bar`）。選ぶと見た目も切り替わる */
export function navbar(opts: NavBarOptions): HTMLElement {
  const el = document.createElement('nav');
  el.className = 'nav-bar';
  if (opts.label) el.setAttribute('aria-label', opts.label);
  let selected = opts.selected;
  const buttons: [string, HTMLButtonElement][] = [];
  const sync = (): void => {
    for (const [id, b] of buttons) {
      b.classList.toggle('nav-bar-item-selected', id === selected);
      if (id === selected) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    }
  };
  for (const it of opts.items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nav-bar-item';
    const iconBox = document.createElement('span');
    iconBox.className = 'nav-bar-item-icon';
    iconBox.append(createIcon(it.icon, { size: NAV_BAR_ICON_SIZE }));
    if (it.badge !== undefined && it.badge !== null && it.badge !== 0 && it.badge !== '') {
      const badge = document.createElement('span');
      badge.className = 'badge nav-bar-item-badge';
      badge.textContent = String(it.badge);
      iconBox.append(badge);
    }
    const label = document.createElement('span');
    label.className = 'nav-bar-item-label';
    label.textContent = it.label;
    b.append(iconBox, label);
    b.addEventListener('click', () => {
      selected = it.id;
      sync();
      opts.onSelect?.(it.id);
    });
    buttons.push([it.id, b]);
    el.append(b);
  }
  sync();
  return el;
}

// ---- divider ----

/** 横の区切り線（`.divider`） */
export function divider(): HTMLHRElement {
  const el = document.createElement('hr');
  el.className = 'divider';
  return el;
}

// ---- setting ----

export type SettingOptions = {
  name: string;
  description?: string;
  /** アイコンの名前 */
  icon?: string;
  /** 右側の操作（toggle・segmented など） */
  control?: HTMLElement;
};

/** 設定の 1 行（アイコン・名前・説明と、右側の操作）を container の末尾に足して返す（`.setting-row`） */
export function setting(container: HTMLElement, opts: SettingOptions): HTMLDivElement {
  const row = div('setting-row');
  if (opts.icon) row.append(createIcon(opts.icon, { size: SETTING_ROW_ICON_SIZE, class: 'setting-row-icon' }));
  const info = div('setting-row-info');
  const name = div('setting-row-name');
  name.textContent = opts.name;
  info.append(name);
  if (opts.description) {
    const desc = div('setting-row-description');
    desc.textContent = opts.description;
    info.append(desc);
  }
  row.append(info);
  if (opts.control) {
    const ctl = div('setting-row-control');
    ctl.append(opts.control);
    row.append(ctl);
  }
  container.append(row);
  return row;
}
