# APIディレクトリ

`src/apis` はOrval生成物、共通mutator、Storybook / test用のmock構成を配置するディレクトリです。

- `generated/`: `http://localhost:3001/docs-json` から生成するOrval生成物。
- `request.ts`: credentials、timeout、API host解決など、Orvalが利用する全API共通mutator。
- `*.mock-handlers.ts`: Orval生成mockから構成する共通handlerとfixture。
- `*.mock-browser.ts` / `*.mock-server.ts`: Storybook / test用のMSW setup。
- `*.test.ts`: 共通mutator、生成契約、mock setupのテスト。

本番機能コードは `src/apis/generated` のAPIクライアントと型を直接importします。
`src/apis/<domain>.ts` のような本番用APIラッパーは作成しません。
HTTP statusの判定、状態遷移、ユーザー向けエラー処理はstore / Server Componentで扱い、表示用変換はselectorまたはrender時に行います。

`request.ts` へドメイン固有の分岐、画面固有のエラー文言、状態管理を追加してはいけません。

`src/apis/generated` 配下のファイルは手動編集しないでください。APIサーバーを `3001` 番ポートで起動してから `pnpm api:generate` を実行し、APIクライアント、schema、mockを更新します。
