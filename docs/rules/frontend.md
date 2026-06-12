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

## ディレクトリ責務

### `src/app`

Next.js App Router 用ディレクトリ。

- routing
- page.tsx
- layout.tsx

---

### `src/components`

コンポーネントを管理する。

- UI Components
- Page Components
- stories
- tests

---

### `src/components/common`

共通利用するコンポーネントパーツを管理する。

- Button
- Input
- Dialog
- Card
- Table
- Form Parts

再利用可能なUIはここに配置すること。

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
- APIクライアント（→ apisへ）

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

API関連処理を管理する。

#### 構成例

- generated/（Orval生成物）
- users.ts（画面向けAPIラッパー）
- auth.ts（画面向けAPIラッパー）
- todos.mock-browser.ts / todos.mock-server.ts（環境別MSW setup）

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
