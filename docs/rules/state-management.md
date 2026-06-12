# 状態管理ルール

フロントエンドにおける状態の分類、配置、ライフサイクル、API連携時の責務境界を定義する。

Codex / AIエージェントを含むすべての実装者は、APIを利用する機能の Story、test、実装、レビューで本ドキュメントを必ず参照すること。

---

## 基本原則

- 状態を実装する前に、誰が所有し、どの範囲で共有し、いつ破棄するかを決める
- 状態は必要な最小スコープに置く
- Server Component と URL で表現できる状態を優先し、Client Component の状態を増やさない
- API由来の状態と、表示・操作のためのUI状態を分離する
- props や既存状態から計算できる値を重複して保持しない
- 状態管理ライブラリの導入自体を目的にしない
- 現行採用技術、Issueの要件、既存実装との整合性を優先する

## 状態の分類

実装前に、各状態を以下のいずれかに分類すること。複数の分類を1つのstoreへ無条件にまとめてはいけない。

### 1. Server / API state

サーバーを正とし、取得・更新・再取得・失敗・鮮度管理を伴う状態。

例：

- Todo一覧、ユーザー情報、検索結果
- APIリクエストの loading / error / pending
- mutation後のレスポンス、キャッシュ、再検証対象

原則：

- Server Component で取得できる初期データはサーバーで取得する
- APIクライアント、型、mockは Orval 生成物を使用する
- client側で保持する場合も、APIデータと一時的なUI状態を同じフィールドへ混在させない
- キャッシュ、再取得、楽観更新などが必要な場合は、Issue要件と現行採用技術を確認して方式を選ぶ

### 2. 共有 client state

複数の離れたClient Componentが、同じライフサイクルで読み書きするブラウザ上の状態。

例：

- feature内の複数コンポーネントで共有する選択状態
- 複数操作から更新されるクライアント側の編集セッション
- API操作を協調させるfeature単位の状態

原則：

- props、composition、URL state、Server Componentで解決できない場合に限る
- アプリ全体ではなく、featureまたはpageの境界へ閉じる
- Zustand等のstore採用条件を満たすか確認する

### 3. Page / local UI state

単一ページ、単一コンポーネント、または近接する小さな部分木だけで必要な表示・操作状態。

例：

- dialogの開閉
- inputの一時値
- tab、accordion、hover、focus、選択中の行
- 送信前のフォーム状態

原則：

- `useState`、`useReducer`、フォームライブラリ、propsを優先する
- 近接する子で共有する場合は、必要な最小の共通親までliftする
- APIレスポンスのコピーをlocal stateとして保持しない

### 4. URL state

URLで共有、復元、履歴移動、deep linkが必要な状態。

例：

- 検索条件、filter、sort、pagination
- 選択中のtabや表示モード
- route params、search params

原則：

- URLが正となる値を別のstoreへ二重保持しない
- App Routerのparams / search paramsを利用する
- navigation後やreload後にも保持すべきかをStoryとtestで確認する

### 5. DOM ref

再レンダリングを必要とせず、DOMまたは命令的APIへの参照として保持する値。

例：

- focus対象
- scroll位置の参照
- timer / subscription id
- 外部ライブラリのinstance

原則：

- `useRef` を利用する
- 表示に影響する値をrefだけで管理しない
- listener、timer、subscriptionはcleanupする

## 最小スコープ原則

状態の配置は、以下の順に小さい手段から検討すること。

1. render時の計算、定数、props
2. DOM ref
3. component local state
4. 近接する共通親でのstate
5. URL state
6. feature / page専用の共有client store
7. アプリ横断store

アプリ横断storeは、認証や全体設定など、ルートをまたいで同一状態を共有する明確な要件がある場合のみ許可する。

## API利用機能の必須ルール

APIを利用するStory、test、実装、レビューでは、着手前に本規約を参照し、扱う状態を分類すること。

### Orval生成物

- APIクライアント、API型、API mockは Orval 生成物を必ず利用する
- `src/apis/generated` 配下は手動編集しない
- APIレスポンス型を手書きで複製しない
- Storybook / testでは Orval 生成mock handlerを優先する
- 画面向け変換が必要な場合のみ `src/apis/*.ts` に薄いラッパーを置く
- UIやstore内にURL、HTTPメソッド、独自のエンドポイント定義を埋め込まない

### API状態とUI状態の分離

以下を別の責務として設計すること。

- API状態：取得データ、loading、error、mutation pending、再取得、競合制御
- UI状態：dialog、入力途中の値、選択、filter表示、focus、通知表示

APIレスポンスをUI都合で直接破壊せず、表示用のderived valueはselectorまたはrender時に計算する。編集途中のdraftが必要な場合は、APIデータとは別のUI状態として保持し、同期・破棄の条件を明示する。

## Zustand採用条件

Zustandは、Issueまたは設計判断で採用が明示されているか、以下の条件から必要性を説明できる場合に採用する。

- 複数の離れたClient Componentが同じ状態を共有する
- props、composition、local state、URL stateでは複雑さを下げられない
- storeの所有範囲と破棄タイミングがfeatureまたはpage単位で定義できる
- Storybookとtestで独立した初期状態を注入する必要がある
- client側の共有・更新・非同期状態管理をstoreへ分離する明確な要件がある

