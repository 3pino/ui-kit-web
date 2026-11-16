// 指・ポインターの動きの判定（DOM は使わない）

/** 横か縦かを決めるまでに必要な動き（px）。小さな揺れで決めないため */
export const SWIPE_LOCK_PX = 8;

export type SwipeAxis = 'x' | 'y';

/**
 * 指の動き（開始点からの差）から、横か縦かを決める。
 * どちらも SWIPE_LOCK_PX に届くまでは null（まだ決めない）。横の動きが縦より大きいときだけ 'x'。
 */
export function swipeAxis(dx: number, dy: number): SwipeAxis | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_LOCK_PX) return null;
  return Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
}
