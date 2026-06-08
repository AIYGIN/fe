# APIディレクトリ

`src/apis` はフロントエンドのAPI関連コードを配置するディレクトリです。

- `generated/`: `http://localhost:3001/docs-json` から生成するOrval生成物。
- `*.ts`: 生成クライアントを画面向けに扱うための薄いラッパー。

`src/apis/generated` 配下のファイルは手動編集しないでください。APIサーバーを `3001` 番ポートで起動してから `pnpm api:generate` を実行し、APIクライアント、schema、mockを更新します。
