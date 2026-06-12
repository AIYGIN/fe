# UI実装ルール（Storybook）

Storybookを利用したUI実装ルールを定義する。

Storybookは単なる動作確認環境ではなく、UI仕様書およびレビュー環境として扱う。

---

## 基本原則

- stories を先に作成する
- stories はUI仕様書として扱う
- Storybook 単体でレビュー可能な状態にする
- 実装前に stories をレビュー可能状態にする
- stories を満たすように実装する
- UI状態を省略しない
- mock を利用して再現可能な状態を作る
- UI状態は useEffect で作らない

---

## stories の責務

stories は以下を表現すること：

- UI状態
- interaction
- Loading状態
- Empty状態
- Error状態
- Disabled状態
- responsive behavior
- accessibility

---

## stories 作成ルール

### 1 story = 1 state

1つの story では1つの状態のみを表現すること。

悪い例：

```tsx
export const AllStates = () => (
  <>
    <Button />
    <Button disabled />
    <Button loading />
  </>
);
```

良い例：

```tsx
export const Default = {};
export const Loading = {};
export const Error = {};
export const Empty = {};
export const Disabled = {};
```

---

## 必須状態

必要に応じて以下を作成すること：

- Default
- Loading
- Empty
- Error
- Disabled
- Hover
- Active
- Selected
- Mobile
- Tablet
- Desktop
- Dark mode

---

## args を利用する

props 切り替え可能なものは args を利用すること。

固定値を大量に埋め込まないこと。

---

## controls を利用する

レビュー時に変更可能な props は controls を利用すること。

---

## mock データルール

- Storybook 上で完結するモックを作成する
- API通信を実際に行ってはいけない
- API利用時は MSW を利用する
- mock は再利用可能にする

---

## MSW 利用ルール

API利用時は MSW を利用すること。

- Orval生成handlerは `src/apis/generated` 配下の生成物を利用し、手動編集しない
- 追加handlerは `src/apis/generated` の Orval 生成mock handler を直接利用する
- Storybook用handlerは生成mockから構成する
- Storybook 用 mock と test 用 mock を共有可能にする
- Loading / Error / Success を切り替え可能にする

---

## レイアウトルール

- Storybook 上で崩れないこと
- 極端な margin 調整に依存しないこと
- 固定高さレイアウトを乱用しないこと

---

## responsive ルール

responsive behavior を確認可能にすること。

最低限確認する：

- Mobile
- Desktop

必要に応じて Tablet も確認すること

---

## accessibility ルール

以下を確認すること：

- keyboard interaction
- focus visibility
- aria-label
- semantic HTML
- color contrast

---

## pandacss ルール

- design tokens（色 / spacing / typography / sizes）を `theme` に定義し、直接の数値やカラーを使わない
- `recipe` / `sprinkles` を活用して再利用可能なスタイルパターンを作る
- utility（atomic）スタイルを優先しつつ、複雑なパターンは `recipe` に抽象化する
- `className` の肥大化を避ける（`cx` / `cn` を使って結合を簡潔にする）
- 重複するスタイルはトークンや `recipe` に移行する
- magic number を避け、必ずトークン（spacing, scale, sizes）を利用する
- conditional styles は `recipes` の `variants` またはユーティリティ関数で整理する
- グローバルスタイルは最小限にし、コンポーネント固有のスタイルはローカルで管理する
- theme の拡張やモード切替（ダークモード等）は `theme` 側で実装し、Storybook で切替を確認する
- Storybook では pandacss のセットアップを再現し、実際のクラス／recipes で見た目を検証する
- 既存の Tailwind を移行する際は、優先度を付けて段階的にトークンと `recipe` に置き換える

---

## useEffect ルール（重要）

Storybook内のUIコンポーネントにおいて useEffect は「副作用専用」として扱う。

---

### 基本原則

- UI状態の生成に useEffect を使わない
- props → state の同期に使わない
- Storybookの状態は stories / args で表現する
- UIの表示制御目的で useEffect を使わない

---

### 使用してよいケース

- ブラウザAPI操作（window / document）
- event listener の登録・解除
- 外部購読（WebSocketなど）
- DOM操作
- アニメーション制御などの純粋な副作用

---

### 使用禁止・非推奨ケース

- propsからstateを生成する処理
- loading / error などUI状態の制御
- Storybook状態の代替としてのuseEffect
- API fetch目的（Server Component / MSW優先）

---

### Storybookとの関係

- UI状態は story で定義する
- state遷移は story 切替で表現する
- useEffectで状態遷移を作らない
- mock / args で再現する

---

### 依存配列ルール

- 使用している値は必ず依存配列に含める
- eslintルールを無視しない
- stale closure を許容しない

---

### StrictMode考慮

- useEffectは開発時に2回実行される可能性がある
- 副作用は必ず冪等にすること
- 二重実行で壊れる処理は禁止

---

### クリーンアップ必須ケース

- event listener
- interval / timeout
- subscription

必ず cleanup を実装すること

---

## Component 分割ルール

以下の場合は component 分割を検討すること：

- JSX が長すぎる
- 状態責務が増えすぎている
- 再利用可能
- story が複雑になりすぎている

---

## 禁止事項

- 実装前に stories を省略する
- Loading/Error を省略する
- Storybook 上で動作確認できない状態を作る
- API実通信に依存する
- 巨大 story を作る
- 1 story で複数状態を表現する
- UI仕様未定義のまま実装する
- useEffectでUI状態を構築する

---

## レビュー観点

レビュー時は以下を確認する：

- UI仕様が十分か
- 状態が不足していないか
- responsive behavior
- accessibility
- visual consistency
- interaction
- Loading/Error handling
- useEffectの用途が適切か