ZustandはServer / API state専用ライブラリとして無条件に採用しない。TanStack Query等のデータ取得・キャッシュ技術も無条件に禁止しない。キャッシュ、再取得、invalidations、deduplicationなどの要件がある場合は、現行採用技術とIssue要件に沿って選定し、未導入ライブラリを独断で追加しない。

## Storeの配置とインスタンス

- storeはアプリ全体のsingletonを既定にしない
- feature / page専用storeとして、原則 `src/store/<feature>` 配下へ配置する
- UIコンポーネント固有の一時状態ではなく、feature / page内で共有されるAPI状態・共有client stateを対象とする
- component local stateで十分な状態は `src/store` に移さない
- store作成関数を用意し、利用境界ごとに独立したstore instanceを生成する
- 複数コンポーネントへ同じinstanceを配布する場合は、feature / page境界にProviderを用意する
- module import時に生成したsingletonをStorybook / test間で共有しない
- Provider外からの暗黙参照や、別featureのstoreへの直接依存を避ける
- 複数コンポーネントがstoreの一部だけを利用する場合はselectorを利用し、購読範囲を必要なstate / actionへ限定する
- feature adapterがstore全体を単一コンポーネントへ公開する場合は全体購読を許可するが、利用範囲が広がった時点でselectorへ分割する
- action名はUIイベントではなく、状態遷移の意図が分かる名前にする

## 初期値と実行環境

### 初期値

- 初期値はstore作成時に明示的に注入可能にする
- Server Componentで取得した初期データを渡す場合、serializableな値に限定する
- propsからstoreへ初期化した値を `useEffect` で再同期しない
- reset条件と、page遷移時に保持または破棄する条件を定義する

### SSR / Hydration

- server request間でstore instanceを共有しない
- server renderとclient初回renderで同じ初期状態を使う
- browser APIへはclient境界の内側からアクセスする
- module-level singletonによるユーザー間の状態漏洩を禁止する

### Storybook

- storyごとに独立したstore instanceを作成する
- Default / Loading / Empty / Error / Pending等を初期値とMSWで再現する
- story間の状態共有や実行順依存を作らない
- API通信はOrval生成mockとMSWで制御する

### Test

- testごとに独立したstore instanceを作成する
- test間で状態を共有せず、初期値を明示する
- store内部値ではなく、ユーザー操作とUI結果を優先して検証する
- API成功、失敗、loading、mutation pending、再試行、重複操作防止を要件に応じて検証する

## 非同期状態

### Loading / Error / Pending

- 初回取得のloadingと、mutationのpendingを区別する
- errorは握りつぶさず、表示、再試行、復旧方法をStoryとtestで定義する
- pending中に無効化する操作と、継続可能な操作を明示する
- API成功時と失敗時のstate遷移をaction内で一貫させる
- `finally` 相当の処理でpending解除漏れを防ぐ

### 重複・競合防止

- submitやmutationの連打をpending guardまたはUI disabledで防ぐ
- 同一要求の重複実行、古いレスポンスによる上書き、unmount後の更新を考慮する
- 必要に応じてrequest id、AbortController、採用技術のdeduplication機能を利用する
- 最後の要求を採用するのか、先行要求を完了させるのかを仕様として決める
- 楽観更新を行う場合はrollbackと失敗表示を必ず定義する

## 禁止事項

- 状態分類をせずにglobal storeへ追加する
- local stateで十分な値をZustandへ移す
- URLを正とする状態をstoreへ二重保持する
- propsやAPIデータから導出可能な値を別stateとして同期する
- API状態とdialog等のUI状態を理由なく1つの巨大storeへ集約する
- アプリ横断singleton storeをfeature / page状態に利用する
- SSR request間、Story間、test間でstore instanceを共有する
- `useEffect` でpropsやAPIレスポンスをstoreへ常時コピーする
- `src/apis/generated` の型、APIクライアント、mockを手動編集する
- Orval生成型を `any` や手書き型で迂回する
- componentやstoreにAPI URLを直接記述する
- pending guardなしで同一mutationを多重実行できる状態にする
- errorを握りつぶす、またはloading / pendingを解除しない
- Issue要件や現行技術の確認なしに状態管理・データ取得ライブラリを追加する

## レビューchecklist

- [ ] すべての状態が Server/API、共有client、Page/local UI、URL、DOM ref のいずれかに分類されている
- [ ] 状態が必要な最小スコープに置かれている
- [ ] props、derived value、URL、Server Componentで代替できないことを確認した
- [ ] API利用機能で本ドキュメントを参照した
- [ ] Orval生成のAPIクライアント、型、mockを利用し、生成物を編集していない
- [ ] API状態とUI状態の責務が分離されている
- [ ] Zustandの採用理由とstoreのfeature / page境界が説明できる
- [ ] store instanceがSSR request、Story、testごとに独立している
- [ ] 初期値、reset、保持・破棄、hydrationの条件が定義されている
- [ ] Loading / Empty / Error / PendingがStorybookで確認できる
- [ ] 非同期成功・失敗・再試行・重複防止がtestで保証されている
- [ ] 古いレスポンス、二重submit、unmount後更新などの競合を考慮している
- [ ] 現行採用技術とIssue要件に沿い、不要なライブラリを追加していない
