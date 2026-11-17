// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet, flushSync, mount, unmount, type Component } from 'svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import * as dom from './dom';
import { emptyHost, made, same, svelte, svelteHost, useParityFixture, shape } from './test-support/parity';
import IconButton from './IconButton.svelte';
import MenuItem from './MenuItem.svelte';
import Menu from './Menu.svelte';
import Modal from './Modal.svelte';
import PanelBar from './PanelBar.svelte';
import Section from './Section.svelte';
import StatusLine from './StatusLine.svelte';
import Slider from './Slider.svelte';
import SuggestList from './SuggestList.svelte';

// parity.test.ts の続き: アイコンだけのボタン・メニュー（項目・本体）・モーダル・上のバー・セクション・状態の行・スライダー・補完候補。
// 比べ方は同じ（タグ・クラス・属性・文字・入れ子）。DOM の部品が無いのは SortableList だけ（docs/ui.md に理由）。

useParityFixture();

/** 中身（children などの snippet）。Svelte には snippet で、DOM には同じ要素で渡す */
const html = (markup: string) => createRawSnippet(() => ({ render: () => markup }));
function span(text: string): HTMLElement {
  const el = document.createElement('span');
  el.textContent = text;
  return el;
}
const SPAN = '<span>本文</span>';

describe('IconButton', () => {
  it.each([
    ['名前とアイコン', { label: '閉じる', icon: 'x' }, { label: '閉じる', icon: 'x' }],
    ['押されている', { label: '固定', icon: 'x', active: true }, { label: '固定', icon: 'x', active: true }],
    ['大きさ', { label: '閉じる', icon: 'x', iconSize: 24 }, { label: '閉じる', icon: 'x', iconSize: 24 }],
    ['クラス', { label: '閉じる', icon: 'x', class: 'extra' }, { label: '閉じる', icon: 'x', class: 'extra' }],
    ['無効', { label: '閉じる', icon: 'x', disabled: true }, { label: '閉じる', icon: 'x', disabled: true }],
    ['中身だけ（アイコンの名前なし）', { label: '閉じる', children: html(SPAN) }, { label: '閉じる', children: span('本文') }],
    ['アイコンと中身', { label: '閉じる', icon: 'x', children: html(SPAN) }, { label: '閉じる', icon: 'x', children: span('本文') }],
  ] as const)('%s', (_n, s, d) => {
    same(svelte(IconButton, s), made(dom.iconButton(d as dom.IconButtonOptions)));
  });

  it('押すと onClick が呼ばれる。active を渡さなければ active は付かない', () => {
    const fn = vi.fn();
    const b = made(dom.iconButton({ label: 'a', icon: 'x', onClick: fn }));
    b.click();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(b.classList.contains('active')).toBe(false);
  });
});

