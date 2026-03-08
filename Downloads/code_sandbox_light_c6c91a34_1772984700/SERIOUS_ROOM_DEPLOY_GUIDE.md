# 本気の部屋 MVP版 デプロイガイド

**バージョン**: v6.0.0 MVP  
**作成日**: 2026-02-22

---

## 📋 デプロイ手順

### Step 1: データベースマイグレーション

**重要**: この手順を必ず最初に実行してください。

1. **Supabase SQL Editor を開く**
   - URL: https://supabase.com/dashboard/project/mthfqqqukuvueprdokiq/sql

2. **`database_serious_room.sql` を実行**
   - ファイルの内容をコピー
   - SQL Editor に貼り付け
   - 「RUN」ボタンをクリック
   - 成功メッセージを確認

3. **実行内容の確認**
   ```sql
   -- 以下のテーブルが作成されます
   - serious_room_challenges
   - challenge_requests
   - titles
   - user_points (初期ポイント500を付与)
   - point_transactions
   - challenge_daily_history
   
   -- RLS (Row Level Security) も自動設定されます
   ```

4. **既存ユーザーへの初期ポイント付与**
   - トリガー機能により、既存ユーザーにも自動的に500ポイントが付与されます

---

### Step 2: ファイルのアップロード

以下のファイルを本番環境にアップロードしてください：

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | 本気の部屋UI + JavaScript関数追加 |
| `database_serious_room.sql` | データベーステーブル作成SQL |
| `README.md` | v6.0.0情報追加 |
| `SERIOUS_ROOM_DEPLOY_GUIDE.md` | このファイル（新規作成） |

---

### Step 3: キャッシュクリア

**ブラウザキャッシュをクリア**
- Chrome/Edge: `Ctrl + Shift + Delete` (Windows) / `Cmd + Shift + Delete` (Mac)
- Safari: `Command + Option + E`

**Service Worker のクリア**
1. Chrome DevTools を開く（F12）
2. Application タブ → Service Workers
3. 「Unregister」をクリック
4. ページをリロード

---

### Step 4: 動作確認

#### 4.1 解放条件の確認

1. **継続7日未満のユーザー**
   - 本気の部屋タブをタップ
   - 🔒 アイコンと「本気の部屋はまだ解放されていません」が表示される
   - 「現在の継続日数: X日」「あとY日で解放！」が表示される

2. **継続7日以上のユーザー**
   - 本気の部屋タブをタップ
   - レベル選択画面が表示される
   - ポイント残高「500」が表示される

#### 4.2 レベル選択の確認

1. レベルカードが表示される
   - Lv.1のみ解放（「挑戦する」ボタンあり）
   - Lv.2〜10はロック（🔒アイコン表示）

2. Lv.1カードをクリック
   - 相棒選択モーダルが開く
   - フレンドリストが表示される

#### 4.3 相棒選択の確認

1. フレンドが表示される
   - フレンドのアバターと名前が表示される
   - クリック可能

2. フレンドをクリック
   - 宣言入力モーダルが開く
   - レベル情報と相棒名が表示される

#### 4.4 宣言入力の確認

1. テキストエリアに宣言を入力
   - 例: 「毎日30分のランニングを7日間続ける」
   - 文字数カウンター「X/200文字」が更新される

2. 「宣言して開始」ボタンをクリック
   - 「相棒に挑戦リクエストを送信しました！」アラートが表示
   - 本気の部屋画面に戻る

#### 4.5 ポイント残高の確認

1. **Supabase Table Editor で確認**
   - URL: https://supabase.com/dashboard/project/mthfqqqukuvueprdokiq/editor
   - `user_points` テーブルを開く
   - 各ユーザーの `balance` が `500` になっているか確認

2. **アプリ画面で確認**
   - 本気の部屋画面上部に「ポイント残高: 500」が表示される

---

### Step 5: データベース確認

#### 5.1 テーブルの存在確認

Supabase Table Editor で以下のテーブルが存在するか確認：

- ✅ `serious_room_challenges`
- ✅ `challenge_requests`
- ✅ `titles`
- ✅ `user_points`
- ✅ `point_transactions`
- ✅ `challenge_daily_history`

#### 5.2 初期データの確認

**user_points テーブル**
- 全ユーザーの `balance` が `500` であること
- `user_id` が `users` テーブルの `id` と一致すること

---

## 🧪 テストシナリオ

### シナリオ1: 新規ユーザー（継続0日）

1. 新規登録
2. 本気の部屋タブをタップ
3. 🔒 ロック画面が表示される
4. 「現在の継続日数: 0日」「あと7日で解放！」

### シナリオ2: 継続7日達成

1. 7日間連続でタスクを達成
2. 本気の部屋タブをタップ
3. レベル選択画面が表示される
4. Lv.1のみ解放

