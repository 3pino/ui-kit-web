// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import * as dom from './dom';
import { made, root, same, svelte, useParityFixture } from './test-support/parity';
import Icon from './Icon.svelte';
import Toggle from './Toggle.svelte';
import TextInput from './TextInput.svelte';
import Divider from './Divider.svelte';
import SegmentedButton from './SegmentedButton.svelte';
import NavBar from './NavBar.svelte';
import ButtonHost from './test-support/ButtonHost.svelte';
import SettingRowHost from './test-support/SettingRowHost.svelte';

// Svelte の部品と、DOM の部品（dom）が、同じ DOM を作ること。
// 「同じ」は、タグ・クラス（順序は問わない）・属性・文字・入れ子の形。Svelte が足すだけのもの（コメント・スコープのクラス・
// 空白だけの文字列・<svg> の xmlns・<input> の type="text"）は見ない。押したあとの見た目（クラス・aria）が同じになることも確かめる。
// 片方だけの機能（Svelte の alert・deleting、DOM に無い class など）は、ここでは比べない（それぞれの部品の試験で見る）。

useParityFixture();


describe('Icon', () => {
  it.each([
    ['既定（飾り）', {}],
    ['大きさ', { size: 18 }],
    ['クラス', { class: 'extra' }],
    ['読み上げの名前つき', { label: 'サイコロ' }],
  ] as const)('%s', (_n, o) => {
    same(svelte(Icon, { icon: 'dice-5', ...o }), made(dom.icon('dice-5', o)));
  });
});

