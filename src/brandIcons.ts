import { defineBuiltinIcon, type IconDef } from './icons.svelte';

// 3pino のアプリ共通の独自アイコン（アプリのロゴなど）。どのアプリでも、同じ名前で描ける。
// Lucide と並べても揃うように、24x24・線の太さ 2・角は丸・色は currentColor（文字の色で着く）で作る。
// 使うアプリは、起動時に defineBrandIcons() を 1 回呼ぶ（登録簿の「本体の独自のアイコン」になり、上書きされない）。
// 新しいアイコンは、ここに足す。名前は、アプリのロゴなら `<アプリ名>-logo`、ほかの製品・ファイルの種類のしるしなら `brand-<名前>`（ほかと重ならないもの）

export const BRAND_ICONS: Readonly<Record<string, IconDef>> = {
  /** disnans のロゴ（吹き出し） */
  'disnans-logo': {
    body: '<path d="m3.6 17.4-1.065 3.29a1 1 0 001.236 1.168l3.413-.998A10 10 0 103.6 6.4z"/>',
    attrs: {},
  },
  /** fixplor のロゴ（フォルダ） */
  'fixplor-logo': {
    body: '<path d="M14 3H6a4 4 0 0 0-4 4V21"/><path d="M3 11h7"/><path d="M14 7v2a2 2 0 0 0 2 2H20a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H6"/>',
    attrs: {},
  },
  /** Docker（クジラとコンテナ） */
  'brand-docker': {
    body: '<path d="M2 14c0 10 11 8 16 0z"/><path d="M3 8v3h4V8z"/><path d="M10 8v3h4V8z"/><path d="M10 2v3h4V2z"/><path d="M18 14c-2-1-2-4 1-6M18 14c2-2 2-2 4-1"/>',
    attrs: {},
  },
  /** Git（ひし形に枝分かれ） */
  'brand-git': {
    body: '<path d="M12 2 2 12l10 10 10-10z"/><path d="M12 8.5V16"/><path d="m16 12.5-7-7"/><circle cx="12" cy="16" r="0.75"/><circle cx="12" cy="8.5" r="0.75"/><circle cx="16" cy="12.5" r="0.75"/>',
    attrs: {},
  },
  /** GitHub（ネコ） */
  'brand-github': {
    body: '<path d="M10.913 15.691c-3.404-.412-5.8-2.862-5.8-6.032c0-1.29.464-2.682 1.237-3.61c-.335-.85-.284-2.656.103-3.404c1.031-.128 2.424.413 3.249 1.16c.98-.31 2.01-.464 3.274-.464c.929 0 2.295.155 3.223.437c.798-.721 2.216-1.262 3.248-1.134c.36.697.412 2.5.077 3.377c.825.98 1.263 2.295 1.263 3.636c0 3.17-2.397 5.568-5.852 6.006c.876.567 1.47 1.805 1.47 3.223v2.68"/><path d="M10.965 15.665c-.877.567-1.47 1.805-1.47 3.223"/><path d="M9.495 18.888v2.68"/><path d="m9.19 18.443-.584.169-.612.014-.597-.132-.54-.29-.457-.405-.387-.477-.366-.491-.366-.479-.39-.428-.475-.304-.56-.05-.47.019"/>',
    attrs: {},
  },
  /** Markdown（M を、下向きの矢印に） */
  'brand-markdown': {
    body: '<path d="M3 14 12 22l9-8h-4V3l-5 3-5-3v11z"/>',
    attrs: {},
  },
  /** Playwright（盾の顔） */
  'brand-playwright': {
    body: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V3a1 1 0 0 1 1-1C6 2 10 5 12 5S18 2 19 2a1 1 0 0 1 1 1z"/><path d="M7.5 10c1-1 2-1 3 0"/><path d="M13.5 10c1-1 2-1 3 0"/><path d="M9 16c1 2 5 2 6 0"/>',
    attrs: {},
  },
  /** Python（2 匹のヘビ） */
  'brand-python': {
    body: '<path d="M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H10a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2M20 8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H12M4 16a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h8"/>',
    attrs: {},
  },
};

/** 共通の独自アイコンを、すべて登録簿に定義する（何度呼んでもよい） */
export function defineBrandIcons(): void {
  for (const [name, def] of Object.entries(BRAND_ICONS)) defineBuiltinIcon(name, def);
}
