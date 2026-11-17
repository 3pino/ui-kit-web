// ポップアップのメニューの置き場所の決め方（Menu.svelte と、DOM の menu が同じものを使う）。DOM を測るだけで、書き換えない

/** 画面の端から空ける量（px） */
export const MENU_EDGE = 8;

export type MenuPlacement = {
  /** 上側に出すか（既定の位置で画面の下端を超えるとき） */
  up: boolean;
  /** 左右にはみ出す分だけ横にずらす量（px） */
  shift: number;
};

/**
 * 使える横の範囲は画面ではなくシェルの中身（広い画面で左に縦に並ぶナビバー `.nav-bar-side` は含めない。ナビバーの上に出ない）。
 * シェル（`.shell`）の外（モバイルのナビバーは下で、横の範囲を取らない）では、従来どおり画面の幅
 */
function usableX(el: Element): { left: number; right: number } {
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const shell = el.closest('.shell');
  const nav = shell?.querySelector(':scope > .nav-bar-side');
  return { left: nav ? Math.max(0, nav.getBoundingClientRect().right) : 0, right: vw };
}

/** 開いたとき（置いたとき）に一度だけ測る。既定の位置（親の top: 100% + 6px を想定）で下端を超えるなら上に出す。左右の端を超えるなら、使える範囲に収まるよう横にずらす */
export function menuPlacement(el: HTMLElement): MenuPlacement {
  const r = el.getBoundingClientRect();
  const up = r.bottom > window.innerHeight;
  const { left, right } = usableX(el);
  let shift = 0;
  if (r.left < left + MENU_EDGE) shift = left + MENU_EDGE - r.left;
  else if (r.right > right - MENU_EDGE) shift = Math.max(left + MENU_EDGE - r.left, right - MENU_EDGE - r.right);
  return { up, shift };
}