describe('Button', () => {
  it.each([
    ['文字だけ', { text: '保存' }],
    ['primary', { text: '保存', variant: 'primary' }],
    ['danger', { text: '削除', variant: 'danger' }],
    ['ghost', { text: '閉じる', variant: 'ghost' }],
    ['アイコン + 文字', { text: '配布', icon: 'upload' }],
    ['アイコンだけ', { icon: 'x', label: '閉じる' }],
    ['無効', { text: '保存', disabled: true }],
    ['読み上げの名前つき', { text: '保存', label: '設定を保存' }],
  ] as const)('%s', (_n, o) => {
    const { text, ...rest } = o as { text?: string; icon?: string; label?: string; variant?: 'primary' | 'danger' | 'ghost'; disabled?: boolean };
    same(svelte(ButtonHost, o), made(dom.button({ text, ...rest })));
  });

  it('押すと、それぞれ onClick が呼ばれる', () => {
    const fn = vi.fn();
    made(dom.button({ text: 'a', onClick: fn })).click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('文字もアイコンも無いボタン・名前の無いアイコンだけのボタンは作れない', () => {
    expect(() => dom.button({})).toThrow(dom.DomArgumentError);
    expect(() => dom.button({ icon: 'x' })).toThrow(dom.DomArgumentError);
  });
});

describe('Toggle', () => {
  it.each([
    ['オフ', { checked: false }, { value: false }],
    ['オン', { checked: true }, { value: true }],
    ['名前つき', { checked: true, label: '有効' }, { value: true, label: '有効' }],
  ] as const)('%s', (_n, s, d) => {
    same(svelte(Toggle, s), made(dom.toggle(d)));
  });

  it('押すと、見た目も onChange の値も同じになる', () => {
    const a = vi.fn();
    const b = vi.fn();
    const sv = svelte(Toggle, { checked: false, onchange: a });
    const dm = made(dom.toggle({ value: false, onChange: b }));
    for (let i = 0; i < 3; i++) {
      sv.click();
      dm.click();
      flushSync();
      same(sv, dm);
    }
    expect(a.mock.calls).toEqual(b.mock.calls);
    expect(b.mock.calls).toEqual([[true], [false], [true]]);
  });
});

describe('TextInput', () => {
  it('既定・値・プレースホルダー', () => {
    same(svelte(TextInput, {}), made(dom.input()));
    same(svelte(TextInput, { value: 'a' }), made(dom.input({ value: 'a' })));
    same(svelte(TextInput, { placeholder: '名前' }), made(dom.input({ placeholder: '名前' })));
  });

  it('打つと値が通知される', () => {
    const b = vi.fn();
    const el = made(dom.input({ onChange: b })) as HTMLInputElement;
    el.value = 'x';
    el.dispatchEvent(new Event('input'));
    expect(b).toHaveBeenCalledWith('x');
  });
});

describe('Divider', () => {
  it('同じ', () => same(svelte(Divider, {}), made(dom.divider())));
});

describe('SegmentedButton', () => {
  const options = [
    { value: 'light', label: 'ライト' },
    { value: 'dark', label: 'ダーク', icon: 'house' },
    { value: 'auto', label: '自動' },
  ];

  it('選択肢・名前つき', () => {
    same(svelte(SegmentedButton, { options, value: 'dark', label: 'テーマ' }), made(dom.segmented({ options, value: 'dark', label: 'テーマ' })));
    same(svelte(SegmentedButton, { options, value: 'light' }), made(dom.segmented({ options, value: 'light' })));
  });

  it('選ぶと、見た目も onChange の値も同じになる（選んでいるものを押しても通知しない）', () => {
    const a = vi.fn();
    const b = vi.fn();
    const sv = svelte(SegmentedButton, { options, value: 'light', onchange: a });
    const dm = made(dom.segmented({ options, value: 'light', onChange: b }));
    for (const i of [1, 1, 2, 0]) {
      sv.querySelectorAll('button')[i].click();
      dm.querySelectorAll('button')[i].click();
      flushSync();
      same(sv, dm);
    }
    expect(a.mock.calls).toEqual(b.mock.calls);
    expect(b.mock.calls).toEqual([['dark'], ['auto'], ['light']]);
  });
});

describe('NavBar', () => {
  const items = [
    { id: 'home', label: 'ホーム', icon: 'house' },
    { id: 'chat', label: 'チャット', icon: 'message-circle', badge: 3 },
    { id: 'zero', label: 'ゼロ', icon: 'house', badge: 0 },
    { id: 'text', label: '文字', icon: 'house', badge: '新' },
    { id: 'settings', label: '設定', icon: 'settings', badge: null },
  ];

  it('選択中・バッジ・名前つき（0・null・空のバッジは出さない）', () => {
    same(svelte(NavBar, { items, selected: 'chat', label: 'メニュー' }), made(dom.navbar({ items, selected: 'chat', label: 'メニュー' })));
    same(svelte(NavBar, { items }), made(dom.navbar({ items })));
  });

  it('選ぶと、見た目も onSelect の値も同じになる（Svelte の部品は、選択を親が持つので、渡し直す）', () => {
    const b = vi.fn();
    const dm = made(dom.navbar({ items, selected: 'home', onSelect: b }));
    dm.querySelectorAll('button')[1].click();
    const sv = svelte(NavBar, { items, selected: 'chat' });
    same(sv, dm);
    expect(b).toHaveBeenCalledWith('chat');
  });
});

/**
 * 既知の違い（意図したもの）: Svelte の SettingRow は、右側の操作を `<div class="setting-row-control-slot">` で包む（編集モードで操作だけを隠すため。
 * 隠すときだけ .setting-row-control-hidden が付く。SettingsField.svelte が `.setting-row-control > div` を使っているので、外せない）。
 * DOM の setting() は包まない。包むと、トグルなどの下に文字の行の余白（インラインの隙間）が入り、プラグインの今の見た目が縦に約 3px ずれるため
 * （実測: トグルが行の中央より約 3px 上がる）。この包みだけを外して比べる。包みに CSS の規則は無い（クラスは名前を付けただけ）
 */
function unwrapControl(row: HTMLElement): HTMLElement {
  const slots = row.querySelectorAll('.setting-row-control > .setting-row-control-slot');
  for (const slot of slots) slot.replaceWith(...slot.childNodes);
  return row;
}

describe('SettingRow', () => {
  it('Svelte の包み（.setting-row-control-slot）は、操作があるときだけ 1 つあり、ほかに違いは無い', () => {
    expect(svelte(SettingRowHost, { name: 'a' }).querySelectorAll('.setting-row-control-slot')).toHaveLength(0);
    const row = svelte(SettingRowHost, { name: 'a', withControl: true });
    expect(row.querySelectorAll('.setting-row-control-slot')).toHaveLength(1);
    expect(row.querySelector('.setting-row-control-slot')?.className).toBe('setting-row-control-slot');
  });

  it.each([
    ['名前だけ', { name: '通知' }],
    ['説明つき', { name: '通知', description: '新着を知らせます' }],
    ['アイコンつき', { name: '通知', icon: 'settings' }],
    ['右側の操作つき', { name: '通知', description: '説明', icon: 'settings', withControl: true }],
  ] as const)('%s', (_n, o) => {
    const { withControl, ...rest } = o as { name: string; description?: string; icon?: string; withControl?: boolean };
    const box = document.createElement('div');
    root().append(box);
    const row = dom.setting(box, { ...rest, control: withControl ? dom.toggle({ value: true, label: '有効' }) : undefined });
    expect(box.lastElementChild).toBe(row);
    same(unwrapControl(svelte(SettingRowHost, o)), row);
  });
});
