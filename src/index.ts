// @3pino/ui-kit-web: 3pino のアプリ共通の UI 部品。
//  - Svelte の部品: `@3pino/ui-kit-web/Button.svelte` のように 1 つずつ取り込む（このファイルでは束ねない）
//  - フレームワークに依らない DOM の部品: `@3pino/ui-kit-web/dom`
//  - アイコンの名前の引き方・振動の差し替え口など、部品の外から決めること（下）

export {
  ICON_NAME_RE,
  createIcon,
  defineBuiltinIcon,
  fillIcon,
  hasIcon,
  iconRevision,
  loadLucide,
  lookupIcon,
  lucideKey,
  parseIconSvg,
  registerIcon,
  rerender,
  setIconResolver,
  type IconDef,
  type IconOptions,
  type IconRef,
  type IconResolver,
} from './icons.svelte';
export { setHaptics, vibrate, type Vibrate } from './haptics';
export { SWIPE_LOCK_PX, swipeAxis, type SwipeAxis } from './gesture';
export * from './sortable';
