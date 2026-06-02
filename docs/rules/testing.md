# テスト実装ルール

フロントエンド開発におけるテスト実装ルールを定義する。

- tests は振る舞い契約として扱う
- 実装詳細ではなく、ユーザーから見た振る舞いを保証することを目的とする

---

## 基本原則

- 必要な場合のみ tests を作成する
- tests は RED（失敗状態）から開始する
- tests を満たすように実装する
- 実装詳細ではなく振る舞いをテストする
- flaky test を作らない
- mock を利用して安定したテストを作る

---

## test が必要な条件

以下を含む場合は `.test.tsx` を作成すること：

- ユーザー操作
- state変更
- form validation
- conditional rendering
- async処理
- accessibility interaction
- integration behavior

---

## test が不要なケース

以下のみの場合は test を省略可能：

- 単純な Presentational Component
- Typography wrapper
- Layout wrapper
- 静的表示のみ

---

## Unit Test ルール

Unit Test では以下を確認すること：

- interaction
- state change
- rendering
- callback
- validation

---

## Integration Test ルール

Integration Test では以下を確認すること：

- Component連携
- 状態遷移
- API integration
- form flow
- user flow

---

## E2E Test ルール

E2E Test は以下を目的とする：

- 主要ユースケース確認
- 回帰防止
- 画面統合確認

E2E Test は薄く保つこと

---

## selector ルール

selector の優先順位は以下とする：

1. role
2. label
3. text
4. placeholder
5. data-testid

可能な限り `data-testid` を避けること

---

## Mocking ルール

API利用時は MSW を利用すること。

- mock を再利用可能にする
- Storybook と test で共有可能にする
- Success / Error / Loading を切り替え可能にする

---

## MSW 利用ルール

- handler は `src/lib/msw/handlers` に配置する
- `src/lib/msw/setup/server.ts` に登録する
- 実API通信を行ってはいけない

---

## useEffect テスト上のルール（重要）

テストにおいて useEffect を含むコンポーネントは「副作用の発火タイミング」に依存しない設計にすること。

---

### 基本原則

- useEffectの実行タイミングをテストで制御しようとしない
- useEffectの内部状態を直接検証しない
- 副作用の結果のみを検証する
- render後の不安定な状態変化を前提にしない

---

### テストしてよい対象

- 副作用の「結果」（UI変化・DOM変化）
- event handler による状態変化
- ユーザー操作後の挙動

---

### テストしてはいけない対象

- useEffect の実行回数
- useEffect 内部のローカル変数
- useEffect のタイミング依存ロジック
- 非同期タイマーの内部状態

---

### 非同期 useEffect の扱い

- waitFor は最小限にする
- 安定したUI結果を待つ
- setTimeout 依存のテストは禁止
- fetch結果は MSW で制御する

---

## 非同期テストルール

- async/await を利用する
- waitFor を最小限にする
- 安定した完了条件を待つ
- timing依存を避ける

---

## accessibility テストルール

必要に応じて以下を確認すること：

- keyboard navigation
- focus movement
- aria attributes
- accessible name

---

## flaky test 防止ルール

- ランダム値に依存しない
- 時刻依存を避ける
- timeout依存を避ける
- 実ネットワーク通信を行わない
- test 間で状態共有しない
- useEffectの非同期タイミングに依存しない

---

## RED / GREEN ルール

### RED

- 失敗する test を先に作成する
- 未実装状態であることを確認する

### GREEN

- 最小実装で test を通す
- test を書き換えて通してはいけない

---

## 禁止事項

- className selector
- implementation detail のテスト
- state 内部値の直接確認
- private function のテスト
- snapshot test の乱用
- waitFor の乱用
- timeout 依存
- sleep/wait の固定時間依存
- useEffectの内部実行制御を前提にしたテスト

---

## レビュー観点

レビュー時は以下を確認すること：

- 振る舞いを保証できているか
- implementation detail に依存していないか
- flaky test の可能性がないか
- accessibility を考慮しているか
- 過剰テストになっていないか
- useEffect依存のテスト設計になっていないか