describe('MenuItem', () => {
  const text = (t: string) => ({ s: html(t), d: t });
  it.each([
    ['文字だけ', {}, {}],
    ['アイコン', { icon: 'copy' }, { icon: 'copy' }],
    ['大きさ', { icon: 'copy', iconSize: 22 }, { icon: 'copy', iconSize: 22 }],
    ['danger', { danger: true }, { danger: true }],
    ['クラス', { class: 'extra' }, { class: 'extra' }],
    ['無効', { disabled: true }, { disabled: true }],
    ['無効 + 理由', { disabled: true, reason: '権限がありません' }, { disabled: true, reason: '権限がありません' }],
    ['無効 + 理由 + アイコン + danger', { disabled: true, reason: '理由', icon: 'trash-2', danger: true }, { disabled: true, reason: '理由', icon: 'trash-2', danger: true }],
    ['有効 + 理由（理由は出ない）', { reason: '理由' }, { reason: '理由' }],
    ['無効 + 空の理由', { disabled: true, reason: '' }, { disabled: true, reason: '' }],
  ] as const)('%s', (_n, s, d) => {
    const { s: children, d: label } = text('コピー');
    same(svelte(MenuItem, { ...s, children }), made(dom.menuItem({ ...(d as dom.MenuItemOptions), children: label })));
  });

  it('押すと onClick が呼ばれる（無効のときは呼ばれない）', () => {
    const fn = vi.fn();
    made(dom.menuItem({ children: 'a', onClick: fn })).click();
    made(dom.menuItem({ children: 'b', disabled: true, onClick: fn })).click();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('Menu', () => {
  const items = '<button class="menu-item" role="menuitem" type="button">コピー</button>';
  function item(): HTMLElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'menu-item';
    b.setAttribute('role', 'menuitem');
    b.textContent = 'コピー';
    return b;
  }

  it.each([
    ['本体だけ', {}, {}],
    ['名前とクラス', { label: '操作', class: 'pos' }, { label: '操作', class: 'pos' }],
    ['外側を押すと閉じる幕つき', { onclose: () => {} }, { onClose: () => {} }],
  ] as const)('%s', (_n, s, d) => {
    const sv = svelteHost(Menu, { ...s, children: html(items) });
    const host = emptyHost();
    dom.menu({ ...(d as dom.MenuOptions), children: item() }).mount(host);
    expect(shape(host)).toBe(shape(sv));
  });

  it('幕を押すと onClose（Svelte と同じく、閉じるのは呼んだ側）', () => {
    const fn = vi.fn();
    const host = emptyHost();
    const h = dom.menu({ onClose: fn, children: item() });
    h.mount(host);
    host.querySelector<HTMLElement>('.menu-backdrop')!.click();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(host.querySelector('.menu')).not.toBeNull();
    h.close();
    expect(host.children).toHaveLength(0);
  });

  describe('置き場所（画面からはみ出すときの直し方が同じ）', () => {
    /** 要素 .menu の矩形を差し替え、ナビバーつきのシェルの中に置く */
    function withRect(rect: { left: number; right: number; bottom: number }, navRight: number | null, run: () => void): void {
      const proto = HTMLElement.prototype;
      const orig = proto.getBoundingClientRect;
      proto.getBoundingClientRect = function (this: HTMLElement) {
        const base = { x: 0, y: 0, top: 0, width: 0, height: 0, toJSON() {} };
        if (this.classList.contains('menu')) return { ...base, ...rect } as DOMRect;
        if (this.classList.contains('nav-bar-side')) return { ...base, left: 0, right: navRight ?? 0, bottom: 0 } as DOMRect;
        return orig.call(this);
      };
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
      Object.defineProperty(document.documentElement, 'clientWidth', { value: 1000, configurable: true });
      try {
        run();
      } finally {
        proto.getBoundingClientRect = orig;
      }
    }
    function both(navRight: number | null): { sv: HTMLElement; dm: HTMLElement } {
      const shellOf = (): { shell: HTMLElement; target: HTMLElement } => {
        const shell = document.createElement('div');
        shell.className = 'shell';
        if (navRight !== null) {
          const nav = document.createElement('nav');
          nav.className = 'nav-bar-side';
          shell.append(nav);
        }
        const target = document.createElement('div');
        shell.append(target);
        document.body.append(shell);
        return { shell, target };
      };
      const a = shellOf();
      const app = mount(Menu, { target: a.target, props: { children: html(items) } });
      flushSync();
      const b = shellOf();
      dom.menu({ children: item() }).mount(b.target);
      const result = { sv: a.target.querySelector<HTMLElement>('.menu')!, dm: b.target.querySelector<HTMLElement>('.menu')! };
      void unmount(app);
      return result;
    }

    it.each([
      ['収まる（何も足さない）', { left: 100, right: 300, bottom: 400 }, null],
      ['下にはみ出す → 上に出す', { left: 100, right: 300, bottom: 900 }, null],
      ['左にはみ出す → 右へずらす', { left: -5, right: 200, bottom: 400 }, null],
      ['右にはみ出す → 左へずらす', { left: 850, right: 1040, bottom: 400 }, null],
      ['左のナビバーの下に隠れる → ナビバーの右へずらす', { left: 20, right: 220, bottom: 400 }, 76],
      ['下と左にはみ出す', { left: -5, right: 200, bottom: 900 }, null],
    ] as const)('%s', (_n, rect, navRight) => {
      withRect(rect, navRight, () => {
        const { sv, dm } = both(navRight);
        expect(dm.getAttribute('style')).toBe(sv.getAttribute('style'));
        expect(shape(dm)).toBe(shape(sv));
      });
    });

    it('上に出す・横にずらす値が実際に入る（比べる側が空でないこと）', () => {
      withRect({ left: -5, right: 200, bottom: 900 }, null, () => {
        const { dm } = both(null);
        expect(dm.style.getPropertyValue('bottom')).toBe('100%');
        expect(dm.style.getPropertyValue('top')).toBe('auto');
        expect(dm.style.getPropertyValue('margin-bottom')).toBe('6px');
        expect(dm.style.getPropertyValue('translate')).toBe('13px 0');
      });
    });
  });
});

describe('Modal', () => {
  const body = '<div class="body"><p>本文</p><div class="modal-actions"><button type="button" class="btn primary">OK</button></div></div>';
  function bodyNodes(): Node[] {
    const t = document.createElement('template');
    t.innerHTML = body;
    return [...t.content.childNodes];
  }

  it.each([
    ['既定の幅', {}, {}],
    ['幅の指定', { width: 300 }, { width: 300 }],
  ] as const)('%s', (_n, s, d) => {
    const sv = svelteHost(Modal, { title: '確認', onclose: () => {}, children: html(body), ...s });
    const host = emptyHost();
    const h = dom.modal({ title: '確認', onClose: () => {}, children: bodyNodes(), ...(d as { width?: number }) });
    h.mount(host);
    expect(shape(host)).toBe(shape(sv));
    h.close();
  });

  it('開いたとき最初のボタンにフォーカスし、閉じたら元に戻る（Svelte と同じ）', () => {
    for (const kind of ['svelte', 'dom'] as const) {
      const before = document.createElement('button');
      before.textContent = '開く';
      document.body.append(before);
      before.focus();
      expect(document.activeElement).toBe(before);
      let close: () => void;
      if (kind === 'svelte') {
        const app = mount(Modal, { target: emptyHost(), props: { title: 't', onclose: () => {}, children: html(body) } });
        flushSync();
        close = () => void unmount(app);
      } else {
        const h = dom.modal({ title: 't', onClose: () => {}, children: bodyNodes() });
        h.mount(emptyHost());
        close = () => h.close();
      }
      expect((document.activeElement as HTMLElement).className, kind).toBe('btn primary');
      close();
      expect(document.activeElement, kind).toBe(before);
      before.remove();
    }
  });

  it('入力欄があれば、まず入力欄にフォーカスする', () => {
    const h = dom.modal({ title: 't', onClose: () => {}, children: [document.createElement('input'), document.createElement('button')] });
    h.mount(emptyHost());
    expect(document.activeElement?.tagName).toBe('INPUT');
    h.close();
  });

  it('Esc と幕の押下で onClose（閉じるのは呼んだ側）。閉じたあとの Esc は無視する', () => {
    const fn = vi.fn();
    const host = emptyHost();
    const h = dom.modal({ title: 't', onClose: fn, children: bodyNodes() });
    h.mount(host);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(fn).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalledTimes(1);
    host.querySelector<HTMLElement>('.modal-scrim')!.click();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(host.children).toHaveLength(2);
    h.close();
    expect(host.children).toHaveLength(0);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('Svelte も同じ: Esc で onclose', () => {
    const fn = vi.fn();
    svelteHost(Modal, { title: 't', onclose: fn, children: html(body) });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('PanelBar', () => {
  it.each([
    ['題名だけ', { children: html('<h1>題名</h1>') }, { children: 'A' }],
    ['題名と操作', { children: html('<h1>題名</h1>'), actions: html('<button>操作</button>') }, { children: 'A', actions: 'B' }],
    ['クラス', { class: 'extra', children: html('<h1>題名</h1>') }, { class: 'extra', children: 'A' }],
    ['中身なし', {}, {}],
  ] as const)('%s', (_n, s, d) => {
    // 中身は、同じ要素を両方で作る（文字列の A・B は下で要素に直す）
    const title = document.createElement('h1');
    title.textContent = '題名';
    const action = document.createElement('button');
    action.textContent = '操作';
    const opts = d as { class?: string; children?: string; actions?: string };
    same(
      svelte(PanelBar, s),
      made(dom.panelBar({ class: opts.class, children: opts.children ? title : undefined, actions: opts.actions ? action : undefined })),
    );
  });
});

describe('Section', () => {
  it.each([
    ['見出しだけ', {}, {}],
    ['クラス', { class: 'extra' }, { class: 'extra' }],
    ['中身つき', { children: html('<p>中身</p>') }, { children: 'p' }],
  ] as const)('%s', (_n, s, d) => {
    const p = document.createElement('p');
    p.textContent = '中身';
    const o = d as { class?: string; children?: string };
    same(svelte(Section, { title: '通知', ...s }), made(dom.section({ title: '通知', class: o.class, children: o.children ? p : undefined })));
  });

  it('divider のクラスも付けられる', () => {
    expect(dom.divider({ class: 'x' }).className).toBe('divider x');
    expect(dom.divider().className).toBe('divider');
  });
});

describe('StatusLine', () => {
  // アイコンは、Svelte では Lucide の部品、DOM では名前（登録簿）。中の作りは違うので、<svg> は大きさと spin だけを比べる
  const flat = { flatSvg: true };
  it.each([
    ['文字だけ', {}, {}],
    ['muted', { kind: 'muted' }, { kind: 'muted' }],
    ['ok + アイコン', { kind: 'ok', icon: CircleCheck }, { kind: 'ok', icon: 'circle-check' }],
    ['accent', { kind: 'accent' }, { kind: 'accent' }],
    ['warn', { kind: 'warn' }, { kind: 'warn' }],
    ['error', { kind: 'error' }, { kind: 'error' }],
    ['busy（回るアイコン）', { busy: true }, { busy: true }],
    ['busy は icon より優先', { busy: true, icon: CircleCheck }, { busy: true, icon: 'circle-check' }],
    ['クラス', { class: 'extra' }, { class: 'extra' }],
  ] as const)('%s', (_n, s, d) => {
    same(svelte(StatusLine, { ...s, children: html('最新です') }), made(dom.statusLine({ ...(d as dom.StatusLineOptions), children: '最新です' })), flat);
  });
});

describe('Slider', () => {
  it.each([
    ['既定', { label: '音量' }],
    ['値・範囲・刻み', { label: '音量', value: 50, min: 0, max: 200, step: 5 }],
    ['無効', { label: '音量', value: 10, disabled: true }],
    ['クラス', { label: '音量', class: 'extra' }],
    ['書き方', { label: '音量', value: 30, format: (v: number) => `${v}%` }],
  ] as const)('%s', (_n, o) => {
    same(svelte(Slider, o), made(dom.slider(o)));
  });

  it('動かすと、値の表示も aria-valuetext も更新され、onInput（動かす間）と onChange（離したとき）が呼ばれる。Svelte も同じ', () => {
    const results: string[] = [];
    for (const kind of ['svelte', 'dom'] as const) {
      const log: string[] = [];
      const o = { label: '音量', value: 10, max: 200, format: (v: number) => `${v}%` };
      const el =
        kind === 'svelte'
          ? svelte(Slider, { ...o, oninput: (v: number) => log.push(`input ${v}`), onchange: (v: number) => log.push(`change ${v}`) })
          : made(dom.slider({ ...o, onInput: (v) => log.push(`input ${v}`), onChange: (v) => log.push(`change ${v}`) }));
      const input = el.querySelector('input')!;
      input.value = '80';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      flushSync();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      results.push(`${log.join(',')} | ${el.querySelector('.slider-value')!.textContent} | ${input.getAttribute('aria-valuetext')}`);
    }
    expect(results[1]).toBe(results[0]);
    expect(results[0]).toBe('input 80,change 80 | 80% | 80%');
  });
});

describe('SuggestList', () => {
  type U = { id: string; name: string };
  const users: U[] = [
    { id: 'a', name: 'あやか' },
    { id: 'b', name: 'ぼぶ' },
    { id: 'c', name: 'ちい' },
  ];
  const item = createRawSnippet<[U]>((u) => ({ render: () => `<span class="suggest-list-item-title">${u().name}</span>` }));
  const render = (u: U): HTMLElement => {
    const s = document.createElement('span');
    s.className = 'suggest-list-item-title';
    s.textContent = u.name;
    return s;
  };
  const props = (extra: object = {}) => ({ items: users, label: 'メンション', key: (u: U) => u.id, onpick: () => {}, item, ...extra });

  it.each([
    ['先頭を選択', {}, {}],
    ['2 番目を選択', { index: 1 }, { index: 1 }],
    ['クラス', { class: 'extra' }, { class: 'extra' }],
    ['候補なし', { items: [] }, { items: [] }],
  ] as const)('%s', (_n, s, d) => {
    same(
      svelte(SuggestList as unknown as Component<any>, props(s)),
      made(dom.suggestList<U>({ items: users, label: 'メンション', render, onPick: () => {}, ...(d as object) }).el),
    );
  });

  it('キー操作・押下・入れ替えが Svelte と同じ', () => {
    const log: Record<string, string[]> = { svelte: [], dom: [] };
    const keys = ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape', 'a'];
    // Svelte
    {
      const host = emptyHost();
      const app = mount(SuggestList<U>, {
        target: host,
        props: props({ onpick: (u: U) => log.svelte.push(`pick ${u.id}`), onclose: () => log.svelte.push('close') }),
      }) as unknown as { keydown(e: KeyboardEvent): boolean };
      flushSync();
      for (const k of keys) {
        const e = new KeyboardEvent('keydown', { key: k, cancelable: true });
        const handled = app.keydown(e);
        flushSync();
        log.svelte.push(`${k}:${handled}:${e.defaultPrevented}:${host.querySelector('.suggest-list-item-selected')?.textContent}`);
      }
      host.querySelectorAll('button')[2].click();
    }
    // DOM
    {
      const h = dom.suggestList<U>({
        items: users,
        label: 'メンション',
        render,
        onPick: (u) => log.dom.push(`pick ${u.id}`),
        onClose: () => log.dom.push('close'),
      });
      made(h.el);
      for (const k of keys) {
        const e = new KeyboardEvent('keydown', { key: k, cancelable: true });
        log.dom.push(`${k}:${h.keydown(e)}:${e.defaultPrevented}:${h.el.querySelector('.suggest-list-item-selected')?.textContent}`);
      }
      h.el.querySelectorAll('button')[2].click();
    }
    expect(log.dom).toEqual(log.svelte);
    expect(log.svelte).toContain('pick c');
    expect(log.svelte[0]).toBe('ArrowDown:true:true:ぼぶ');
  });

  it('候補が空のとき keydown は何もしない（false）', () => {
    const h = dom.suggestList<U>({ items: [], label: 'x', render, onPick: () => {} });
    expect(h.keydown(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
  });

  it('mousedown では入力欄からフォーカスを奪わない（既定の動作を止める）', () => {
    const h = dom.suggestList<U>({ items: users, label: 'x', render, onPick: () => {} });
    const e = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    made(h.el).querySelector('button')!.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it('update と index の代入で、見た目が変わる', () => {
    const h = dom.suggestList<U>({ items: users, label: 'x', render, onPick: () => {} });
    made(h.el);
    h.index = 2;
    expect(h.el.querySelector('.suggest-list-item-selected')?.textContent).toBe('ちい');
    h.update([users[0], users[1]], 0);
    expect(h.el.querySelectorAll('li')).toHaveLength(2);
    expect(h.el.querySelector('[aria-selected="true"]')?.textContent).toBe('あやか');
  });
});

describe('dom.css と、Svelte の部品のスコープつき CSS が同じ規則', () => {
  /** 規則（セレクター → 宣言のそろい）に分ける。コメントは除く */
  function rules(css: string): Map<string, string> {
    const out = new Map<string, string>();
    for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = m[1].split(',').map((s) => s.trim().replace(/\s+/g, ' ')).join(', ');
      const body = m[2].split(';').map((d) => d.trim().replace(/\s+/g, ' ')).filter(Boolean).join('; ');
      out.set(sel, body);
    }
    return out;
  }
  const style = (file: string): string => /<style>([\s\S]*)<\/style>/.exec(readFileSync(resolve(process.cwd(), 'src', file), 'utf8'))![1];
  // Svelte の部品のセレクター → dom.css のセレクター（スコープのクラスの分の強さを、同じ型でそろえてある）
  const MAP: Record<string, string> = {
    '.panel-bar': '.top-bar.panel-bar',
    '.panel-bar-main': '.panel-bar .panel-bar-main',
    '.menu-item:disabled': '.menu-item.menu-item:disabled',
    '.menu-item:disabled:hover, .menu-item:disabled:active': '.menu-item.menu-item:disabled:hover, .menu-item.menu-item:disabled:active',
    '.menu-item-label': '.menu-item .menu-item-label',
    '.menu-item-reason': '.menu-item .menu-item-reason',
  };
  const domCss = rules(readFileSync(resolve(process.cwd(), 'src/dom/dom.css'), 'utf8'));

  it.each([['./PanelBar.svelte'], ['./MenuItem.svelte']])('%s の規則が、すべて dom.css にある（宣言も同じ）', (file) => {
    for (const [sel, body] of rules(style(file))) {
      const mapped = MAP[sel];
      expect(mapped, `${sel} の対応先（このテストの MAP）`).toBeDefined();
      expect(domCss.get(mapped), `${mapped}`).toBe(body);
    }
  });

  it('dom.css に、Svelte の側に無い規則は無い', () => {
    const fromSvelte = new Set([...rules(style('./PanelBar.svelte')).keys(), ...rules(style('./MenuItem.svelte')).keys()].map((s) => MAP[s]));
    expect([...domCss.keys()].sort()).toEqual([...fromSvelte].sort());
  });
});