### シナリオ3: 挑戦リクエスト送信

1. Lv.1をクリック
2. フレンドを選択
3. 宣言を入力（例: 「毎日30分のランニング」）
4. 「宣言して開始」をクリック
5. アラートが表示される

### シナリオ4: ポイント残高の確認

1. 本気の部屋画面を開く
2. 上部に「ポイント残高: 500」が表示される
3. Supabase で `user_points` テーブルを確認
4. `balance` が `500` であること

---

## 🐛 トラブルシューティング

### 問題1: 本気の部屋タブが表示されない

**原因**: ファイルのアップロードが完了していない

**解決策**:
1. `index.html` が正しくアップロードされているか確認
2. ブラウザキャッシュをクリア
3. Service Worker をアンインストール
4. ページをリロード

### 問題2: 「ポイント残高: 0」と表示される

**原因**: データベースマイグレーションが実行されていない

**解決策**:
1. Supabase SQL Editor を開く
2. `database_serious_room.sql` を実行
3. `user_points` テーブルに初期ポイントが挿入されたか確認
4. アプリをリロード

### 問題3: フレンドリストが表示されない

**原因**: フレンドがいない、または承認されていない

**解決策**:
1. フレンド画面でフレンドを追加
2. 相手が承認するまで待つ
3. 承認済みフレンドのみ相棒として選択可能

### 問題4: レベルカードが表示されない

**原因**: JavaScript エラー

**解決策**:
1. ブラウザの Console を開く（F12 → Console タブ）
2. エラーメッセージを確認
3. `🔥 Loading Serious Room...` が表示されるか確認
4. エラーがある場合、該当箇所を修正

### 問題5: 「継続7日以上」なのにロック画面が表示される

**原因**: `currentUser.current_streak` が正しく取得されていない

**解決策**:
1. ホーム画面で継続日数が正しく表示されているか確認
2. `users` テーブルで `current_streak` の値を確認
3. 一度ログアウト→ログインして再度確認

---

## 📊 データベース構造

### serious_room_challenges テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID |
| buddy_id | UUID | 相棒のユーザーID |
| level | INTEGER | レベル（1〜30） |
| challenge_days | INTEGER | 挑戦日数 |
| allowed_fail_days | INTEGER | 許容失敗日数 |
| deposit_points | INTEGER | デポジット総額 |
| user_share_points | INTEGER | ユーザー負担額 |
| buddy_share_points | INTEGER | 相棒負担額 |
| declaration | TEXT | 宣言（最大200文字） |
| start_date | DATE | 開始日 |
| end_date | DATE | 終了予定日 |
| status | TEXT | ステータス（pending/in_progress/succeeded/failed/cancelled/buddy_dropped） |
| user_succeeded_days | INTEGER | ユーザー達成日数 |
| user_failed_days | INTEGER | ユーザー失敗日数 |
| buddy_succeeded_days | INTEGER | 相棒達成日数 |
| buddy_failed_days | INTEGER | 相棒失敗日数 |

### user_points テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（UNIQUE） |
| balance | INTEGER | ポイント残高（初期値: 500） |

---

## 📝 今後の実装予定

### Phase 1: 相棒承認機能（次回実装）
- 相棒が挑戦リクエストを承認する機能
- 承認待ちリストの表示
- 48時間以内の承認期限

### Phase 2: 挑戦進行管理
- 毎日の達成状況を自動記録
- 成功/失敗の自動判定
- 日次リマインダー（プッシュ通知）

### Phase 3: 成功/失敗処理
- 成功時の称号付与
- 失敗時のポイント没収と再挑戦クレジット付与
- 成功/失敗モーダルの表示

### Phase 4: Lv.11〜30の追加
- より長期の挑戦レベル
- 高額デポジット

### Phase 5: リアルマネー決済
- Stripe等の決済システム連携
- リアルマネーのデポジット

---

## 🚀 デプロイ完了チェックリスト

- [ ] データベースマイグレーション実行（`database_serious_room.sql`）
- [ ] `index.html` アップロード
- [ ] ブラウザキャッシュクリア
- [ ] Service Worker アンインストール
- [ ] 継続7日未満のユーザーでロック画面確認
- [ ] 継続7日以上のユーザーでレベル選択画面確認
- [ ] ポイント残高「500」表示確認
- [ ] レベルカード表示確認（Lv.1解放、Lv.2〜10ロック）
- [ ] 相棒選択モーダル動作確認
- [ ] 宣言入力モーダル動作確認
- [ ] 挑戦リクエスト送信確認
- [ ] Supabase `user_points` テーブル確認
- [ ] Console エラー確認

---

**作成者**: Saikou! Development Team  
**作成日**: 2026-02-22  
**バージョン**: v6.0.0 MVP
