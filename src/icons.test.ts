// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineBuiltinIcon, fillIcon, hasIcon, loadLucide, lookupIcon, lucideKey, parseIconSvg, registerIcon, rerender, setIconResolver, setLucideForTest } from './icons.svelte';

const LUCIDE = {
  Puzzle: [['path', { d: 'M1 1' }]],
  MessageCircle: [['circle', { cx: 12, cy: 12, r: 10 }]],
} as unknown as Parameters<typeof setLucideForTest>[0];

afterEach(() => {
  setLucideForTest(null);
  setIconResolver(null);
});

defineBuiltinIcon('app-logo', { body: '<path d="M2 2"/>', attrs: {} });

/** Icon.svelte が描く <svg> と同じ形の入れ物（fillIcon の試験用） */
function svgOf(name: string, opts: { size?: number; class?: string; label?: string } = {}): SVGSVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', String(opts.size ?? 24));
  el.setAttribute('height', String(opts.size ?? 24));
  el.setAttribute('class', opts.class ? `icon ${opts.class}` : 'icon');
  if (opts.label) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', opts.label);
  } else el.setAttribute('aria-hidden', 'true');
  fillIcon(el, name);
  return el;
}

describe('icons', () => {
  it('Lucide の名前（ケバブ）を lucide パッケージの名前にする', () => {
    expect(lucideKey('message-circle')).toBe('MessageCircle');
    expect(lucideKey('dice-5')).toBe('Dice5');
    expect(lucideKey('arrow-down-0-1')).toBe('ArrowDown01');
    expect(lucideKey('Puzzle')).toBe('Puzzle');
  });

  it('アプリが定義した独自のアイコンは Lucide を読み込まずに引ける', () => {
    const d = lookupIcon('app-logo');
    expect(d).not.toBe('pending');
    expect(d && d !== 'pending' && d.body).toContain('<path');
  });

  it('本体 → 登録したもの → Lucide の順に引き、登録は後勝ちで外すと戻る', () => {
    setLucideForTest(LUCIDE);
    expect(lookupIcon('puzzle')).toEqual({ body: '<path d="M1 1"/>', attrs: {} });
    const off1 = registerIcon('puzzle', '<rect width="2" height="2"/>');
    const off2 = registerIcon('puzzle', '<circle r="3"/>');
    expect((lookupIcon('puzzle') as { body: string }).body).toContain('circle');
    off2();
    expect((lookupIcon('puzzle') as { body: string }).body).toContain('rect');
    off1();
    off1();
    expect(lookupIcon('puzzle')).toEqual({ body: '<path d="M1 1"/>', attrs: {} });
    expect(lookupIcon('no-such-icon')).toBeNull();
    expect(() => registerIcon('app-logo', '<path/>')).toThrow();
    expect(() => registerIcon('bad name', '<path/>')).toThrow();
  });

  it('<svg> まるごとなら属性も使い、危ないものは取り除く', () => {
    const d = parseIconSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="currentColor" onload="alert(1)"><script>alert(1)</script><path d="M0 0" onclick="x()"/></svg>',
    );
    expect(d.attrs).toEqual({ viewBox: '0 0 16 16', fill: 'currentColor' });
    expect(d.body).not.toContain('script');
    expect(d.body).not.toContain('onclick');
    expect(d.body).toContain('d="M0 0"');
    expect(() => parseIconSvg('')).toThrow();
    expect(() => parseIconSvg('<path')).toThrow();
  });

  it('fillIcon は Lucide を読み込んでから描く', async () => {
    setLucideForTest(null);
    // 読み込みを待たせる
    vi.doMock('lucide', () => ({ icons: LUCIDE }));
    const el = svgOf('message-circle', { size: 18, class: 'x' });
    expect(el.getAttribute('width')).toBe('18');
    expect(el.getAttribute('class')).toBe('icon x');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    await loadLucide();
    expect(el.innerHTML).toContain('circle');
    expect(el.getAttribute('stroke')).toBe('currentColor');
    expect(hasIcon('message-circle')).toBe(true);
    vi.doUnmock('lucide');
  });

  it('fillIcon は前のアイコンの属性を残さない', () => {
    setLucideForTest(LUCIDE);
    const off = registerIcon('test-filled', '<svg viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M0 0"/></svg>');
    const el = svgOf('test-filled', { label: 'テスト' });
    expect(el.getAttribute('fill')).toBe('currentColor');
    expect(el.getAttribute('role')).toBe('img');
    fillIcon(el, 'puzzle');
    expect(el.getAttribute('fill')).toBe('none');
    expect(el.getAttribute('viewBox')).toBe('0 0 24 24');
    off();
  });
});

describe('引き方の差し替え', () => {
  it('差し替えた引き方は、登録のない名前にだけ使う（定義・登録が先）。null で Lucide に戻る', () => {
    setLucideForTest(LUCIDE);
    const calls: string[] = [];
    setIconResolver((name) => {
      calls.push(name);
      return name === 'mine' ? { body: '<rect/>', attrs: {} } : null;
    });
    expect(lookupIcon('mine')).toEqual({ body: '<rect/>', attrs: {} });
    expect(lookupIcon('puzzle')).toBeNull();
    expect(lookupIcon('app-logo')).not.toBeNull();
    expect(calls).toEqual(['mine', 'puzzle']);
    setIconResolver(null);
    expect(lookupIcon('puzzle')).toEqual({ body: '<path d="M1 1"/>', attrs: {} });
  });

  it('pending を返す引き方は、rerender で描き直される', () => {
    let ready = false;
    setIconResolver((name) => (ready ? { body: '<path d="M3 3"/>', attrs: {} } : 'pending'));
    const el = svgOf('late');
    expect(el.innerHTML).toBe('');
    ready = true;
    rerender();
    expect(el.innerHTML).toContain('M3 3');
  });
});
