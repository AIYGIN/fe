# Project Agent Rules

このファイルは全エージェントの入口ルールだけを定義する。詳細な役割・実装規約・ワークフローは参照先に委譲し、作業前に必要な範囲だけ読むこと。

<!-- CODEGRAPH_START -->
## CodeGraph

`.codegraph/` があるため、コードの理解・探索・影響範囲確認では grep/find や直接読みに入る前に CodeGraph を使う。

- MCP が使える場合: `codegraph_explore` を優先し、必要に応じて `codegraph_node` / `codegraph_callers` を使う。
- Shell の場合: `codegraph explore "<question or symbols>"` / `codegraph node <symbol-or-file>` を使う。
<!-- CODEGRAPH_END -->

## Command Efficiency

シェルコマンドは原則 `rtk` を prefix して実行する。`rtk` が環境にない、またはデバッグで生出力が必要な場合のみ通常コマンドへ戻す。

コマンドチェーンでは各 segment に `rtk` を付ける。生出力を維持しつつ計測したい場合は `rtk proxy <cmd>` を使う。

### Skill / Format Verification Gate

`SKILL.md`、スキル付属テンプレート、PR / Issue / commit message など外部に残る成果物のフォーマット確認では、`rtk` による圧縮出力を読了扱いにしない。

- スキル本文・テンプレート確認では `rtk read` / `rtk cat` / `rtk grep` を使わず、通常の `sed -n`、`cat`、`grep`、`nl -ba` で必要範囲を確認する。
- 出力が `[... compressed ...]`、`<<ccr:...>>`、要約表示になった場合は、その時点で確認失敗として作業を止める。汎用フォーマットで代用しない。
- `auto-pr`、`plan-to-issue`、提案書などフォーマット指定のあるスキルでは、作成前に必須見出し・順序・チェック項目を確認し、その形式であることを確認してから `gh pr create` / `gh pr edit` / `gh issue create` を実行する。
- 作成後は `gh pr view` / `gh issue view` で実際の本文を取得し、スキル指定フォーマットとの差異があれば即修正する。
- このゲートは Command Efficiency より優先する。rtk が原因で全文確認できない場合は rtk を外す。

例:

```bash
rtk git status
rtk git diff
rtk pnpm check
rtk test pnpm test
```

## Core Principles

- Storybook Driven Development、Test Driven Development、コンポーネント中心設計を前提にする。
- マルチエージェント分業は `.codex/agents/*.toml` の役割定義に従う。
- フロントエンド実装は必ず `src/AGENTS.md` を起点にする。
- 実装技術は `docs/rules/tech-stack.md` に従う。Store / Zod / PandaCSS / Orval / MSW を使わない判断は実装者が独自に行わない。
- Orval 生成物は `src/apis/generated` を本番コードから直接利用する。
- `src/apis` 直下に本番用 API ラッパーや業務ロジックを追加しない。配置可能なのは Orval 共通 mutator と mock / test 用構成だけ。

エージェント定義:

- `.codex/agents/pm.toml`
- `.codex/agents/tester.toml`
- `.codex/agents/implementer.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/issue_responder.toml`

## Required References

- 開発ワークフロー: `.codex/workflows/sdd_flow.md`
- フロントエンド全体: `src/AGENTS.md`
- 技術スタック: `docs/rules/tech-stack.md`
- UI: `docs/rules/ui.md`
- テスト: `docs/rules/testing.md`
- フロントエンド実装: `docs/rules/frontend.md`
- 状態管理: `docs/rules/state-management.md`

API を利用する Story、test、実装、レビューでは `docs/rules/state-management.md` を必ず参照し、状態分類と管理スコープを確認する。

## Branch Rule

実装・修正・テスト作成を始める前に必ず作業ブランチを切る。1タスク = 1ブランチを原則とし、ブランチは短命に保つ。

ブランチ名:

```txt
<prefix>/<short-description>
```

許可 prefix:

- `feat`: 新機能
- `fix`: 不具合修正
- `refactor`: 挙動を変えない改善
- `docs`: ドキュメント
- `test`: テスト
- `infra`: インフラ / CI
- `chore`: その他

