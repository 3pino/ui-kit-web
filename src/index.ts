// @3pino/ui-kit-web: 3pino のアプリ共通の UI 部品。
//  - Svelte の部品: `@3pino/ui-kit-web/Button.svelte` のように 1 つずつ取り込む（このファイルでは束ねない）
//  - アイコンの名前の引き方・振動の差し替え口など、部品の外から決めること（下）

export {
  ICON_NAME_RE,
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
  type IconRef,
  type IconResolver,
} from './icons.svelte';
export { BRAND_ICONS, defineBrandIcons } from './brandIcons';
export { setHaptics, vibrate, type Vibrate } from './haptics';
export { SWIPE_LOCK_PX, swipeAxis, type SwipeAxis } from './gesture';
export * from './sortable';
