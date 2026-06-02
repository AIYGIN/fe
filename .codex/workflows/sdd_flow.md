# SDD開発フロー（Storybook Driven Development）

フロントエンド開発における Storybook Driven Development（SDD）の標準フローを定義する。

- stories は UI仕様書として扱う。
- tests は必要に応じた振る舞い契約として扱う。
- 実装は、stories / tests のレビュー完了後に開始する。
- Storybook は最終的なUI確認およびレビュー環境として扱う。

stories は UI仕様、
tests は振る舞い契約、
実装はそれらを満たすために行う。

---

## 基本原則

### コンポーネントの作成

- コンポーネントは再利用可能なUI単位として設計すること。
- コンポーネントの作成では、まず `.stories.tsx` ファイルを先に作成する。
  - APIを利用している場合は、`.stories.tsx` 内でモック化すること。
- コンポーネントが振る舞いを持つ場合のみ `.test.tsx` ファイルを追加する。
  - `.test.tsx` ファイルを追加した際は、RED（失敗状態）で作成する。
  - APIを利用している場合はモック化すること。
    - `src/lib/msw/handlers` 内にハンドラー用のファイルを作成する。
    - `src/lib/msw/setup/server.ts` でハンドラーファイルの読み込み設定を行う。
- `.stories.tsx` および `.test.tsx` のレビュー完了前に実装を開始してはいけない。
- `.stories.tsx` および `.test.tsx` 作成完了後にレビュー可能状態にすること。
- `.stories.tsx` および `.test.tsx` のレビュー完了後、それらを満たすように実装すること。
  - 実装の際は `.test.tsx` を GREEN にすること。
  - 実装完了後、Storybook で確認可能な状態にすること。
- 実装完了後、Storybook 上で確認およびレビューを行うこと。
- 各レビューで問題があった場合は、修正して再レビューを行うこと。

---

### ページコンポーネントの作成

- 必要な各種コンポーネントの作成完了後、`page.tsx` に配置するページコンポーネントを作成すること。
- ページコンポーネントの作成では、`.stories.tsx` および `.test.tsx` を作成する。
  - APIを利用している場合はモック化すること。
  - `.test.tsx` はインテグレーションテストを含めること。
  - `.test.tsx` は RED（失敗状態）で作成すること。
- `.stories.tsx` および `.test.tsx` のレビュー完了前に実装を開始してはいけない。
- `.stories.tsx` および `.test.tsx` 作成完了後にレビュー可能状態にすること。
- `.stories.tsx` および `.test.tsx` のレビュー完了後、それらを満たすように実装すること。
  - ページコンポーネントは原則としてサーバーコンポーネントで作成すること。
  - クライアント側で状態共有が必要な場合のみクライアントコンポーネント化を許可する。
  - 実装時は `.test.tsx` を GREEN にすること。
  - 実装完了後、Storybook で確認可能な状態にすること。
- 実装完了後、Storybook 上で確認およびレビューを行うこと。
- 各レビューで問題があった場合は、修正して再レビューを行うこと。

---

### ページファイル（page.tsx）の作成

- 必要なページコンポーネントの作成完了後、ページファイル（page.tsx）を作成すること。
- 画面表示時に必要なデータ取得は、原則として page.tsx で行うこと。
- page.tsx で取得したデータはページコンポーネントへ渡すこと。
- page.tsx に複雑なUIロジックや状態管理を書いてはいけない。
- page.tsx の責務は以下に限定すること。
  - routing
  - params handling
  - fetch
  - ページコンポーネント呼び出し
- ページファイル作成完了後、ローカルサーバーを起動して動作確認およびレビューを行うこと。

---

### e2eテストの作成

- 複数ページの作成が完了し、ユーザーのユースケースを満たせる状態になった場合、必要に応じて e2e テストを作成する。
- e2eテストは必須ではない。
- e2eテストは薄く保つこと。
- e2eテストでは実装詳細ではなく、ユーザーユースケースを検証すること。
- e2eテストファイルは `tests/e2e/` 配下に `.spec.ts` として作成すること。

---

## コンポーネントの開発フロー

