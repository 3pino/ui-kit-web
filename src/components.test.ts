// @vitest-environment jsdom
// 部品ごとの DOM と動き（Svelte だけ。このパッケージは DOM の作り手を持たない）。
// 構造の決まり（タグ・クラス・属性）と、押す・キー・フォーカス・置き場所の動きを確かめる
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRawSnippet, flushSync, mount, unmount, type Component } from 'svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import { setLucideForTest } from './icons.svelte';
import IconButton from './IconButton.svelte';
import Menu from './Menu.svelte';
import MenuItem from './MenuItem.svelte';
import Modal from './Modal.svelte';
import PanelBar from './PanelBar.svelte';
import Section from './Section.svelte';
import Slider from './Slider.svelte';
import StatusLine from './StatusLine.svelte';
import SuggestList from './SuggestList.svelte';

const LUCIDE = {
  X: [['path', { d: 'M2 2' }]],
  CircleCheck: [['path', { d: 'M8 8' }]],
} as unknown as Parameters<typeof setLucideForTest>[0];

let cleanups: (() => void)[] = [];
beforeEach(() => setLucideForTest(LUCIDE));
afterEach(() => {
  for (const c of cleanups) c();
  cleanups = [];
  document.body.innerHTML = '';
  setLucideForTest(null);
});

const html = (markup: string) => createRawSnippet(() => ({ render: () => markup }));

/** 部品を描いて、置き場所を返す */
function render(Comp: Component<any>, props: Record<string, unknown>, target?: HTMLElement): HTMLElement {
  const host = target ?? document.body.appendChild(document.createElement('div'));
  const app = mount(Comp, { target: host, props });
  cleanups.push(() => void unmount(app));
  flushSync();
  return host;
}
const first = (Comp: Component<any>, props: Record<string, unknown>): HTMLElement => render(Comp, props).firstElementChild as HTMLElement;
const classes = (el: Element): string[] => [...el.classList].filter((c) => !/^svelte-/.test(c)).sort();

