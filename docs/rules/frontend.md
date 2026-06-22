# フロントエンド開発の実装ルール（Next.js / App Router）

Next.js の App Router を利用したフロントエンド開発の実装ルールを定義する。

各ディレクトリの責務を明確に分離し、UI・状態・データ取得・ルーティングの境界を整理することを目的とする。

---

## 基本原則

- App Router を利用する
- page.tsx は薄く保つ
- UI責務とデータ責務を分離する
- 再利用可能なUIは `src/components` に配置する
- API通信は直接 component に埋め込まない
- Server Component を優先する
- 必要な場合のみ Client Component を利用する
- Storybook でレビュー可能な構成にする
- 新規UIを作る前に既存コンポーネントを確認し、再利用できる場合は既存利用を優先する

## ディレクトリ責務

### `src/app`

Next.js App Router 用ディレクトリ。

- routing
- page.tsx
- layout.tsx

#### URLパラメータ検証

- `page.tsx` で受け取る `params` / `searchParams` は zod schema で検証する
- routeごとの検証ロジックは `src/lib/pages/<route>/index.ts` に配置する
- `page.tsx` は検証関数を呼び出し、検証・正規化済みの値だけを template に渡す
- 外部URL、想定外形式、配列値などの境界値は schema 側で許可・破棄を明示する
- URLパラメータ検証を template / module / hook に重複実装しない

---

### `src/components`

コンポーネントを管理する。

- `templates/<TemplateName>/index.tsx`：page単位の画面構成
- `modules/<ModuleName>/index.tsx`：template内で組み合わせるUI単位
- `common/<ComponentName>/index.tsx`：複数画面で再利用するUI
- module内の子コンポーネント：`<ComponentName>/index.tsx`
- stories / tests

#### 依存方向

```txt
app/page.tsx -> templates -> modules -> hooks -> stores -> apis
```

- `page.tsx` はtemplateの公開entrypointのみをimportする
- templateはmoduleを組み合わせ、Provider等のfeature境界を配置する
- moduleはstoreやAPIを直接参照せず、hook / adapterを介して状態とactionを利用する
- component間の逆向き依存、moduleからtemplateへのimportを禁止する
- test / storyを除き、componentsから`src/stores`と`src/apis`への直接importを禁止する
- 各template / moduleの外部公開は`index.tsx`へ限定し、内部実装のdeep importを避ける
- コンポーネントごとにディレクトリを作り、実装は必ず`<ComponentName>/index.tsx`へ配置する
- CSS、型、定数などコンポーネントではない共有資産は所属するtemplate / module直下へ配置してよい
- 新規コンポーネントを追加する前に `src/components/common`、feature共通領域、対象feature配下の既存コンポーネントを確認する
- 既存コンポーネントを使える場合は props / composition で再利用し、見た目差分だけを理由に重複実装しない
- Issue、実装計画、コンポーネント設計には「新規作成するコンポーネント」と「既存利用するコンポーネント」を分けて明記する
- Storybook も既存利用するコンポーネントの props / 状態を確認できる粒度で作成し、ページやmodule内で同等UIを再定義しない

---

### `src/components/common/<ComponentName>/index.tsx`

共通利用するコンポーネントパーツを管理する。

- Button
- Input
- Dialog
- Card
- Table
- Form Parts

再利用可能なUIはここに配置すること。

機能固有に見えるUIでも複数画面で使う可能性がある場合は、先に既存の共通コンポーネントで表現できるかを確認する。新規追加する場合は、Propsで表示差分を吸収できる範囲を明示し、後続Issueではそのコンポーネントを既存利用対象として扱うこと。

---

### `src/contexts`

アプリ全体で共有する状態を管理する。

#### 役割

- グローバル状態管理
- アプリ横断の状態共有

#### 例

- Auth
- Theme
- Locale
- UI設定

#### 禁止事項

- フォーム状態の管理
- 一時的UI状態の管理
- コンポーネント内部状態の代替

---

### `src/hooks`

Reactロジックの再利用を管理する。

#### 役割

- UIロジックの再利用
- interactionロジックの共通化

#### 例

- useModal
- useDebounce
- useMediaQuery
- usePagination

#### 禁止事項

- UIコンポーネントの定義
- pure function（→ libへ）
- APIクライアント（→ `apis/generated` を直接利用）

---

### `src/types`

アプリ全体の型定義を管理する。

#### 役割

- APIレスポンス型
- ドメイン型
- 共通UI型
- フォーム型

---

### `src/lib`

アプリに依存しない純粋な基盤コードを管理する。

