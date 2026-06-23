# SDD開発フロー（Storybook Driven Development）

フロントエンド開発における Storybook Driven Development（SDD）の標準フローを定義する。

- stories は UI仕様書として扱う。
- tests は必要に応じた振る舞い契約として扱う。
- 実装は、stories / tests のレビュー完了後に開始する。
- Storybook は最終的なUI確認およびレビュー環境として扱う。
- APIを利用する機能では `docs/rules/state-management.md` を必ず参照し、Story、test、実装、レビューの各工程で状態分類と管理スコープを確認する。

stories は UI仕様、
tests は振る舞い契約、
実装はそれらを満たすために行う。

---

## 基本原則

### API利用時の状態管理

- APIを利用する機能は、着手時に状態を Server/API、共有client、Page/local UI、URL、DOM refへ分類する。
- APIクライアント、型、mockは Orval 生成物を利用し、`src/apis/generated` 配下を手動編集しない。
- 本番機能コードは `src/apis/generated` を直接利用し、`src/apis` 直下に本番用APIラッパーや業務ロジックを追加しない。
- `src/apis` 直下はOrval共通mutatorとmock / test用handler・setupに限定する。
- API状態とUI状態を分離し、必要な最小スコープへ配置する。
- Zustand等のstoreを利用する場合は、feature / page専用の独立store instanceとし、SSR request、Story、test間で共有しない。
- feature / page専用storeを作成する場合は `src/stores/<feature>` に配置し、UI component配下へAPI storeを置かない。
- loading / error / mutation pending / 重複防止をStoryとtestで定義する。
- 状態管理・データ取得技術は無条件に禁止・追加せず、現行採用技術とIssue要件に従う。

### コンポーネントの作成

- コンポーネントは再利用可能なUI単位として設計すること。
- 新規作成前に既存コンポーネントを確認し、再利用できるものは既存利用として設計に明記すること。
- コンポーネント設計では「新規作成」と「既存利用」を分け、既存利用の場合はコンポーネント名・パス・利用propsを明記すること。
- コンポーネントの作成では、まず `.stories.tsx` ファイルを先に作成する。
  - APIを利用している場合は、`.stories.tsx` 内でモック化すること。
  - APIを利用している場合は、`docs/rules/state-management.md` に従って状態を分類し、API状態とUI状態を分けて各storyを定義すること。
- コンポーネントが振る舞いを持つ場合のみ `.test.tsx` ファイルを追加する。
  - `.test.tsx` ファイルを追加した際は、RED（失敗状態）で作成する。
  - APIを利用している場合はモック化すること。
    - `docs/rules/state-management.md` に従い、loading / error / pending / 重複防止を要件に応じて検証すること。
    - `src/apis/generated` 配下のOrval生成mockを優先し、生成物は手動編集しない。
    - 追加handlerは `src/apis/generated` の Orval 生成mock handler を直接利用する。
    - test用server setupは `src/apis/*.mock-server.ts` に配置する。
- `.stories.tsx` および `.test.tsx` のレビュー完了前に実装を開始してはいけない。
- `.stories.tsx` および `.test.tsx` 作成完了後にレビュー可能状態にすること。
- `.stories.tsx` および `.test.tsx` のレビュー完了後、それらを満たすように実装すること。
  - 実装の際は `.test.tsx` を GREEN にすること。
  - API利用時は、状態が必要な最小スコープにあり、store instanceが利用境界ごとに独立していること。
  - feature / page専用storeを作成する場合は `src/stores/<feature>` に配置し、UI component配下へAPI storeを置かない。
  - 実装完了後、Storybook で確認可能な状態にすること。
- 実装完了後、Storybook 上で確認およびレビューを行うこと。
- API利用時のレビューでは、状態分類、Orval生成物の直接利用、`src/apis` 直下への本番ロジック混入がないこと、API/UI状態の分離、非同期競合防止を確認すること。
- 各レビューで問題があった場合は、修正して再レビューを行うこと。

---

### ページコンポーネントの作成

- 必要な各種コンポーネントの作成完了後、`page.tsx` に配置するページコンポーネントを作成すること。
- ページコンポーネントの作成では、`.stories.tsx` および `.test.tsx` を作成する。
  - APIを利用している場合はモック化すること。
  - APIを利用している場合は、`docs/rules/state-management.md` に従って状態分類、初期値、Loading / Empty / Error / Pendingを定義すること。
  - `.test.tsx` はインテグレーションテストを含めること。
  - `.test.tsx` は RED（失敗状態）で作成すること。
