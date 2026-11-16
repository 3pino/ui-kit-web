# @3pino/ui-kit

3pino のアプリ共通の UI 部品（Svelte 5）。[disnans](https://github.com/3pino/disnans)・[fixplor](https://github.com/3pino/fixplor)・[@3pino/explorer-kit](https://github.com/3pino/explorer-kit) と、disnans のプラグインが使います。

- **Svelte の部品**: `Button` `IconButton` `Icon` `Toggle` `TextInput` `SegmentedButton` `NavBar` `Divider` `SettingRow` `Section` `StatusLine` `Slider` `Menu` `MenuItem` `Modal` `PanelBar` `SuggestList` `SortableList`
- **DOM の部品**（フレームワークに依らない。`@3pino/ui-kit/dom`）: `icon` `button` `toggle` `input` `segmented` `navbar` `divider` `setting`。同じクラスを付けた、**Svelte の部品と同じ DOM** を作る
- **アイコン**: 名前から引く登録簿（既定は Lucide。アプリの独自のアイコン・あとから足すアイコン・引き方の差し替えができる）

見た目は [@3pino/design-system](https://github.com/3pino/design-system) のクラスです。このパッケージは色や大きさを持ちません。部品ごとの使い方・クラス・状態は [docs/ui.md](docs/ui.md)。

## 使い方

```sh
npm install git+https://github.com/3pino/ui-kit.git#v0.1.0
```

配布はソースのまま（`.svelte`・`.svelte.ts`・`.ts`）。取り込む側の Vite（`@sveltejs/vite-plugin-svelte`）が変換します。
開発サーバーの依存の事前バンドルは JS だけを想定しているので、取り込む側の `vite.config.ts` で外してください。

```ts
optimizeDeps: { exclude: ['@3pino/ui-kit'] },
```

peer: `svelte` `@lucide/svelte` `lucide` `@3pino/design-system`（アプリが CSS を読み込む）。

```svelte
<script lang="ts">
  import Button from '@3pino/ui-kit/Button.svelte';
  import Upload from '@lucide/svelte/icons/upload';
</script>

<Button variant="primary" icon={Upload} onclick={upload}>配布</Button>
```

```ts
import * as dom from '@3pino/ui-kit/dom';

parent.append(dom.button({ text: '配布', icon: 'upload', variant: 'primary', onClick: upload }));
```

## 確かめる

```sh
npm install
npm run check   # 型
npm test        # 部品・アイコン・並べ替えの試験と、Svelte と DOM が同じ DOM になることの試験（parity.test.ts）
```

## 変更するとき

- Svelte の部品か DOM の部品を変えたら、もう一方と [docs/ui.md](docs/ui.md) をそろえる（`parity.test.ts` が、違いを見つける）
- アプリ・プラグインに結びつくこと（トースト・確認・戻る操作など）は、ここに入れず、差し込み口（`setIconResolver` `setHaptics` など）にする
- 変えたらバージョンを上げて `git tag vX.Y.Z`。各アプリは、タグを指定して取り込む
