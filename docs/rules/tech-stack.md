# 技術スタック固定ルール

このプロジェクトのフロントエンド実装では、採用済み技術を実装者判断で置き換えない。

## 採用技術

- アプリケーション: Next.js App Router
- UI: React
- スタイリング: PandaCSS / `styled-system`
- 状態管理: Zustand store + Provider + hooks
- 入力・スキーマ検証: Zod
- API クライアント: Orval 生成物（`src/apis/generated`）
- API mock: Orval 生成 MSW handler + MSW
- テスト: Vitest + Testing Library
- Storybook: Storybook

## 実装時の必須判断

- API状態、画面横断状態、リトライ可能な非同期状態、ページ遷移後も扱う状態は `src/stores/<domain>` に Zustand store として実装する。
- `src/hooks/<domain>` は Store と API / UI の境界に置く。状態管理を hook の local state だけに閉じる判断をしない。
- フォーム入力、URL params、APIに渡す入力、外部入力、仕様上の制約値は Zod schema で検証する。
- UIスタイルは PandaCSS / `styled-system` を使う。テンプレートや module に大きな inline style object を置かない。
- API通信は Orval 生成物を直接使う。feature / component 側で endpoint URL や fetch wrapper を独自定義しない。
- mock は Orval 生成 MSW handler を基本にし、追加 handler が必要な場合も `src/apis` 配下の mock 用ファイルに閉じる。

## 禁止事項

- 「小さい画面だから」「v1だから」という理由で Store を省略し、local state だけで API状態を管理すること。
- Zod が依存にあるのに、文字列処理や手書き if だけで入力・params・制約値を検証すること。
- PandaCSS / `styled-system` を使わず、テンプレート内 inline style や独自CSSだけで画面を作ること。
- Orval 生成物を迂回して、コンポーネントや hook から API URL を直接組み立てること。
- 既存 Store / hooks / components がある領域で、調査せずに新規実装すること。

## 例外条件

例外は実装者が独自判断で決めない。以下のいずれかが明記されている場合だけ許可する。

- Issue の受け入れ条件に例外理由と代替方式が書かれている。
- 設計レビューで例外が承認され、PR本文に理由が残っている。
- 既存技術では実装不能であることを検証し、Reviewer が承認している。

例外を使う場合も、PR本文に「どの技術を使わなかったか」「なぜ使わなかったか」「代替実装の責務範囲」を必ず記載する。

## Issue / PR レビュー観点

- Issue に Store設計がある場合、受け入れ条件にも Store名・配置パス・state・actions が明記されていること。
- Issue にコンポーネント設計がある場合、受け入れ条件にもコンポーネント名・配置パス・Props・利用する既存部品が明記されていること。
- PR レビューでは、実装がこの技術スタックに沿っているかを完了条件として確認する。
