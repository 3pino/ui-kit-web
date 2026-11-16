// 短い振動（操作の合図）。既定は navigator.vibrate（対応していない環境では何もしない）。
// 端末ごとに振動のしかたが違う（Tauri の Android はネイティブの振動を使う）ので、使う側が setHaptics で差し替える

export type Vibrate = (ms: number) => void;

const browserVibrate: Vibrate = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // 対応していない・許可されていないときは、何もしない
  }
};

let impl: Vibrate = browserVibrate;

/** 振動のしかたを差し替える。null で既定（navigator.vibrate）に戻す。返り値は、差し替える前のもの */
export function setHaptics(fn: Vibrate | null): Vibrate {
  const prev = impl;
  impl = fn ?? browserVibrate;
  return prev;
}

/** 短く振動する（ms）。部品の中の長押しなどの合図 */
export function vibrate(ms: number): void {
  impl(ms);
}