1. `.stories.tsx` を作成する
  - UI状態を定義する
  - 必要に応じてモックデータを作成する
  - API利用時は Storybook 用にモック化する

2. 振る舞いが必要な場合のみ `.test.tsx` を作成する
  - RED（失敗状態）で作成する
  - interaction / state change / validation を対象とする
  - API利用時は MSW でモック化する

3. `.stories.tsx` と `.test.tsx` をレビューする
  - UI仕様
  - 状態定義
  - interaction
  - accessibility
  - responsive behavior
  - test内容
  を確認する

4. `.stories.tsx` と `.test.tsx` を満たすように実装する
  - 最小実装を優先する
  - stories / tests を書き換えて通してはいけない

5. `.test.tsx` を GREEN にする
  - 全テストを成功させる
  - flaky test を作らない

6. Storybook で確認・レビューする
  - 各状態が正しく表示されること
  - visual consistency
  - accessibility
  - responsive behavior
  を確認する

7. 必要に応じてリファクタリングする
  - stories
  - tests
  を壊さないこと

---

## ページコンポーネントの開発フロー

1. 必要なコンポーネントを組み合わせて設計する

2. `.stories.tsx` を作成する
  - ページ全体のUI状態を定義する
  - Loading / Empty / Error を含める
  - API利用時はモック化する

3. `.test.tsx` を作成する
  - インテグレーションテストを含める
  - RED（失敗状態）で作成する

4. `.stories.tsx` と `.test.tsx` をレビューする
  - ユースケース
  - 状態遷移
  - interaction
  - accessibility
  - responsive behavior
  を確認する

5. `.stories.tsx` と `.test.tsx` を満たすように実装する
  - 原則としてサーバーコンポーネントで作成する
  - 必要な場合のみクライアントコンポーネント化する

6. `.test.tsx` を GREEN にする
  - インテグレーションテストを通す
  - 実装依存テストを避ける

7. Storybook で確認・レビューする
  - ページ全体の表示
  - 各状態
  - responsive behavior
  を確認する

8. 必要に応じてリファクタリングする

---

## ページファイル（page.tsx）の開発フロー

1. 必要なページコンポーネントを完成させる

2. `page.tsx` を作成する
  - routing
  - params handling
  - fetch
  - ページコンポーネント呼び出し
  のみを担当する

3. 画面表示時に必要なデータをフェッチする
  - 原則として page.tsx でフェッチする
  - フェッチしたデータをページコンポーネントへ渡す

4. loading / error handling を実装する

5. ローカルサーバーで確認・レビューする
  - routing
  - navigation
  - fetch
  - rendering
  を確認する

6. 必要に応じてリファクタリングする

---

## e2eテストの開発フロー

1. 対象ユースケースを整理する
  - ユーザー操作
  - 主要画面遷移
  - 主要機能
  を対象とする

2. `tests/e2e/` 配下に `.spec.ts` を作成する

3. ユースケースベースでテストを書く
  - 実装詳細に依存しない
  - UI内部構造に依存しない

4. 必要最小限のテストにする
  - e2eテストは薄く保つ
  - 重複テストを避ける

5. ローカル実行で確認する
  - 画面遷移
  - 入力
  - API連携
  - エラーハンドリング
  を確認する

6. flaky test を作らない
  - wait乱用禁止
  - timeout依存禁止
  - 安定した selector を使用する

---

## 完了条件

### コンポーネント

- `.stories.tsx` 作成済み
- 必要なUI状態が定義済み
- review 完了
- 実装完了
- Storybook で確認済み
- `.test.tsx` がある場合は GREEN

---

### ページコンポーネント

- `.stories.tsx` 作成済み
- Loading / Empty / Error 状態を確認済み
- review 完了
- 実装完了
- integration test がある場合は GREEN
- responsive behavior 確認済み
- Storybook で確認済み

---

### ページファイル（page.tsx）

- App Router に統合済み
- fetch 処理確認済み
- loading / error handling 実装済み
- ローカルサーバーで動作確認済み

---

### e2eテスト

- 必要なユースケースをカバー
- flaky test が存在しない
- ローカル実行で成功