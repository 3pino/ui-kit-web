# UI 部品

3pino のアプリ（disnans・fixplor・explorer-kit）が使う、小さな Svelte 5 の UI 部品です。

```svelte
import Button from '@3pino/ui-kit-web/Button.svelte'
```

**見た目の正は、[@3pino/design-system](https://github.com/3pino/design-system) のグローバルの CSS クラス**（`components.css`。トークンは `tokens.css`）です。
このパッケージは、そのクラスを付けるだけの薄い部品で、色や大きさは持ちません。取り込む側のアプリが design-system の CSS を読み込んでください。

> **このパッケージは、Svelte の部品だけを出します**（v0.3.0 から。v0.2.0 までにあった、同じ DOM を作る `@3pino/ui-kit-web/dom` は削除しました）。
> DOM の作り手を別に持つと、2 つの作りの違いを見張り続けることになるためです。Svelte でない側（disnans のプラグインなど）が DOM の要素を必要とするときは、
> **使う側が Svelte の部品を `mount` して**、できた要素を渡します（disnans は `disnans.ui` を、この部品を載せて作っています）。

## 目次

- [アイコン](#アイコン)
- [部品](#部品): [Icon](#icon) · [Button](#button) · [IconButton](#iconbutton) · [Toggle](#toggle) · [TextInput](#textinput) · [SegmentedButton](#segmentedbutton) · [NavBar](#navbar) · [Divider](#divider) · [SettingRow](#settingrow) · [Section](#section) · [StatusLine](#statusline) · [Slider](#slider) · [Menu / MenuItem](#menu--menuitem) · [Modal](#modal) · [PanelBar](#panelbar) · [SuggestList](#suggestlist)
- [SortableList](#sortablelist)
- [部品の外から決めること](#部品の外から決めること)
- [CSS クラスの決まり](#css-クラスの決まり)

---

## アイコン

アイコンを受け取るところは、Svelte では **名前（文字列）か Svelte のアイコン部品**（`@lucide/svelte/icons/xxx` など）、
名前は次の順に探します。

1. アプリが `defineBuiltinIcon` で定義した独自のアイコン（アプリのロゴなど。上書きできません）
2. `registerIcon` で登録したもの（プラグインのアイコンなど。同じ名前は後勝ちで、外すと前のものに戻ります）
3. 既定の引き方: [Lucide](https://lucide.dev/icons) の名前（例: `dice-5`, `message-circle`）。初めて使うときに、別のチャンクで読み込みます（読み込むまでの一瞬は空で、読み込めたら描き直します）

見つからない名前は空のアイコンになり、コンソールに警告が出ます。アイコンは 24x24 の `<svg>`（`stroke="currentColor"`・線の太さ 2・角は丸）で、どれも並べて見た目がそろいます。

Svelte の画面では、**アイコン部品を渡す**のが基本です（すぐに描けて、使う分だけがバンドルに入ります）。名前（文字列）は、プラグインが指定したアイコンなど、実行時に決まるものに使います。

```ts
import { defineBuiltinIcon, registerIcon, fillIcon } from '@3pino/ui-kit-web';

defineBuiltinIcon('my-logo', { body: '<path d="M3 3h18v18H3z"/>', attrs: {} });   // アプリの独自のアイコン
const off = registerIcon('dice-cup', '<path d="M5 4h14l-2 16H7z"/>');           // 中身だけ、または <svg> まるごと
off();                                                                            // 外す

fillIcon(existingSvg, 'dice-5');                                                  // 既存の <svg> の中身を入れ替える（`<Icon>` が使う）
```

- 登録の SVG は `<script>`・イベント属性・`javascript:` のリンクを取り除いて取り込みます
- 名前に使える文字は、英数字・ハイフン・コロン・アンダースコア（`ICON_NAME_RE`）
- 引き方を差し替える（Lucide でなく自前のアイコン集を使う）には `setIconResolver`（[下](#部品の外から決めること)）

---

## 部品

### Icon

| | |
| --- | --- |
| クラス | `.icon`（`<svg>`） |
| Svelte | `<Icon icon="dice-5" size={18} label="サイコロ" class="x" />`。`icon` は名前かアイコン部品。`size` の既定は 24 |
| 状態 | `label` があれば `role="img"` + `aria-label`、なければ飾り（`aria-hidden="true"`） |

### Button

| | |
| --- | --- |
| クラス | `.btn`（`.primary` / `.danger` / `.ghost` / `.btn-icon-only`） |
| Svelte | `<Button variant="primary" icon={Upload} onclick={...}>配布</Button>`。`type` の既定は `button`（送信は `type="submit"`）。ほかの属性はそのまま `<button>` に渡る |
| 中身 | アイコン（文字つきは 15px、アイコンだけは 18px）→ 文字 |
| 状態 | `variant`: `default` / `primary` / `danger` / `ghost`（枠も背景もなく、ホバーで背景に色が付く）。`disabled`。中身（文字）がなくて `icon` だけなら `.btn-icon-only`（正方形。`label` が必須） |

### IconButton

| | |
| --- | --- |
| クラス | `.icon-btn`（`.active`） |
| Svelte | `<IconButton label="閉じる" icon={X} onclick={...} />`、または中身にアイコンを書く。枠のないアイコンだけのボタン。`label` は `aria-label`（必須） |
| 状態 | `active`（押されている） |

### Toggle

| | |
| --- | --- |
| クラス | `.toggle` / `.toggle-thumb`（`.toggle-on`） |
| Svelte | `<Toggle bind:checked label="有効" onchange={...} />`（`disabled` も使えます） |
| 状態 | `<button role="switch" aria-checked>`。オンで `.toggle-on`。`label` は読み上げ用の名前（見える名前は `SettingRow` などで横に出す） |

### TextInput

| | |
| --- | --- |
| クラス | `.input` |
| Svelte | `<TextInput bind:value placeholder="..." />`。ほかの属性はそのまま `<input>` に渡る |

### SegmentedButton

| | |
| --- | --- |
| クラス | `.segmented` / `.segmented-option`（`-selected`） |
| Svelte | `<SegmentedButton label="テーマ" options={[{ value, label, icon? }]} bind:value onchange={...} />` |
| 状態 | `role="radiogroup"` の中に `role="radio"` のボタン。選択中は `.segmented-option-selected` と `aria-checked="true"`。アイコンは 15px |

### NavBar

| | |
| --- | --- |
| クラス | `.nav-bar` / `.nav-bar-item`（`-selected`） / `-item-icon` / `-item-badge`（`.badge` も付く） / `-item-label` |
| Svelte | `<NavBar items={[{ id, label, icon, badge?, alert? }]} selected={...} label="メニュー" onselect={...} />`。広い画面では `class="nav-bar-side"` を足すと左に縦に並ぶ。選択は親が持つ |
| 状態 | 選択中は `.nav-bar-item-selected` と `aria-current="page"`。`badge` が 0・空文字列・`null`・未指定なら出さない。アイコンは 22px。`alert`（新しいものがあることを示す点）は Svelte だけ |

### Divider

| | |
| --- | --- |
| クラス | `.divider`（`<hr>`） |
| Svelte | `<Divider />` |

### SettingRow

| | |
| --- | --- |
| クラス | `.setting-row` / `-icon` / `-info` / `-name` / `-description` / `-control` |
| Svelte | `<SettingRow name="..." description="..." icon="..."> {#snippet control()}<Toggle ... />{/snippet} </SettingRow>` |
| ほかの使い方 | `onclick`（行全体が ghost ボタンになる。`.setting-row-button`。読み上げの名前は `name`、`control` は飾りだけにする）、`deleting` / `ondelete` / `deleteLabel`（編集モードの × ） |
| 包み | 右側の操作は `<div class="setting-row-control-slot">` で包みます（編集モードで操作だけを隠すため。この名前に CSS の規則はありません）。`SettingsField.svelte`（disnans）は `.setting-row-control > div` を使うので、この包みは外せません |

### Section

| | |
| --- | --- |
| クラス | `.setting-section` / `-divider`（`<hr class="divider setting-section-divider">`） / `-title`（`<h2>`） |
| Svelte | `<Section title="通知">...</Section>` |
| 状態 | 区切り線は、前にもセクションがあるときだけ出る（CSS）。中身の縦の間隔は 10px |

### StatusLine

| | |
| --- | --- |
| クラス | `.status-line`（`-muted` / `-ok` / `-accent` / `-warn` / `-error`） |
| Svelte | `<StatusLine kind="ok" icon={CircleCheck}>最新です</StatusLine>`。`icon` は Svelte のアイコン部品か、アイコンの名前 |
| 状態 | `busy` で回るアイコン（`.spin`。`icon` より優先）。アイコンは 15px |

### Slider

| | |
| --- | --- |
| クラス | `.slider` / `-input`（`<input type="range">`） / `-value` |
| Svelte | `<Slider label="マイクの音量" min={0} max={200} step={5} bind:value format={(v) => `${v}%`} oninput={...} onchange={...} />` |
| 状態 | `onInput` は動かしている間、`onChange` は離したとき。`disabled` |

### Menu / MenuItem

`.menu` / `.menu-backdrop` / `.menu-item`（`.menu-item-danger`）。

```svelte
<Menu class="..." onclose={() => (open = false)}>
  <MenuItem icon={Paperclip} onclick={...}>添付</MenuItem>
  <MenuItem danger onclick={...}>削除</MenuItem>
</Menu>
```

| | |
| --- | --- |
| Svelte | `<Menu label class onclose>` と `<MenuItem icon iconSize danger disabled reason class onclick>` |
| 状態 | `disabled` のとき、`reason` は項目名の下に小さく常に出る（ホバーのない画面でも読める）。`title` にも入る |
| 置き場所 | 位置は使う側が `class` で決める（親の既定の位置は `top: 100% + 6px` を想定）。置いたときに一度だけ測り、下にはみ出すなら上へ、左右にはみ出すなら横へずらす。左端がナビゲーションバー（`.nav-bar-side`）に隠れないよう、`.shell` の中にあるときは表示領域の左を基準に収める（測り方は `menuPlacement.ts`） |

`<Menu>` は、幕（`onclose` があるとき）と本体の 2 つの兄弟の要素を作ります。閉じるのは呼んだ側です（`onclose` の中で親が外す）。

### Modal

| | |
| --- | --- |
| クラス | `.modal-scrim`（幕） / `.modal`（`role="dialog" aria-modal="true"`、幅は `--modal-w`） / `-title` / `-actions`（ボタンの並び） |
| Svelte | `<Modal title="..." width={420} onclose={...}>...</Modal>` |
| 状態 | Esc と幕の押下で `onClose`（閉じるのは呼んだ側）。開いたとき最初の入力欄・ボタンにフォーカスし、閉じたら元のフォーカスに戻す（`focusFirstIn`。Svelte と同じ関数）。`close()` のあとの Esc は無視する |

### PanelBar

| | |
| --- | --- |
| クラス | `.top-bar .panel-bar`（`<header>`） / `-main` |
| Svelte | `<PanelBar>題名{#snippet actions()}...{/snippet}</PanelBar>` |

### SuggestList

| | |
| --- | --- |
| クラス | `.suggest-list`（`<ul role="listbox">`） / `-option`（`<li role="option">`） / `-item`（`<button>`。`-selected`）。中身の `-item-title` / `-item-detail` などは使う側で書く |
| Svelte | `<SuggestList bind:this={list} bind:index items={users} key={(u) => u.id} label="メンション" onpick={pick} onclose={close}>{#snippet item(u)}...{/snippet}</SuggestList>`。入力欄の `keydown` から `list.keydown(e)` |
| 状態 | `keydown` は、上下（端でぐるっと回る）・Enter・Tab（選ぶ）・Esc（`onClose`）を処理したら `true`（既定の動作も止める）。候補が空なら `false`。ボタンは `mousedown` で入力欄からフォーカスを奪わない |

---

### SortableList

`.sortable-list`（中の `.sortable-list-item` / `-grip` / `-body` は部品の中で書く）。

```svelte
<SortableList items={...} getId={(i) => i.id} getLabel={(i) => i.name} onmove={(id, to) => ...} onremove={...} removable={...}>
  {#snippet row(item, state)}...{/snippet}
</SortableList>
```

- 左のつまみをドラッグ（上下キー・Home・End でも動かせる）。ほかの行が空きへ滑って、入る位置が見える
- マウス・ペン: 縦に動かすと並べ替え。タッチ: 押したまま動かす。長押し（`LONG_PRESS_MS`）の前の縦の動きはページのスクロール
- 長押しで「編集モード」（振動で知らせる）。行を持ち上げて選択し、編集モードでは並べ替えも削除もすぐできる。リストの外のタップか Escape で終わる
- 並びの保存は `onmove` で親が行う。行の中身は `row`（snippet）で渡し、第 2 引数で編集モードの状態と削除（`{ deleting, canRemove, remove }`）を受け取る
- 振動は `setHaptics` で差し替えられます（既定は `navigator.vibrate`）。並べ替えの計算は `sortable.ts`（DOM を使わない関数。`moveItem` など）

---

## 部品の外から決めること

アプリごとに違うことは、部品の中に持たず、差し込み口にしてあります（`import { ... } from '@3pino/ui-kit-web'`）。

| 口 | 何を決めるか | 既定 |
| --- | --- | --- |
| `defineBuiltinIcon(name, { body, attrs })` | アプリの独自のアイコン（ロゴなど）。上書きできない | なし |
| `registerIcon(name, svg)` | あとから足すアイコン（プラグインなど）。返り値の関数で外す | なし |
| `setIconResolver((name) => IconDef \| 'pending' \| null)` | 名前の引き方。`'pending'` を返したら、読み込めたときに `rerender()` を呼ぶ。`null` で Lucide に戻す | Lucide |
| `setHaptics((ms) => void)` | 短い振動のしかた（長押しの合図） | `navigator.vibrate` |

トースト・確認ダイアログ・戻る操作など、アプリの機能に結びつくものは、このパッケージには含めません（アプリの側で持ちます。プラグインへ DOM を渡す `disnans.ui` も、disnans の側で、ここの部品を `mount` して作っています）。

## CSS クラスの決まり

- 部品は `.part`、部品の中は `.part-child`、状態は `.part-state`（例: `.toggle-on`）
- 位置や大きさなど、使う場所だけの調整は、`class` を渡して使う側の `<style>` で `:global(.xxx)` を使って書く
- 部品を足したり DOM を変えたりしたら、`@3pino/design-system` の CSS・この文書・`components.test.ts`（部品ごとの DOM と動きの試験）をそろえる
- 見た目の CSS は `@3pino/design-system` のグローバルのクラスが正。ただし PanelBar と MenuItem（押せない項目）の一部の規則は、Svelte の部品の中（スコープつき）にある。いずれ design-system へ移すと一本化できる

ほかのグローバルクラス（design-system）: `.field-label`（入力欄の上の小さな見出し）、`.muted`、`.scroll`、`.badge`、`.kbd`、`.spin`、`.sr-only`、`.top-bar`。
