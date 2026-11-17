# UI 部品

3pino のアプリ（disnans・fixplor・explorer-kit）とプラグインが使う、小さな UI 部品です。部品は 2 通りの作り方があり、**同じクラスを付けた同じ DOM** になります。

| 作り方 | 使う場面 | 取り込み |
| --- | --- | --- |
| **Svelte の部品** | アプリの画面 | `import Button from '@3pino/ui-kit/Button.svelte'` |
| **DOM の部品**（フレームワークに依らない） | プラグイン、Svelte でない画面、テスト | `import * as dom from '@3pino/ui-kit/dom'` |

**見た目の正は、[@3pino/design-system](https://github.com/3pino/design-system) のグローバルの CSS クラス**（`components.css`。トークンは `tokens.css`）です。
このパッケージは、そのクラスを付けるだけの薄い部品で、色や大きさは持ちません。取り込む側のアプリが design-system の CSS を読み込んでください。

DOM の部品があるのは、`icon` `button` `toggle` `input` `segmented` `navbar` `divider` `setting` の 8 つです。
Svelte だけの部品（下の「Svelte だけの部品」）は、DOM の作り方がありません。

2 つの作り方が同じ DOM になることは、`src/parity.test.ts` が部品ごとに確かめています（Svelte で描いたものと DOM で作ったものの、タグ・クラス・属性・入れ子・文字を比べ、押したあとの見た目も比べます）。
部品を変えたら、両方をそろえてください。

## 目次

- [アイコン](#アイコン)
- [部品](#部品): [Icon](#icon) · [Button](#button) · [IconButton](#iconbutton) · [Toggle](#toggle) · [TextInput](#textinput) · [SegmentedButton](#segmentedbutton) · [NavBar](#navbar) · [Divider](#divider) · [SettingRow](#settingrow)
- [Svelte だけの部品](#svelte-だけの部品): [Section](#section) · [StatusLine](#statusline) · [Slider](#slider) · [Menu / MenuItem](#menu--menuitem) · [Modal](#modal) · [PanelBar](#panelbar) · [SuggestList](#suggestlist) · [SortableList](#sortablelist)
- [部品の外から決めること](#部品の外から決めること)
- [CSS クラスの決まり](#css-クラスの決まり)

---

## アイコン

アイコンを受け取るところは、Svelte では **名前（文字列）か Svelte のアイコン部品**（`@lucide/svelte/icons/xxx` など）、DOM では **名前（文字列）** で指定します。
名前は次の順に探します。

1. アプリが `defineBuiltinIcon` で定義した独自のアイコン（アプリのロゴなど。上書きできません）
2. `registerIcon` で登録したもの（プラグインのアイコンなど。同じ名前は後勝ちで、外すと前のものに戻ります）
3. 既定の引き方: [Lucide](https://lucide.dev/icons) の名前（例: `dice-5`, `message-circle`）。初めて使うときに、別のチャンクで読み込みます（読み込むまでの一瞬は空で、読み込めたら描き直します）

見つからない名前は空のアイコンになり、コンソールに警告が出ます。アイコンは 24x24 の `<svg>`（`stroke="currentColor"`・線の太さ 2・角は丸）で、どれも並べて見た目がそろいます。

Svelte の画面では、**アイコン部品を渡す**のが基本です（すぐに描けて、使う分だけがバンドルに入ります）。名前（文字列）は、プラグインが指定したアイコンなど、実行時に決まるものに使います。

```ts
import { defineBuiltinIcon, registerIcon, createIcon, fillIcon } from '@3pino/ui-kit';

defineBuiltinIcon('my-logo', { body: '<path d="M3 3h18v18H3z"/>', attrs: {} });   // アプリの独自のアイコン
const off = registerIcon('dice-cup', '<path d="M5 4h14l-2 16H7z"/>');           // 中身だけ、または <svg> まるごと
off();                                                                            // 外す

const el = createIcon('dice-5', { size: 18, label: 'サイコロ' });                  // <svg class="icon">
fillIcon(existingSvg, 'dice-5');                                                  // 既存の <svg> の中身を入れ替える
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
| DOM | `dom.icon('dice-5', { size: 18, label: 'サイコロ', class: 'x' })` → `SVGSVGElement` |
| 状態 | `label` があれば `role="img"` + `aria-label`、なければ飾り（`aria-hidden="true"`） |

### Button

| | |
| --- | --- |
| クラス | `.btn`（`.primary` / `.danger` / `.ghost` / `.btn-icon-only`） |
| Svelte | `<Button variant="primary" icon={Upload} onclick={...}>配布</Button>`。`type` の既定は `button`（送信は `type="submit"`）。ほかの属性はそのまま `<button>` に渡る |
| DOM | `dom.button({ text: '配布', icon: 'upload', variant: 'primary', label, disabled, onClick })`（`variant` の既定は `'default'`） → `HTMLButtonElement`。`text` か `icon` が要る。アイコンだけなら `label` も要る（足りないと `DomArgumentError`） |
| 中身 | アイコン（文字つきは 15px、アイコンだけは 18px）→ 文字 |
| 状態 | `variant`: `default` / `primary` / `danger` / `ghost`（枠も背景もなく、ホバーで背景に色が付く）。`disabled`。中身（文字）がなくて `icon` だけなら `.btn-icon-only`（正方形。`label` が必須） |

### IconButton

| | |
| --- | --- |
| クラス | `.icon-btn`（`.active`） |
| Svelte | `<IconButton label="閉じる" icon={X} onclick={...} />`、または中身にアイコンを書く。枠のないアイコンだけのボタン。`label` は `aria-label`（必須） |
| DOM | なし。`<button class="icon-btn">` に `dom.icon(...)` を入れて作れます |
| 状態 | `active`（押されている） |

### Toggle

| | |
| --- | --- |
| クラス | `.toggle` / `.toggle-thumb`（`.toggle-on`） |
| Svelte | `<Toggle bind:checked label="有効" onchange={...} />`（`disabled` も使えます） |
| DOM | `dom.toggle({ value: true, label: '有効', onChange: (v) => {} })` → `HTMLButtonElement`（押すと見た目も切り替わる） |
| 状態 | `<button role="switch" aria-checked>`。オンで `.toggle-on`。`label` は読み上げ用の名前（見える名前は `SettingRow` などで横に出す） |

### TextInput

| | |
| --- | --- |
| クラス | `.input` |
| Svelte | `<TextInput bind:value placeholder="..." />`。ほかの属性はそのまま `<input>` に渡る |
| DOM | `dom.input({ value, placeholder, onChange })` → `HTMLInputElement`（`onChange` は打つたびに呼ばれる） |

### SegmentedButton

| | |
| --- | --- |
| クラス | `.segmented` / `.segmented-option`（`-selected`） |
| Svelte | `<SegmentedButton label="テーマ" options={[{ value, label, icon? }]} bind:value onchange={...} />` |
| DOM | `dom.segmented({ options, value, onChange, label })` → `HTMLDivElement`（選ぶと見た目も切り替わる。選んでいるものを押しても通知しない） |
| 状態 | `role="radiogroup"` の中に `role="radio"` のボタン。選択中は `.segmented-option-selected` と `aria-checked="true"`。アイコンは 15px |

### NavBar

| | |
| --- | --- |
| クラス | `.nav-bar` / `.nav-bar-item`（`-selected`） / `-item-icon` / `-item-badge`（`.badge` も付く） / `-item-label` |
| Svelte | `<NavBar items={[{ id, label, icon, badge?, alert? }]} selected={...} label="メニュー" onselect={...} />`。広い画面では `class="nav-bar-side"` を足すと左に縦に並ぶ。選択は親が持つ |
| DOM | `dom.navbar({ items, selected, onSelect, label })` → `HTMLElement`（`<nav>`。選ぶと見た目も切り替わる） |
| 状態 | 選択中は `.nav-bar-item-selected` と `aria-current="page"`。`badge` が 0・空文字列・`null`・未指定なら出さない。アイコンは 22px。`alert`（新しいものがあることを示す点）は Svelte だけ |

### Divider

| | |
| --- | --- |
| クラス | `.divider`（`<hr>`） |
| Svelte | `<Divider />` |
| DOM | `dom.divider()` → `HTMLHRElement` |

### SettingRow

| | |
| --- | --- |
| クラス | `.setting-row` / `-icon` / `-info` / `-name` / `-description` / `-control` |
| Svelte | `<SettingRow name="..." description="..." icon="..."> {#snippet control()}<Toggle ... />{/snippet} </SettingRow>` |
| DOM | `dom.setting(container, { name, description, icon, control })`。`container` の末尾に足して、行を返す。`control` は DOM の要素（`dom.toggle(...)` など） |
| Svelte だけ | `onclick`（行全体が ghost ボタンになる。`.setting-row-button`。読み上げの名前は `name`、`control` は飾りだけにする）、`deleting` / `ondelete` / `deleteLabel`（編集モードの × ） |
| 違い | Svelte は右側の操作を、クラスも属性もない `<div>` で包みます（編集モードで操作だけを隠すため）。DOM は包みません。`parity.test.ts` はこの包みだけを外して比べます |

---

## Svelte だけの部品

### Section

`.setting-section` / `-divider` / `-title`。`<Section title="通知">...</Section>`。区切り線（Divider。前にもセクションがあるときだけ出る）+ 見出し。中身の縦の間隔は 10px。

### StatusLine

`.status-line`（`-muted` / `-ok` / `-accent` / `-warn` / `-error`）。`<StatusLine kind="ok" icon={CircleCheck}>最新です</StatusLine>`。`busy` で回るアイコン（`icon` より優先）。

### Slider

`.slider` / `-input` / `-value`。`<Slider label="マイクの音量" min={0} max={200} step={5} value={v} format={(v) => `${v}%`} oninput={...} onchange={...} />`。
`oninput` は動かしている間、`onchange` は離したとき。`disabled` も使えます。

### Menu / MenuItem

`.menu` / `.menu-backdrop` / `.menu-item`（`.menu-item-danger`）。

```svelte
<Menu class="..." onclose={() => (open = false)}>
  <MenuItem icon={Paperclip} onclick={...}>添付</MenuItem>
  <MenuItem danger onclick={...}>削除</MenuItem>
</Menu>
```

位置は使う側で決めます（`class` を渡して `:global(...)` で書く）。左端がナビゲーションバー（`.nav-bar-side`）に隠れないよう、`.shell` の中にあるときは表示領域の左を基準に収めます。`icon` は名前でもよい。

### Modal

`.modal-scrim` / `.modal` / `.modal-title` / `.modal-actions`。`<Modal title="..." onclose={...}>...</Modal>`。ボタンの並びは `.modal-actions`。
Esc と外側のタップで `onclose`。開いたとき最初のボタン・入力欄にフォーカスし、閉じたら元のフォーカスに戻します。

### PanelBar

`.top-bar .panel-bar`。`<PanelBar>題名{#snippet actions()}...{/snippet}</PanelBar>`。左に題名や場所（残りの幅）、右に操作を並べる上のバー。

### SuggestList

`.suggest-list` / `-item`（`-selected`） / `-item-title` / `-item-detail`。入力欄の補完候補。候補の配列と、候補 1 つ分の中身（snippet）を渡します。
キー操作は、入力欄の `keydown` から `keydown()` を呼びます（上下・Enter・Tab・Esc を処理したら `true`）。

```svelte
<SuggestList bind:this={list} bind:index items={users} key={(u) => u.id} label="メンション" onpick={pick} onclose={close}>
  {#snippet item(u)}
    <span class="suggest-list-item-title">{u.display_name}</span>
    <span class="suggest-list-item-detail">{u.login_name}</span>
  {/snippet}
</SuggestList>
```

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

アプリごとに違うことは、部品の中に持たず、差し込み口にしてあります（`import { ... } from '@3pino/ui-kit'`）。

| 口 | 何を決めるか | 既定 |
| --- | --- | --- |
| `defineBuiltinIcon(name, { body, attrs })` | アプリの独自のアイコン（ロゴなど）。上書きできない | なし |
| `registerIcon(name, svg)` | あとから足すアイコン（プラグインなど）。返り値の関数で外す | なし |
| `setIconResolver((name) => IconDef \| 'pending' \| null)` | 名前の引き方。`'pending'` を返したら、読み込めたときに `rerender()` を呼ぶ。`null` で Lucide に戻す | Lucide |
| `setHaptics((ms) => void)` | 短い振動のしかた（長押しの合図） | `navigator.vibrate` |

トースト・確認ダイアログ・戻る操作など、アプリの機能に結びつくものは、このパッケージには含めません（アプリの側で、`dom` の部品と合わせて渡します）。

## CSS クラスの決まり

- 部品は `.part`、部品の中は `.part-child`、状態は `.part-state`（例: `.toggle-on`）
- 位置や大きさなど、使う場所だけの調整は、`class` を渡して使う側の `<style>` で `:global(.xxx)` を使って書く
- 部品を足したり DOM を変えたりしたら、Svelte の部品・`src/dom`・`@3pino/design-system` の CSS・この文書・`parity.test.ts` をそろえる

ほかのグローバルクラス（design-system）: `.field-label`（入力欄の上の小さな見出し）、`.muted`、`.scroll`、`.badge`、`.kbd`、`.spin`、`.sr-only`、`.top-bar`。
