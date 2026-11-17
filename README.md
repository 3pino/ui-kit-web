# @3pino/ui-kit-web

3pino のアプリ共通の UI 部品（Svelte 5）。[disnans](https://github.com/3pino/disnans)・[fixplor](https://github.com/3pino/fixplor)・[@3pino/explorer-kit](https://github.com/3pino/explorer-kit) と、disnans のプラグインが使います。

- **Svelte の部品**: `Button` `IconButton` `Icon` `Toggle` `TextInput` `SegmentedButton` `NavBar` `Divider` `SettingRow` `Section` `StatusLine` `Slider` `Menu` `MenuItem` `Modal` `PanelBar` `SuggestList` `SortableList`
- **DOM の作り手は出しません**（v0.3.0 から。v0.2.0 までの `@3pino/ui-kit-web/dom` は削除）。Svelte でない側が DOM の要素を必要とするとき（disnans のプラグイン向けの `disnans.ui` など）は、使う側がこの部品を `mount` して、できた要素を渡します
- **並べ替えの計算・ジェスチャー・振動**: `@3pino/ui-kit-web/sortable` `@3pino/ui-kit-web/gesture` `@3pino/ui-kit-web/haptics`（DOM を使わない関数）
- **アイコン**（`@3pino/ui-kit-web/icons`）: 名前から引く登録簿（既定は Lucide。アプリの独自のアイコン・あとから足すアイコン・引き方の差し替えができる）

見た目は [@3pino/design-system](https://github.com/3pino/design-system) のクラスです。このパッケージは色や大きさを持ちません。部品ごとの使い方・クラス・状態は [docs/ui.md](docs/ui.md)。

## 使い方

```sh
npm install git+https://github.com/3pino/ui-kit-web.git#v0.3.0
```

配布はソースのまま（`.svelte`・`.svelte.ts`・`.ts`）。取り込む側の Vite（`@sveltejs/vite-plugin-svelte`）が変換します。
開発サーバーの依存の事前バンドルは JS だけを想定しているので、取り込む側の `vite.config.ts` で外してください。

```ts
optimizeDeps: { exclude: ['@3pino/ui-kit-web'] },
```

peer: `svelte` `@lucide/svelte` `lucide` `@3pino/design-system`（アプリが CSS を読み込む）。

```svelte
<script lang="ts">
  import Button from '@3pino/ui-kit-web/Button.svelte';
  import Upload from '@lucide/svelte/icons/upload';
</script>

<Button variant="primary" icon={Upload} onclick={upload}>配布</Button>
```

Svelte の外へ要素を渡したいとき（`mount` のしかた）:

```ts
import { mount, unmount } from 'svelte';
import Toggle from '@3pino/ui-kit-web/Toggle.svelte';

const host = document.createElement('div');
const app = mount(Toggle, { target: host, props: { checked: true, label: '有効', onchange: save } });
const el = host.firstElementChild;   // <button class="toggle toggle-on" role="switch">
// 使い終わったら unmount(app)（Icon などが持つ購読を外す）
```

## 確かめる

```sh
npm install
npm run check   # 型
npm test        # 部品・アイコン・並べ替えの試験（components.test.ts など）
```

## 変更するとき

- 部品を変えたら、[docs/ui.md](docs/ui.md) と `components.test.ts` をそろえる
- アプリ・プラグインに結びつくこと（トースト・確認・戻る操作など）は、ここに入れず、差し込み口（`setIconResolver` `setHaptics` など）にする
- 変えたらバージョンを上げて `git tag vX.Y.Z`。各アプリは、タグを指定して取り込む