describe('IconButton', () => {
  it('名前（aria-label）・アイコン・active・class・disabled', () => {
    const b = first(IconButton, { label: '閉じる', icon: 'x', active: true, class: 'extra', disabled: true });
    expect(b.tagName).toBe('BUTTON');
    expect(classes(b)).toEqual(['active', 'extra', 'icon-btn']);
    expect(b.getAttribute('type')).toBe('button');
    expect(b.getAttribute('aria-label')).toBe('閉じる');
    expect((b as HTMLButtonElement).disabled).toBe(true);
    expect(b.firstElementChild?.getAttribute('width')).toBe('18');
    expect(first(IconButton, { label: 'a', icon: 'x', iconSize: 24 }).firstElementChild?.getAttribute('width')).toBe('24');
    expect(classes(first(IconButton, { label: 'a' }))).toEqual(['icon-btn']);
  });

  it('押すと onclick が呼ばれる', () => {
    const fn = vi.fn();
    first(IconButton, { label: 'a', icon: 'x', onclick: fn }).click();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('MenuItem', () => {
  it('role・danger・無効と理由（title・aria-disabled）', () => {
    const children = html('<span>コピー</span>');
    const a = first(MenuItem, { children, icon: 'x', danger: true });
    expect(a.getAttribute('role')).toBe('menuitem');
    expect(classes(a)).toEqual(['menu-item', 'menu-item-danger']);
    expect(a.firstElementChild?.getAttribute('width')).toBe('18');
    const b = first(MenuItem, { children, disabled: true, reason: '権限がありません' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(b.title).toBe('権限がありません');
    expect(b.querySelector('.menu-item-label > .menu-item-reason')?.textContent).toBe('権限がありません');
    // 有効のときは理由を出さない
    const c = first(MenuItem, { children, reason: '理由' });
    expect(c.querySelector('.menu-item-reason')).toBeNull();
    expect(c.getAttribute('aria-disabled')).toBeNull();
  });

  it('押すと onclick。無効のときは呼ばれない', () => {
    const fn = vi.fn();
    first(MenuItem, { children: html('a'), onclick: fn }).click();
    first(MenuItem, { children: html('b'), disabled: true, onclick: fn }).click();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('Menu', () => {
  const items = '<button class="menu-item" role="menuitem" type="button">コピー</button>';

  it('本体は .menu（role=menu・名前・class）。onclose があるときだけ幕（.menu-backdrop）が前に付く', () => {
    const a = render(Menu, { children: html(items) });
    expect([...a.children].map((e) => classes(e).join(' '))).toEqual(['menu']);
    const b = render(Menu, { label: '操作', class: 'pos', onclose: () => {}, children: html(items) });
    const [backdrop, menu] = [...b.children];
    expect(backdrop.className).toBe('menu-backdrop');
    expect(backdrop.getAttribute('aria-label')).toBe('閉じる');
    expect(classes(menu)).toEqual(['menu', 'pos']);
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.getAttribute('aria-label')).toBe('操作');
  });

  it('幕を押すと onclose（閉じるのは呼んだ側）', () => {
    const fn = vi.fn();
    const host = render(Menu, { onclose: fn, children: html(items) });
    host.querySelector<HTMLElement>('.menu-backdrop')!.click();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(host.querySelector('.menu')).not.toBeNull();
  });

  it('onclose があるとき、Esc でも onclose（下の画面の Esc には届けない）', () => {
    const below = vi.fn();
    window.addEventListener('keydown', below);
    cleanups.push(() => window.removeEventListener('keydown', below));
    const fn = vi.fn();
    render(Menu, { onclose: fn, children: html(items) });
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    window.dispatchEvent(other);
    expect(fn).not.toHaveBeenCalled();
    expect(below).toHaveBeenCalledTimes(1);
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(esc);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(esc.defaultPrevented).toBe(true);
    expect(below).toHaveBeenCalledTimes(1);
  });

  it('onclose が無いメニューは、Esc を止めない', () => {
    const below = vi.fn();
    window.addEventListener('keydown', below);
    cleanups.push(() => window.removeEventListener('keydown', below));
    render(Menu, { children: html(items) });
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(false);
    expect(below).toHaveBeenCalledTimes(1);
  });

  describe('置き場所（画面からはみ出すときの直し方）', () => {
    /** .menu の矩形を差し替え、必要ならナビバーつきのシェルの中に置く */
    function place(rect: { left: number; right: number; bottom: number }, navRight: number | null): HTMLElement {
      const proto = HTMLElement.prototype;
      const orig = proto.getBoundingClientRect;
      proto.getBoundingClientRect = function (this: HTMLElement) {
        const base = { x: 0, y: 0, top: 0, width: 0, height: 0, toJSON() {} };
        if (this.classList.contains('menu')) return { ...base, ...rect } as DOMRect;
        if (this.classList.contains('nav-bar-side')) return { ...base, left: 0, right: navRight ?? 0, bottom: 0 } as DOMRect;
        return orig.call(this);
      };
      cleanups.push(() => (proto.getBoundingClientRect = orig));
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
      Object.defineProperty(document.documentElement, 'clientWidth', { value: 1000, configurable: true });
      const shell = document.body.appendChild(document.createElement('div'));
      shell.className = 'shell';
      if (navRight !== null) {
        const nav = document.createElement('nav');
        nav.className = 'nav-bar-side';
        shell.append(nav);
      }
      const target = shell.appendChild(document.createElement('div'));
      render(Menu, { children: html(items) }, target);
      return target.querySelector<HTMLElement>('.menu')!;
    }

    it.each([
      ['収まる（何も足さない）', { left: 100, right: 300, bottom: 400 }, null, null],
      ['下にはみ出す → 上に出す', { left: 100, right: 300, bottom: 900 }, null, { top: 'auto', bottom: '100%', 'margin-bottom': '6px' }],
      ['左にはみ出す → 右へずらす', { left: -5, right: 200, bottom: 400 }, null, { translate: '13px 0' }],
      ['右にはみ出す → 左へずらす', { left: 850, right: 1040, bottom: 400 }, null, { translate: '-48px 0' }],
      ['左のナビバーの下に隠れる → ナビバーの右へずらす', { left: 20, right: 220, bottom: 400 }, 76, { translate: '64px 0' }],
      ['下と左にはみ出す', { left: -5, right: 200, bottom: 900 }, null, { top: 'auto', bottom: '100%', 'margin-bottom': '6px', translate: '13px 0' }],
    ] as const)('%s', (_n, rect, navRight, expected) => {
      const menu = place(rect, navRight);
      for (const k of ['top', 'bottom', 'margin-bottom', 'translate']) {
        expect(menu.style.getPropertyValue(k), k).toBe((expected as Record<string, string> | null)?.[k] ?? '');
      }
    });
  });
});

describe('Modal', () => {
  const body = '<div class="body"><p>本文</p><div class="modal-actions"><button type="button" class="btn primary">OK</button></div></div>';

  it('幕と本体（role=dialog・aria-modal・名前・題名・幅）', () => {
    const host = render(Modal, { title: '確認', onclose: () => {}, children: html(body) });
    const [scrim, box] = [...host.children] as HTMLElement[];
    expect(scrim.className).toBe('modal-scrim');
    expect(scrim.getAttribute('role')).toBe('presentation');
    expect(classes(box)).toEqual(['modal']);
    expect(box.getAttribute('role')).toBe('dialog');
    expect(box.getAttribute('aria-modal')).toBe('true');
    expect(box.getAttribute('aria-label')).toBe('確認');
    expect(box.querySelector('h2.modal-title')?.textContent).toBe('確認');
    expect(box.style.getPropertyValue('--modal-w')).toBe('420px');
    expect(render(Modal, { title: 't', width: 300, onclose: () => {}, children: html(body) }).querySelector<HTMLElement>('.modal')!.style.getPropertyValue('--modal-w')).toBe('300px');
  });

  it('開いたとき最初のボタンにフォーカスし、閉じたら元に戻る', () => {
    const before = document.body.appendChild(document.createElement('button'));
    before.focus();
    const host = document.body.appendChild(document.createElement('div'));
    const app = mount(Modal, { target: host, props: { title: 't', onclose: () => {}, children: html(body) } });
    flushSync();
    expect((document.activeElement as HTMLElement).className).toBe('btn primary');
    void unmount(app);
    flushSync();
    expect(document.activeElement).toBe(before);
  });

  it('入力欄が先にあれば、入力欄にフォーカスする', () => {
    render(Modal, { title: 't', onclose: () => {}, children: html('<div><input><button>b</button></div>') });
    expect(document.activeElement?.tagName).toBe('INPUT');
  });

  it('Esc と幕の押下で onclose（閉じるのは呼んだ側）。別のキーは無視', () => {
    const fn = vi.fn();
    const host = render(Modal, { title: 't', onclose: fn, children: html(body) });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(fn).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalledTimes(1);
    host.querySelector<HTMLElement>('.modal-scrim')!.click();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('外す（unmount）と、Esc の待ちもなくなる', () => {
    const fn = vi.fn();
    const host = document.body.appendChild(document.createElement('div'));
    const app = mount(Modal, { target: host, props: { title: 't', onclose: fn, children: html(body) } });
    flushSync();
    void unmount(app);
    flushSync();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('PanelBar', () => {
  it('header.top-bar.panel-bar の中に、題名（.panel-bar-main）と、あれば操作', () => {
    const a = first(PanelBar, { children: html('<h1>題名</h1>') });
    expect(a.tagName).toBe('HEADER');
    expect(classes(a)).toEqual(['panel-bar', 'top-bar']);
    expect([...a.children].map((c) => classes(c).join(' '))).toEqual(['panel-bar-main']);
    const b = first(PanelBar, { class: 'extra', children: html('<h1>題名</h1>'), actions: html('<button>操作</button>') });
    expect(classes(b)).toEqual(['extra', 'panel-bar', 'top-bar']);
    expect(b.lastElementChild?.tagName).toBe('BUTTON');
    expect(first(PanelBar, {}).children).toHaveLength(1);
  });
});

describe('Section', () => {
  it('section.setting-section > hr.divider.setting-section-divider + h2.setting-section-title + 中身', () => {
    const s = first(Section, { title: '通知', class: 'extra', children: html('<p>中身</p>') });
    expect(s.tagName).toBe('SECTION');
    expect(classes(s)).toEqual(['extra', 'setting-section']);
    expect([...s.children].map((c) => c.tagName)).toEqual(['HR', 'H2', 'P']);
    expect(classes(s.children[0])).toEqual(['divider', 'setting-section-divider']);
    expect(s.children[1].className).toBe('setting-section-title');
    expect(s.children[1].textContent).toBe('通知');
  });
});

describe('StatusLine', () => {
  it('p.status-line（kind ごとのクラス）と文字', () => {
    expect(classes(first(StatusLine, { children: html('最新です') }))).toEqual(['status-line']);
    for (const kind of ['muted', 'ok', 'accent', 'warn', 'error']) {
      expect(classes(first(StatusLine, { kind })), kind).toEqual(['status-line', `status-line-${kind}`]);
    }
    expect(first(StatusLine, { children: html('<i>最新です</i>') }).textContent?.trim()).toBe('最新です');
  });

  it('アイコンは名前でも Svelte の部品でも渡せる（大きさ 15）。busy は icon より優先で回る', () => {
    const byName = first(StatusLine, { icon: 'circle-check' });
    expect(byName.firstElementChild?.getAttribute('class')).toBe('icon ');
    expect(byName.firstElementChild?.getAttribute('width')).toBe('15');
    const byComp = first(StatusLine, { icon: CircleCheck });
    expect(byComp.firstElementChild?.getAttribute('width')).toBe('15');
    const busy = first(StatusLine, { busy: true, icon: 'circle-check' });
    expect(busy.firstElementChild?.getAttribute('class')).toContain('spin');
    expect(busy.querySelectorAll('svg')).toHaveLength(1);
  });
});

describe('Slider', () => {
  it('.slider > input[type=range].slider-input + .slider-value（範囲・名前・書き方）', () => {
    const el = first(Slider, { label: '音量', value: 30, min: 0, max: 200, step: 5, format: (v: number) => `${v}%`, class: 'extra', disabled: true });
    expect(classes(el)).toEqual(['extra', 'slider']);
    const input = el.querySelector('input')!;
    expect(input.type).toBe('range');
    expect(input.className).toBe('slider-input');
    expect([input.min, input.max, input.step, input.value]).toEqual(['0', '200', '5', '30']);
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('音量');
    expect(input.getAttribute('aria-valuetext')).toBe('30%');
    expect(el.querySelector('.slider-value')?.textContent).toBe('30%');
  });

  it('動かすと、値の表示も aria-valuetext も更新され、oninput（動かす間）と onchange（離したとき）が呼ばれる', () => {
    const log: string[] = [];
    const el = first(Slider, {
      label: '音量',
      value: 10,
      max: 200,
      format: (v: number) => `${v}%`,
      oninput: (v: number) => log.push(`input ${v}`),
      onchange: (v: number) => log.push(`change ${v}`),
    });
    const input = el.querySelector('input')!;
    input.value = '80';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(log).toEqual(['input 80', 'change 80']);
    expect(el.querySelector('.slider-value')?.textContent).toBe('80%');
    expect(input.getAttribute('aria-valuetext')).toBe('80%');
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
  const props = (extra: object = {}) => ({ items: users, label: 'メンション', key: (u: U) => u.id, onpick: () => {}, item, ...extra });

  it('ul.suggest-list（listbox）の中に、選択中の候補だけ selected', () => {
    const ul = first(SuggestList as unknown as Component<any>, props({ index: 1, class: 'extra' }));
    expect(ul.tagName).toBe('UL');
    expect(classes(ul)).toEqual(['extra', 'suggest-list']);
    expect(ul.getAttribute('role')).toBe('listbox');
    expect(ul.getAttribute('aria-label')).toBe('メンション');
    const lis = [...ul.querySelectorAll('li')];
    expect(lis.map((l) => l.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(ul.querySelector('.suggest-list-item-selected')?.textContent?.trim()).toBe('ぼぶ');
  });

  it('キー操作（上下・Enter・Tab・Esc）の戻り値・既定動作の抑止・選択の動き・押下', () => {
    const log: string[] = [];
    const host = document.body.appendChild(document.createElement('div'));
    const app = mount(SuggestList<U>, {
      target: host,
      props: props({ onpick: (u: U) => log.push(`pick ${u.id}`), onclose: () => log.push('close') }),
    }) as unknown as { keydown(e: KeyboardEvent): boolean };
    cleanups.push(() => void unmount(app as never));
    flushSync();
    for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape', 'a']) {
      const e = new KeyboardEvent('keydown', { key: k, cancelable: true });
      const handled = app.keydown(e);
      flushSync();
      log.push(`${k}:${handled}:${e.defaultPrevented}:${host.querySelector('.suggest-list-item-selected')?.textContent?.trim()}`);
    }
    host.querySelectorAll('button')[2].click();
    expect(log).toEqual([
      'ArrowDown:true:true:ぼぶ',
      'ArrowDown:true:true:ちい',
      'ArrowDown:true:true:あやか',
      'ArrowUp:true:true:ちい',
      'pick c',
      'Enter:true:true:ちい',
      'pick c',
      'Tab:true:true:ちい',
      'close',
      'Escape:true:true:ちい',
      'a:false:false:ちい',
      'pick c',
    ]);
  });

  it('候補が空のとき keydown は何もしない（false）', () => {
    const host = document.body.appendChild(document.createElement('div'));
    const app = mount(SuggestList<U>, { target: host, props: props({ items: [] }) }) as unknown as { keydown(e: KeyboardEvent): boolean };
    cleanups.push(() => void unmount(app as never));
    expect(app.keydown(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
  });

  it('mousedown では入力欄からフォーカスを奪わない（既定の動作を止める）', () => {
    const ul = first(SuggestList as unknown as Component<any>, props());
    const e = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    ul.querySelector('button')!.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });
});