#### 役割

- utils
- constants
- validators

---

### `src/apis`

Orval生成物、共通mutator、mock / test用のAPI構成を管理する。

#### 構成例

- generated/（Orval生成物）
- request.ts（Orval共通mutator）
- todos.mock-handlers.ts（Storybook / test共通handler）
- todos.mock-browser.ts / todos.mock-server.ts（環境別MSW setup）

#### 本番コードの利用ルール

- store / Server Componentは `src/apis/generated` のAPIクライアントと型を直接利用する
- `src/apis` 直下に本番用のドメイン別APIラッパーを作成しない
- HTTP statusの判定、状態遷移、ユーザー向けエラー処理は状態の所有側で行う
- 表示用変換はselector / render時に行い、再利用する純粋変換はfeature配下または `src/lib` に置く
- `request.ts` はcredentials、timeout、host解決など全API共通の通信設定だけを扱う

#### 禁止事項

- `src/apis/<domain>.ts` への本番ロジック追加
- APIレスポンスの画面向け正規化や状態遷移を `src/apis` に置くこと
- `request.ts` へのドメイン固有分岐、画面固有エラー文言、状態管理の追加

---

### `src/apis/generated`

OpenAPI定義からOrvalで生成されたAPIクライアント、型、mockを管理する。

#### 目的

- OpenAPI定義との同期
- API型の手書き削減
- Storybook / test 用 mock の生成

#### 生成元

```txt
http://localhost:3001/docs-json
```

#### 生成コマンド

```bash
pnpm api:generate
```

#### 禁止事項

- コンポーネント内でURLを直接記述すること
- feature/component側でのエンドポイント定義
- 生成物を手動編集すること

---

### MSW mock

- Orval生成mockは `src/apis/generated` 配下の生成物を利用し、手動編集しない
- 追加handlerは `src/apis/generated` の Orval 生成mock handler を直接利用する
- `src/apis` 直下のドメイン別ファイルはmock handler / fixture / setupに限定する
- browser / test用setupは `src/apis/*.mock-browser.ts` / `src/apis/*.mock-server.ts` に配置する

---

## App Router ルール

### page.tsx の責務

- routing
- params handling
- fetch
- Page Component 呼び出し

---

## page.tsx の禁止事項

- UIロジックの実装
- 大量の JSX
- state管理
- business logic

---

## Server Component ルール

優先して利用する。

- page.tsx
- Page Components
- fetch専用コンポーネント

---

## Client Component ルール

以下が必要な場合のみ `"use client"` を使用する。

- browser API
- event handler
- useState / useEffect
- client interaction

---

## useEffect ルール（重要）

useEffectは「副作用専用の最終手段」として扱う。

### 基本原則

- UI状態の同期目的では使用しない
- props → state のコピーに使用しない
- 可能な限り Server Component または render計算で代替する
- Reactのレンダリング結果で表現できるものには使わない

---

### 使用してよいケース

- ブラウザAPI操作（window / document）
- event listener の登録・解除
- 外部サービス購読（WebSocketなど）
- DOM依存処理
- クライアント限定の副作用

---

### 使用禁止・非推奨ケース

- propsからstateを生成する処理
- 表示状態の同期（derived state）
- 初期化ロジックの代替
- fetch目的での乱用（Server Component優先）

---

### fetchとの関係

- データ取得は原則 Server Component で行う
- useEffectでのfetchは例外的ケースのみ
- useEffect fetchはUI依存・遅延処理のみ許可

---

### 依存配列ルール

- 使用している値は必ず依存配列に含める
- eslint警告を無視しない
- stale closureを許容しない設計にする

---

### StrictMode考慮

- useEffectは開発時に2回実行される可能性がある
- 副作用は冪等性を持たせること
- 二重実行で破綻する処理は禁止

---

### クリーンアップ必須ケース

- event listener
- interval / timeout
- subscription

必ず cleanup を実装すること

---

## 状態管理ルール

状態はスコープを最小にする。

優先順位：

1. local state
2. component state
3. page state
4. contexts（必要時のみ）

---

## fetch ルール

原則として page.tsx で fetch を行う。

---

## 禁止事項

- page.tsx の肥大化
- 不要な `"use client"`
- component 内での直接API実通信
- UIとfetch責務の混在
- 巨大component
- useEffectによる過剰な状態管理

---

## レビュー観点

- 責務分離できているか
- page.tsx が薄いか
- Server/Client境界が適切か
- Storybookでレビュー可能か
- test可能な構造か
- 再利用可能か
- useEffectが適切な用途か