## Development Flow

1. PM が要件・ユーザーストーリー・タスクを整理する。
2. Tester が RED として test / Story を作成する。
3. Reviewer が test / Story を確認する。
4. Implementer が最小実装で GREEN にする。
5. Tester が検証する。
6. Reviewer が最終確認する。

最終確認では要件適合、Storybook の表示、ローカルサーバーでのUI / 動作、ブラウザコンソールの警告・エラーを確認する。

責務を越えた仕様変更、tester 不在の実装、stories なし実装、レビューなし完了、UI とロジックの混在は禁止。Implementer は仕様・test・Story・mock シナリオを書き換えて通してはならず、過剰設計も避ける。

## Quality Gates

コード変更後は必ず実行する。

```bash
pnpm check
```

テストが存在する場合:

```bash
pnpm test
```

E2E が存在する場合:

```bash
pnpm test:e2e
```

完了条件は `pnpm check`、該当テスト、Storybook / UI 確認、レビューが通っていること。

## Issue Responder

Issue 対応エージェントは人間の明示トリガーがある場合だけ動作する。起動時は Issue 要約、影響範囲、推奨アクションを提示し、続行許可を得てから作業する。

修正には再現 test または Story を伴わせ、検証後にドラフト PR を作成する。main への自動マージ、仕様変更、明示許可のない外部ネットワーク変更は禁止。

Issue 対応の実行ログと変更履歴は、人間が追跡できる形で Issue / PR に残す。大規模または横断的な影響がある修正は即座にエスカレーションする。

## Memory

タスク終了時、必要に応じて `agent-memory` を更新する。秘密情報・個人情報・一時的な雑ログは保存しない。

- 長期的な設計判断: `agent-memory write --target long_term --content "..."`
- 当日の作業ログ: `agent-memory write --target daily --content "..."`
- 未完了 TODO: `agent-memory scratchpad add --text "..."`

ユーザーが「前回の続き」「再開」「続きから」「思い出して」と依頼した場合は、作業前に scratchpad、daily の直近日付ログ、long_term の関連判断を確認し、次の形式で短く報告する。

```txt
前回やっていたこと:
未完了 TODO:
今回最初にやること:
```

## Sub-agent

サブエージェントを使う場合は token 使用量と終了理由を明確に管理する。

- Issue / PR / 外部仕様を扱うタスクでは、親エージェントが一次情報を全文確認してからサブエージェントへ委譲する。サブエージェントの要約は補助情報であり、親の一次情報読了の代替にしない。
- Issue本文、PR本文、レビューコメント、スキル本文などの一次情報が圧縮・要約・断片表示になった場合は、委譲や実装に進まず、非圧縮で読める取得方法を確立する。確立できない場合は、その時点でユーザーへブロックとして報告する。
- PM / explorer / reviewer サブエージェントへ依頼するときは、親が確認済みの一次情報から route、受け入れ条件、禁止事項、既知の未確定点を明示して渡す。サブエージェントに仕様の読み替えや推測を任せない。
- サブエージェントの最終報告を採用する前に、親エージェントが要件上の重要点（route、状態遷移、外部リンク属性、テスト/Story、PRフォーマットなど）を一次情報と照合する。照合できない場合は完了扱いにしない。
- 委譲した作業と同じ実装を親エージェントが並行して進めない。
- 長時間 running のままでも、ユーザー確認なしに close/shutdown しない。
- 止める前に、待機時間、最後に観測できた状態、終了しない理由として断定できる事実、不明点、継続/停止/親側引き継ぎの選択肢をユーザーへ説明する。
- `previous_status: "running"` を閉じた場合、終了理由は「親が close_agent したため」と明記し、サブエージェント内部エラーと断定しない。
- mock Issue では `mock_tester -> mock_implementer -> mock_reviewer` の完了状況を明示する。reviewer 未実施なら完了扱いしない。
- token 使用量が増える追加待機、追加サブエージェント起動、親側引き継ぎは、必要性を説明してから進める。


<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
