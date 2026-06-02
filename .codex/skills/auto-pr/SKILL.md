---
name: auto-pr
description: 直前のコミット内容をもとにPRタイトルと本文を生成し、GitHubのPR用フォーマットへ変換して自動登録する
---

# auto-pr

## 概要

このスキルは、直前のコミット内容をもとにPRタイトルと本文を生成し、GitHubのPR用フォーマットへ変換して自動登録します。

## 参照ファイル

このスキルを実行する際は、以下のファイルを必ず読み込んで使用してください。

- PRテンプレート: `assets/template.md`
- PR作成スクリプト: `scripts/create_pr.sh`

## 入力

直前のコミット情報

## 出力

GitHubのPR（gh pr create により自動登録）

---

## 実行手順

### 1. 直前のコミット情報と変更内容を取得する

```bash
git log -1 --pretty=format:"%h%n%s%n%b"
git show --no-color
```

- git log: 意図（タイトル・背景）
- git show: 変更内容（diff）

---

### 2. 解析して以下を生成する

- summary（概要）
- background（背景・目的）
- implementation（実装内容：箇条書き）
- test_items（テスト確認項目：チェックリスト形式）
- impact（影響範囲：箇条書き）
- future_work（未対応・今後の課題：箇条書き or なし）

---

### 3. PR本文を生成する

`assets/template.md` を読み込み、以下ルールで置換する：

- {{summary}} → summary
- {{background}} → background
- {{implementation}} → implementation
- {{test_items}} → test_items
- {{impact}} → impact
- {{future_work}} → future_work

---

### 4. PRタイトルを生成する

フォーマット：

```text
auto: <summaryの短縮版>
```

---

### 5. PRを作成する

現在のブランチをGitHubへ反映し、そのブランチを元にPRを作成する。

#### 5-1. 現在のブランチをGitHubへプッシュ

```bash
git push -u origin HEAD
```

※ pushに失敗した場合は処理を中断する

#### 5-2. PR作成

`scripts/create_pr.sh` を利用し、生成したPRタイトルと本文をGitHubに登録する

---

## 補足ルール（重要）

### ■ implementation

- diff（git show）に**実際に現れた変更のみ**を記述する
- 推測は禁止

---

### ■ test_items（重要改善）

テスト観点は以下を厳守：

- コマンド実行（例: pnpm test, npm run test など）を書かない
- 「実行手段」ではなく「確認すべき振る舞い」を書く
- diffに基づいたユーザー視点の確認項目にする

#### 良い例

- [ ] ユーザー一覧が正しく取得できる
- [ ] エラー時に適切なメッセージが表示される
- [ ] 新規作成後に一覧へ反映される

#### 悪い例（禁止）

- [ ] pnpm testを実行する
- [ ] テストコマンドを通す

---

### ■ impact

- 影響範囲を事実ベースで記載する（推測禁止）

---

### ■ future_work（重要改善）

以下ルールを厳守：

- diffやコミット内容から**明確に未対応と分かる場合のみ記載**
- 推測や一般論は禁止
- 該当がない場合は必ず以下のいずれかにする：
  - `なし`
  - または空欄（推奨は「なし」）

#### 記載してよい例

- エラーハンドリングの追加が未実装
- 一部APIのリトライ処理が未対応

#### 記載NG例

- パフォーマンス改善が必要（根拠なし）
- 今後リファクタリング予定（根拠なし）

---

## 全体ルール

- implementation / impact / future_work は必ず箇条書き
- test_items は必ずチェックリスト形式（- [ ]）
- diff（git show）を必ず根拠とし、推測のみで生成しない