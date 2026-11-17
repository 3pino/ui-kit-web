// parity の試験が共通で使う道具: Svelte で描いたものと、DOM で作ったものを、同じ形の文字列にして比べる
import { afterEach, beforeEach, expect } from 'vitest';
import { flushSync, mount, unmount, type Component } from 'svelte';
import { setLucideForTest } from '../icons.svelte';

const LUCIDE = {
  Upload: [['path', { d: 'M1 1' }]],
  X: [['path', { d: 'M2 2' }]],
  Dice5: [['circle', { cx: 12, cy: 12, r: 3 }]],
  House: [['path', { d: 'M3 3' }]],
  Settings: [['path', { d: 'M4 4' }]],
  MessageCircle: [['circle', { cx: 12, cy: 12, r: 10 }]],
  Trash2: [['path', { d: 'M5 5' }]],
  Copy: [['path', { d: 'M6 6' }]],
  LoaderCircle: [['path', { d: 'M7 7' }]],
  CircleCheck: [['path', { d: 'M8 8' }]],
} as unknown as Parameters<typeof setLucideForTest>[0];

export type ShapeOptions = {
  /** <svg> の中身を見ない（大きさと spin だけ）。Lucide の部品と、名前で引いたアイコンで、中の作りが違うため */
  flatSvg?: boolean;
};

/** 比べるための文字列にする */
export function shape(node: Node, opts: ShapeOptions = {}, depth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    return t ? `${'  '.repeat(depth)}"${t}"\n` : '';
  }
  if (!(node instanceof Element)) return '';
  if (opts.flatSvg && node.tagName.toLowerCase() === 'svg') {
    const spin = node.getAttribute('class')?.split(/\s+/).includes('spin') ? ' spin' : '';
    return `${'  '.repeat(depth)}<svg ${node.getAttribute('width')}x${node.getAttribute('height')}${spin}>\n`;
  }
  const attrs = [...node.attributes]
    // Svelte の <svg> には xmlns が付くが、DOM では名前空間で決まるので同じ（属性の有無だけが違う）。<input type="text"> は既定と同じ
    .filter((a) => a.name !== 'xmlns' && !(node.tagName === 'INPUT' && a.name === 'type' && a.value === 'text'))
    .map((a) => {
      const v = a.name === 'class' ? a.value.split(/\s+/).filter((c) => c && !/^svelte-[a-z0-9]+$/.test(c)).sort().join(' ') : a.value;
      return `${a.name}="${v}"`;
    })
    .sort()
    .join(' ');
  const kids = [...node.childNodes].map((c) => shape(c, opts, depth + 1)).join('');
  return `${'  '.repeat(depth)}<${node.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>\n${kids}`;
}

let cleanups: (() => void)[] = [];
let rootEl: HTMLElement;
export const root = (): HTMLElement => rootEl;

/** describe の外で 1 度呼ぶ（各試験の前後で、置き場所とアイコンの差し替えを用意し、片づける） */
export function useParityFixture(): void {
  beforeEach(() => {
    setLucideForTest(LUCIDE);
    rootEl = document.createElement('div');
    document.body.append(rootEl);
  });
  afterEach(() => {
    for (const c of cleanups) c();
    cleanups = [];
    document.body.innerHTML = '';
    setLucideForTest(null);
  });
}

/** Svelte の部品を描いた、置き場所（要素の入れ物） */
export function svelteHost(Comp: Component<any>, props: Record<string, unknown>): HTMLElement {
  const host = document.createElement('div');
  rootEl.append(host);
  const app = mount(Comp, { target: host, props });
  cleanups.push(() => void unmount(app));
  flushSync();
  return host;
}

/** Svelte の部品を描いて、できた要素（1 つ目）を返す */
export function svelte(Comp: Component<any>, props: Record<string, unknown>): HTMLElement {
  const el = svelteHost(Comp, props).firstElementChild;
  if (!el) throw new Error('何も描かれていません');
  return el as HTMLElement;
}

/** DOM の部品で作ったものを、同じ形で置く */
export function made(el: Element): HTMLElement {
  const host = document.createElement('div');
  rootEl.append(host);
  host.append(el);
  return el as HTMLElement;
}

/** 空の置き場所（重ねて出す部品を置く） */
export function emptyHost(): HTMLElement {
  const host = document.createElement('div');
  rootEl.append(host);
  return host;
}

export function same(a: Element, b: Element, opts: ShapeOptions = {}): void {
  expect(shape(b, opts)).toBe(shape(a, opts));
}
