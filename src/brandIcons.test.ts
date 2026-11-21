// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { BRAND_ICONS, defineBrandIcons } from './brandIcons';
import { lookupIcon, registerIcon } from './icons.svelte';

describe('共通の独自アイコン', () => {
  it('defineBrandIcons で、どのロゴも名前で引ける。登録簿では上書きできない', () => {
    defineBrandIcons();
    defineBrandIcons(); // 何度呼んでもよい
    for (const [name, def] of Object.entries(BRAND_ICONS)) expect(lookupIcon(name), name).toEqual(def);
    expect(Object.keys(BRAND_ICONS)).toEqual(expect.arrayContaining(['disnans-logo', 'fixplor-logo', 'brand-docker', 'brand-git', 'brand-github', 'brand-markdown', 'brand-playwright', 'brand-python']));
    expect(() => registerIcon('fixplor-logo', '<path d="M1 1"/>')).toThrow();
  });

  it('Lucide と並べて揃うように、色は currentColor のまま（色を固定する属性を持たない）', () => {
    for (const [name, def] of Object.entries(BRAND_ICONS)) {
      expect(def.body, name).not.toMatch(/(?:stroke|fill)=/);
      expect(def.attrs, name).toEqual({});
    }
  });
});
