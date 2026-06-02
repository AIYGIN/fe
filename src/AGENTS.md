# フロントエンド開発の全体ルール

Next.js（App Router）におけるフロントエンド開発の全体ルールを定義する。

Codex / AIエージェントを含むすべての実装は、必ずこのルールを前提として動作すること。

## 基本思想

本プロジェクトは以下を前提とする：

- Storybook Driven Development（SDD）
- Test Driven Development（TDD）
- コンポーネント中心設計
- MSWによるAPIモック前提開発
- UIとロジックの責務分離

## 参照ドキュメント

開発時は必ず以下を参照すること：

- UI実装ルール 
  → `docs/rules/ui.md`

- テストルール 
  → `docs/rules/testing.md`

- Next.js実装境界ルール 
  → `docs/rules/frontend.md`

- 実装フロー（SDD） 
  → `.codex/workflows/sdd_flow.md`

## 開発ルールの優先順位

以下の優先順位でルールを適用する：

1. AGENTS.md（本ドキュメント）
2. docs/rules/frontend.md
3. docs/rules/ui.md
4. docs/rules/testing.md
5. .codex/workflows/sdd_flow.md

## 実装フロー

実装手順の詳細は以下を参照すること：

→ `.codex/workflows/sdd_flow.md`

すべての実装は必ずこのフローに従うこと。

## ディレクトリルール

### UI

- `src/components`：UI全般
- `src/components/common`：共通UI

---

### 状態管理

- `src/contexts`：グローバル状態
- `src/hooks`：Reactロジック

---

### 型

- `src/types`：全体型定義

---

### 基盤

- `src/lib`：純粋関数・基盤処理
- `src/lib/api`：API関連
- `src/lib/msw`：モックサーバー

---

## 実装ルール

### UI実装

- 必ず Storybook を先に作成する
- stories はUI仕様書として扱う
- UI状態を省略しない
- MSWでAPIをモック化する

---

### テスト

- 振る舞いがある場合のみ test を作成する
- RED状態から開始する
- MSWを利用する
- 実装依存テストを避ける

---

### page.tsx ルール

- routingのみ担当
- fetchのみ担当
- UIロジックは禁止
- state禁止
- Page Component呼び出しのみ

---

### Server / Client ルール

#### 1. Server Component 優先

- page.tsx
- Page Components
- fetch処理

#### 2. Client Component 条件

以下の場合のみ `"use client"` を許可：

- useState / useEffect
- browser API
- event handler
- client interaction

---

## 禁止事項

以下は禁止：

- storiesなしでの実装開始
- testなしでの振る舞い実装
- APIの直接呼び出し（components内）
- UIとfetchの混在
- page.tsxの肥大化
- 不要な `"use client"`
- URLの直接記述（lib/api/endpoints以外）

## APIルール

### エンドポイント管理

APIのエンドポイントは必ず以下で管理する：

→ `src/lib/api/endpoints.ts`

#### 例

```tsx
export const endpoints = {
  users: "/api/users",
  userDetail: (id: string) => `/api/users/${id}`,
  login: "/api/auth/login",
};
```

---

### APIクライアントルール（重要）

Next.js の標準 `fetch` を優先するため、APIクライアントは必須ではない。

共通処理が必要な場合のみ、`src/lib/api/client.ts` に薄く実装する。

---

#### 役割

- エラーハンドリング統一
- JSON変換補助
- 認証ヘッダー付与
- ログ処理（必要時）

---

#### 原則

- Server Componentでは直接 fetch を使用する
- 無理にラップしない
- Next.js の fetch のキャッシュ機能を損なわない

---

### API呼び出しルール

- UI側から直接fetch禁止
- ドメインごとにAPIファイルを分割する
- endpoint は必ず `src/lib/api/endpoints.ts` を使用する

---

## MSWルール

- `src/lib/msw/handlers` にAPIモックを配置
- `src/lib/msw/setup/server.ts` で統合
- Storybook / test 両方で共有する
- 実API通信は禁止

## 品質保証ルール

コード作成・修正後は必ず以下を実行すること：

```bash
pnpm check
```

### pnpm check の目的

- フォーマット修正
- import整理
- lintチェック（静的コード解析）

## テスト実行ルール（重要）

コード修正・実装完了後は、必ず以下のテストを実行し、
すべてパスしていることを確認すること。

```bash
pnpm test
```

E2Eテストが存在する場合は、必ず以下も実行すること：

```bash
pnpm test:e2e
```

### 必須条件

- pnpm check が通ること
- pnpm test がすべてパスすること
- pnpm test:e2e がある場合はすべてパスすること
- エラー・警告が残っていないこと
- Storybookで表示崩れがないこと

## レビュー観点

AIは以下を常に確認すること：

- UI状態が不足していないか
- storiesが仕様として成立しているか
- testが振る舞いを保証しているか
- 責務分離ができているか
- fetchがUIに侵食していないか
- MSWが適切に使われているか
- page.tsxが薄いか