- `.stories.tsx` および `.test.tsx` のレビュー完了前に実装を開始してはいけない。
- `.stories.tsx` および `.test.tsx` 作成完了後にレビュー可能状態にすること。
- `.stories.tsx` および `.test.tsx` のレビュー完了後、それらを満たすように実装すること。
  - ページコンポーネントは原則としてサーバーコンポーネントで作成すること。
  - クライアント側で状態共有が必要な場合のみクライアントコンポーネント化を許可する。
  - client storeが必要な場合はfeature / page専用とし、Story、test、SSR requestごとに独立したinstanceを生成すること。
  - feature / page専用storeを作成する場合は `src/stores/<feature>` に配置すること。
  - 実装時は `.test.tsx` を GREEN にすること。
  - 実装完了後、Storybook で確認可能な状態にすること。
- 実装完了後、Storybook 上で確認およびレビューを行うこと。
- API利用時のレビューでは、状態分類、最小スコープ、API/UI状態の分離、loading / error / pending / 重複防止を確認すること。
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
  - API利用時は状態分類を行い、API状態とUI状態を別のstory条件として定義する

2. 振る舞いが必要な場合のみ `.test.tsx` を作成する
  - RED（失敗状態）で作成する
  - interaction / state change / validation を対象とする
  - API利用時は MSW でモック化する
  - API利用時は成功、失敗、loading、pending、重複操作防止を要件に応じてテストする

3. `.stories.tsx` と `.test.tsx` をレビューする
  - UI仕様
  - 状態定義
  - interaction
  - accessibility
  - responsive behavior
  - test内容
  - `docs/rules/state-management.md` に沿った状態分類と管理スコープ
  を確認する

4. `.stories.tsx` と `.test.tsx` を満たすように実装する
  - 最小実装を優先する
  - stories / tests を書き換えて通してはいけない
  - API利用時はOrval生成型/API/mockを利用し、API状態とUI状態を分離する

5. `.test.tsx` を GREEN にする
  - 全テストを成功させる
  - flaky test を作らない

6. Storybook で確認・レビューする
  - 各状態が正しく表示されること
  - visual consistency
  - accessibility
  - responsive behavior
  - API状態、UI状態、非同期競合防止
  を確認する

7. 必要に応じてリファクタリングする
  - stories
  - tests
  を壊さないこと

---

## ページコンポーネントの開発フロー

1. 必要なコンポーネントを組み合わせて設計する
  - 既存コンポーネントの再利用可否を確認する
  - 既存利用するコンポーネント名・パス・利用propsを明記する
  - 新規作成するコンポーネントは、既存で代替できない理由を明記する

2. `.stories.tsx` を作成する
  - ページ全体のUI状態を定義する
  - Loading / Empty / Error を含める
  - API利用時はモック化する
  - API利用時は状態分類、初期値、Pending、重複操作防止を定義する

3. `.test.tsx` を作成する
  - インテグレーションテストを含める
  - RED（失敗状態）で作成する
  - API利用時はOrval生成mockを利用し、非同期状態遷移を検証する

4. `.stories.tsx` と `.test.tsx` をレビューする
  - ユースケース
  - 状態遷移
  - interaction
  - accessibility
  - responsive behavior
  - `docs/rules/state-management.md` に沿った状態分類と管理スコープ
  を確認する

5. `.stories.tsx` と `.test.tsx` を満たすように実装する
  - 原則としてサーバーコンポーネントで作成する
  - 必要な場合のみクライアントコンポーネント化する
  - client storeはfeature / page専用の独立instanceとして実装する

6. `.test.tsx` を GREEN にする
  - インテグレーションテストを通す
  - 実装依存テストを避ける

7. Storybook で確認・レビューする
  - ページ全体の表示
  - 各状態
  - responsive behavior
  - API状態とUI状態の分離、loading / error / pending / 重複防止
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
  - API利用時は `docs/rules/state-management.md` に従いServer/API stateとclient stateの境界を確認する

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
- API利用時は状態分類と管理スコープを確認済み
- API利用時はOrval生成型/API/mockを利用済み
- API利用時は本番コードから生成APIを直接利用し、`src/apis` 直下に本番用ラッパーを追加していない
- review 完了
- 実装完了
- Storybook で確認済み
- `.test.tsx` がある場合は GREEN

---

### ページコンポーネント

- `.stories.tsx` 作成済み
- Loading / Empty / Error 状態を確認済み
- API利用時はAPI状態とUI状態の分離、Pending、重複防止を確認済み
- store利用時はSSR request、Story、testごとに独立したinstanceを確認済み
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
