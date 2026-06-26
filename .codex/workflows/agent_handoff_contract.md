# Agent Handoff Contract

## Agent Handoff の目的

- 各 agent が必要最小限の context だけを受け取る。
- 前 agent の出力全文ではなく、未解決 finding と必要ファイルだけを引き継ぐ。
- token 消費を抑えつつ、TDD / SDD ループの品質を維持する。
- 同じ調査や同じ失敗を繰り返さない。

## Required fields

すべての agent handoff では、以下の項目を基本フィールドとして扱う。

- `task`: 次 agent が実行する具体タスク
- `goal`: 達成すべき状態
- `next_agent`: 次に起動する agent 名
- `context_files`: 次 agent が読むべき最小限のファイルパス
- `acceptance_criteria`: 完了条件
- `latest_command_result`: 最新のコマンド結果の要約
- `open_findings`: 未解決の指摘
- `context_used`: 現 agent が実際に判断に使ったファイル・ログ・Issue・PR・スクリーンショット
- `deferred_findings`: 今回は扱わない指摘
- `resolved_findings`: 今回解決した指摘

## Forbidden context

次の情報は agent 間で渡さない。

- repository 全体の raw context
- 解決済み finding
- 古い test log
- 関連しない generated files
- 関連しない Storybook
- 関連しない screenshot
- 関連しない issue comment
- 前 agent の出力全文
- 長い raw command output
- 推測だけで選んだファイル

## Token Policy

- file content より file path を優先する。
- raw log より最新結果の要約を優先する。
- 前 agent の出力全文ではなく、未解決 finding だけ渡す。
- `context_files` は原則 5 ファイル以内にする。
- 5 ファイルを超える場合は理由を明記する。
- 追加 context が必要な場合は、探索を広げず、具体的な file path を要求する。
- generated files は、契約差分や型定義の確認が必要な場合だけ渡す。
- screenshot / Storybook / Issue comment は、UI 差分や受け入れ条件の根拠になる場合だけ渡す。

## context_used ルール

各 agent は、出力 JSON に必ず `context_used` を含める。

`context_used` には、実際に判断に使った情報だけを書く。

例:

```json
{
  "context_used": [
    "src/components/modules/TodoBoard/TodoComposer/index.tsx",
    "src/components/modules/TodoBoard/TodoComposer/index.test.tsx",
    "pnpm test src/components/modules/TodoBoard/TodoComposer/index.test.tsx の最新結果"
  ]
}
```

禁止:

- 読んでいないファイルを書く
- repository 全体を書く
- 関連しないファイルを書く
- 古いログを書く
- 「たぶん必要」なファイルを書く

## Loop Guard

- 同一 finding で 3 回 fail したら `blocked` にする。
- 同一テストが 3 回連続で失敗したら `blocked` にする。
- context 不足なら guessing せず `blocked` にする。
- scope が広がる場合は PM または人間に戻す。
- `acceptance_criteria` と矛盾する指摘は `deferred_findings` に移す。
- PR / Issue のスコープ外の指摘は `deferred_findings` に移す。
- `blocked` の場合は以下を必ず出す。
  - `blocking_reason`
  - `tried_actions`
  - `missing_context`
  - `recommended_next_actions`

## Handoff JSON example

```json
{
  "task": "TodoComposer の空文字送信を防ぐ修正を行う",
  "goal": "trim 後に空文字の場合は addTodo が呼ばれない",
  "next_agent": "implementer",
  "context_files": [
    "src/components/modules/TodoBoard/TodoComposer/index.tsx",
    "src/components/modules/TodoBoard/TodoComposer/index.test.tsx"
  ],
  "acceptance_criteria": [
    "空文字では submit できない",
    "スペースのみの入力では addTodo が呼ばれない",
    "有効な入力では addTodo が呼ばれる"
  ],
  "latest_command_result": {
    "command": "pnpm test src/components/modules/TodoBoard/TodoComposer/index.test.tsx",
    "status": "failed",
    "summary": "スペースのみ入力で addTodo が呼ばれている"
  },
  "open_findings": [
    {
      "id": "R1",
      "severity": "high",
      "summary": "空文字 submit が防止されていない",
      "expected": "trim 後に空文字なら submit しない",
      "actual": "空文字でも addTodo が呼ばれる",
      "repro": "入力欄にスペースだけ入れて送信",
      "suggested_fix": "handleSubmit で text.trim() を検証する"
    }
  ],
  "context_used": [
    "src/components/modules/TodoBoard/TodoComposer/index.tsx",
    "src/components/modules/TodoBoard/TodoComposer/index.test.tsx",
    "latest failing test result"
  ],
  "loop_guard": {
    "finding_id": "R1",
    "attempt": 1,
    "max_attempts": 3,
    "on_exceeded": "blocked"
  }
}
```

## Reviewer finding JSON example

```json
{
  "id": "R1",
  "severity": "high",
  "file": "src/components/modules/TodoBoard/TodoComposer/index.tsx",
  "line": 42,
  "summary": "空文字 submit が防止されていない",
  "expected": "trim 後に空文字なら submit しない",
  "actual": "空文字でも addTodo が呼ばれる",
  "repro": "入力欄にスペースだけ入れて送信",
  "suggested_fix": "handleSubmit で text.trim() を検証する",
  "status": "open"
}
```
