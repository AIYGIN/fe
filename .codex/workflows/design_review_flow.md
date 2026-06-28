# Design Review Flow

参照画像、Figma、ワイヤーフレーム、詳細なUI要件があるIssueで使う任意ワークフロー。
既存の `sdd_flow.md` とTDDの順序は変更しない。Design Review は、TDDに入る前または実装後に差し込むデザイン専用ゲートとして扱う。

## 目的

- Issue要件通りのコンポーネント設計になっているか確認する
- 参照画像や指定デザインに忠実か確認する
- Story / test で検証すべき視覚状態を tester に渡す
- 実装後に、デザイン差分だけを implementer / reviewer に返す

## 対象外

Design Review はデザインのみを扱う。次の領域はレビューしない。

- Store設計
- API設計
- Orval / MSW
- テスト設計そのもの
- ビジネスロジック
- 型設計
- パフォーマンス
- 一般的なコード品質

## 使用エージェント

- Design Review: `.codex/agents/design_reviewer.toml`
- Tester: `.codex/agents/tester.toml`
- Implementer: `.codex/agents/implementer.toml`
- Final Review: `.codex/agents/reviewer.toml`

既存の `.codex/agents/design_planner.toml` は、実装前のコンポーネント設計Issue化に使う。
このワークフローの Design Review は、Issue要件・参照画像・実装画面の照合に特化する。

## 基本ルート

1. Design Reviewer が Issue要件、参照画像、コンポーネント設計を確認する。
2. Tester が Design Reviewer の観点を参考にしつつ、通常通り RED の test / Story を作成する。
3. Implementer が test / Story を GREEN にする。
4. 必要に応じて Design Reviewer が実装後の見た目だけを再確認する。
5. Reviewer が通常の最終レビューを行う。

## Design Reviewer の確認観点

- Visual fidelity: 参照画像、ワイヤーフレーム、Issue要件との見た目の一致
- Component design fidelity: template / modules / parts / common の責務分離と既存コンポーネント再利用
- Layout states: loading / empty / error / retry / disabled / selected / hover / focus の見え方
- Responsive fidelity: mobile / tablet / desktop の破綻、重なり、情報欠落
- Design consistency: 既存UI、Panda CSS、コンポーネント設計規約との整合
- Accessibility: ラベル、コントラスト、フォーカス、キーボード操作などUI上の観点

## 参照画像比較ルール

参照画像、Figma、ワイヤーフレームがある場合、Design Review は「主要構成が同じ」だけでは pass にしない。
必ず実装画面の screenshot を取得し、参照画像と横並びで比較する。

最低限比較する項目:

- viewport / canvas size: 参照画像と同等の表示幅で確認しているか。
- global layout: 外側余白、ヘッダー位置、上段 / 下段 / 右カラムの比率、下部注記の位置が近いか。
- panel shape: 枠線、角丸、背景色、影、カード内余白が近いか。
- table density: 行高、列幅、セル padding、罫線、選択行ハイライト、数値の揃えが近いか。
- typography: 見出し、本文、数値、バッジのサイズ / weight / line-height が近いか。
- color / status: safe / warning / danger / neutral の色、バー、バッジ、注記色が近いか。
- visual assets: ロゴ、アイコン、チャート、ミニグラフが参照画像の役割と視認性に近いか。
- state fidelity: selected / loading / empty / error / retry / AI summary null などの表示が要件と矛盾しないか。
- responsive: mobile / tablet / desktop で重なり、はみ出し、操作不能がないか。

pass できない例:

- 参照画像と同じ情報が表示されているだけで、余白・密度・比率が明確に違う。
- AI summary TODO など未提供状態なのに、分析済みの要約に見える文言を出している。
- table をカード一覧や簡略レイアウトに置き換えている。
- 実装 screenshot を確認せず、コード上の推測だけで pass している。

レビュー結果には、実際に比較した参照画像と実装 screenshot のパスを `context_used` に必ず含める。

## Handoff

Design Reviewer は、次のいずれかで引き継ぐ。

- `pass`: tester または reviewer に進める
- `fail`: implementer にデザイン差分として返す
- `blocked`: 参照画像、Issueコメント、Storybook、スクリーンショットなど不足している一次情報を補う

指摘は、期待デザイン、実際の差分、根拠、推奨修正を短く具体化する。
Store/API/test 方針など、対象外領域の指摘は書かない。

## ui-ux-pro-max

必要に応じて `ui-ux-pro-max` を使い、画面種別、業界、デザインシステム、レスポンシブ、アクセシビリティの観点を補強する。
ただし、Issue要件と参照画像を最優先し、一般論で仕様を上書きしない。
