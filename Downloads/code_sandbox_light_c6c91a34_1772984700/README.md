# Saikou! - 習慣継続アプリ

## プロジェクト概要

毎日の習慣を継続し、フレンドと一緒に目標達成を目指すPWAアプリ。
**Saikou! Pro** は「逃げ道を消す契約型チャレンジ空間」。

- **バージョン**: v17.0.0
- **本番URL**: https://gegsmoop.gensparkspace.com/
- **技術スタック**: Pure HTML/CSS/JavaScript + Supabase + Service Worker

---

## ✅ 実装済み機能

### コア機能
- ユーザー登録（招待コード制）・ログイン・パスワードリセット
- 毎日のタスク管理（最大3タスク）・チェックボックス
- 今日の確定（コミット）・取り消し（1日1回まで）
- 継続日数（ストリーク）の自動計算・週間ビュー表示
- 次のマイルストーン（5/10/20/30/50/75/100...日）表示

### ⭐ XP / レベルシステム（v10.9.0 新規）
- **タスク1つ完了 = 3 XP**、**全タスク完了 = 12 XP**（9+ボーナス3）
- **連続日数ボーナス**: 3日=+1, 7日=+2, 14日=+3, 30日=+5, 60日=+8, 100日=+12 XP
- **レベル1〜100**設計（指数曲線: Lv1→2が100XP、Lv99→100が約50,000XP）
- 各レベルに称号名（例: Lv1「はじめの一歩」→ Lv100「LEGEND」）
- **ホーム画面にXPバー**（ゴールドシマーアニメーション）とレベルバッジ表示
- タスクチェック時に +3XP プレビューを即時表示
- **レベルアップ時**: 全画面オーバーレイ、コンフェッティ80個、バイブレーション
- XPはlocalStorageで管理（将来DB移行可能）
- フレンドカードにも相手のレベルバッジを表示

### 演出・アニメーション（v10.9.0 強化）
- コミット確定時: ゴールドバナー + XPポップアップ浮上アニメーション
- タスクチェック時: ✅アイコン + XPポップアップ + バイブレーション
- レベルアップ: 全画面フルスクリーン演出（3.8秒、タップで閉じる）
- コンフェッティ: 8色60〜80個がランダムに降り注ぐ
- XPバー: シマーアニメーション + スプリングイージング

### フレンド機能
- 招待コードによるフレンド申請・承認・拒否・削除
- フレンドの継続日数ランキング・今日の達成状況表示
- フレンドカードに相手のレベルバッジを表示（v10.9.0追加）
- 応援メッセージ送信（5種類から選択）
- フレンド達成通知（Supabase Realtime経由）

### 本気の部屋（Serious Room）
- ⚡ **PRO封印中**: 全ユーザーが直接入室可能（ストリーク条件を一時無効化）
- 14日チャレンジ参加・宣言（目標・理由・努力内容・証拠方法）
- 参加者タブ: 生存者/脱落者一覧、ストリーク数、フレンド申請ボタン
- 投稿: テキスト＋証拠画像（Base64またはURL）添付対応
- コメント: 自分/他人のバブル分け、リアルタイム通知
- リアクション（🔥💪👏）カウント
- 自分の投稿のみ削除ボタン表示
- 満員時の予約（ウェイトリスト）機能

### その他
- プッシュ通知（Service Worker + Web Push）
- 管理者テストモード（`?admin_test=saikou2026`）
- 管理者ページ（`/admin.html`、パスワード: `saikou-admin-2026`）
- プライバシーポリシー・利用規約

---

## 📋 Supabase RLS 設定（実行済みSQL）

```sql
-- friends
CREATE POLICY "Friends select own" ON friends
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR friend_user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
-- majiroom_posts / majiroom_participants / majiroom_comments / majiroom_waitlist
-- → それぞれ auth_user_id 経由の INSERT/SELECT/UPDATE/DELETE ポリシー適用済み
```

---

## ⚠️ 未実装・今後の課題

- XPのDB永続化（現在はlocalStorage）
- Stripe課金・IAP対応
- iOS App Store向けネイティブラップ（PWA Builder / Capacitor）
- 管理者ページのセキュリティ強化
- `debug.html` / `next-steps.html` の本番削除
- Supabase Edge Function（日次脱落判定）
- ストリーク継続での特別演出（マイルストーン達成時）

- 挑戦リクエスト送受信・承認・辞退

### 通知システム
- 21:00 JST リマインダー通知（Service Worker タイマー）
- フレンド達成時のOS通知（Realtime INSERT検知）
- Web Push購読（バックグラウンド通知対応）
- 通知バッジ（未読カウント、最大9+表示）
- 通知パネル（最大20件表示、既読管理）

### PWA機能
- Service Worker v10.3.0（キャッシュ管理・更新検知・自動リロード）
- manifest.json（スタンドアロン表示対応）
- ホーム画面追加対応（iOS Safari / Android Chrome）

### セキュリティ
- XSSエスケープ（escapeHtml）
- 入力サニタイゼーション（sanitizeInput）
- パスワード強度チェック
- 招待コード形式検証

---

## 📁 主要ファイル

| ファイル | 説明 |
|----------|------|
| `index.html` | メインアプリ（全機能含む単一ファイル） |
| `sw.js` | Service Worker v10.3.0 |
| `manifest.json` | PWAマニフェスト |
| `admin.html` | 管理画面（通知送信・ユーザー管理） |
| `icon-512x512.png` | アプリアイコン |
| `icon-192.png` | バッジ用アイコン |
| `privacy.html` | プライバシーポリシー |
| `terms.html` | 利用規約 |
| `reset-password.html` | パスワードリセットページ |

---

## 🗄️ データモデル（Supabase）

### テーブル一覧

| テーブル | 説明 |
|----------|------|
| `users` | ユーザー情報（display_name, invite_code, invited_count, is_pro等） |
| `tasks` | ユーザーのタスク（最大3件） |
| `daily_status` | 日次達成状況（date, done_count, is_committed, task_1/2/3_done） |
| `friends` | フレンド関係（user_id, friend_user_id, status: pending/approved） |
| `notifications` | 通知（to_user_id, from_user_id, type, message, is_read） |
| `push_subscriptions` | Web Push購読情報（user_id, endpoint, p256dh, auth） |
| `serious_room_challenges` | 本気の部屋チャレンジ |
| `user_points` | ポイント残高 |

---

## 🌐 主要URL・エンドポイント

| パス | 説明 |
|------|------|
| `/` or `/index.html` | メインアプリ |
| `/admin.html` | 管理画面（パスワード: saikou-admin-2026） |
| `/privacy.html` | プライバシーポリシー |
| `/terms.html` | 利用規約 |
| `/reset-password.html` | パスワードリセット |
| `/manifest.json` | PWAマニフェスト |
| `/sw.js` | Service Worker |

---

## 🔧 グローバル定数（変更箇所）

```javascript
const MAX_TASKS = 3;          // タスク上限
const MAX_INVITES_FREE = 2;   // 無料プラン招待上限（課金後に増加予定）
const MAX_INVITES_PRO  = 10;  // Proプラン招待上限
```

---

## 🐛 バグ修正履歴

### v10.7.8 (2026-03-01)
**本気部屋 大幅機能追加**

#### 🔴 バグ修正
- **majiroom_posts 400 Bad Request**: `users(display_name,...)` のPostgRESTリレーションJOINが外部キー未設定で失敗 → ユーザー情報を別クエリ（`users.in(userIds)`）で取得する方式に変更
- **majiroom_posts 403 Forbidden**: RLSポリシー修正SQL（下記）を適用する必要あり

#### ✨ 新機能
1. **投稿モーダル改善**
   - 証拠画像の添付（スクリーンショット・写真、5MB以内）
   - URLリンク添付（任意）
   - フィードにエビデンス画像を表示
   - 「5人以上の報告で審議」注意書きを追加

2. **参加者一覧パネル**（フィードと切り替えタブ）
   - 参加者名・ストリーク日数・目標表示
   - Instagramリンク表示
   - フレンド追加ボタン（申請済み/フレンド済みは状態表示）

3. **満席時 予約機能**
   - 満席判定時に「次期チャレンジを予約する」ボタンを表示
   - 覚悟宣言（目標・なぜ・行動・数値）を入力して予約枠を確保
   - `majiroom_waitlist`テーブルへ保存
   - 決済は参加確定時（予約時は不要）

#### 📋 Supabase側で必要な作業
```sql
-- majiroom_postsのRLSポリシー
DROP POLICY IF EXISTS "Users can insert own posts" ON majiroom_posts;
CREATE POLICY "Posts insert via auth_user_id" ON majiroom_posts
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Posts select all" ON majiroom_posts
  FOR SELECT USING (true);
CREATE POLICY "Posts update reactions" ON majiroom_posts
  FOR UPDATE USING (true);

-- majiroom_participantsのRLSポリシー（v10.7.7から）
DROP POLICY IF EXISTS "Users can insert own participation" ON majiroom_participants;
DROP POLICY IF EXISTS "Users manage own participation" ON majiroom_participants;
CREATE POLICY "Participants insert via auth_user_id" ON majiroom_participants
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Participants select all" ON majiroom_participants FOR SELECT USING (true);
CREATE POLICY "Participants update own" ON majiroom_participants
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- majiroom_postsにevidenceカラム追加（未追加の場合）
ALTER TABLE majiroom_posts ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- majiroom_participantsに宣言カラム追加（未追加の場合）
ALTER TABLE majiroom_participants ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE majiroom_participants ADD COLUMN IF NOT EXISTS goal_why TEXT;
ALTER TABLE majiroom_participants ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE majiroom_participants ADD COLUMN IF NOT EXISTS action_why TEXT;
ALTER TABLE majiroom_participants ADD COLUMN IF NOT EXISTS proof_method TEXT;

-- majiroom_waitlistテーブル作成
CREATE TABLE IF NOT EXISTS majiroom_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal TEXT,
  goal_why TEXT,
  action TEXT,
  amount INTEGER,
  unit TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE majiroom_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Waitlist insert own" ON majiroom_waitlist FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Waitlist select own" ON majiroom_waitlist FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);
```

### v10.7.7 (2026-03-01)
**RLS修正 & 宣言画面UI強化**
- **RLS 403エラー（majiroom_participants）**: `users.id`（アプリ独自UUID）と `auth.uid()`（Supabase Auth UUID）が別物のためINSERT失敗していた
  - **根本原因**: RLSポリシーが `user_id = auth.uid()` だが、アプリは独自UUIDを使用（`auth_user_id`カラムが別に存在）
  - **Supabase側修正SQL**（要実行）:
    ```sql
    DROP POLICY IF EXISTS "Users can insert own participation" ON majiroom_participants;
    DROP POLICY IF EXISTS "Users manage own participation" ON majiroom_participants;
    CREATE POLICY "Participants insert via auth_user_id" ON majiroom_participants
      FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
      );
    CREATE POLICY "Participants select all" ON majiroom_participants
      FOR SELECT USING (true);
    CREATE POLICY "Participants update own" ON majiroom_participants
      FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
      );
    ```
  - **フロントエンド側修正**: `insert`に`goal`, `goal_why`, `action`, `action_why`, `proof_method`フィールドを追加
- **宣言画面**: `declareGoalWhy`（なぜそうなりたいのか）・`declareActionWhy`（なぜそれをやるのか）を必須入力（5文字以上）に変更し `updateDeclareBtn()` でバリデーション強化
- **宣言データ保存**: localStorage保存オブジェクトに `goalWhy`, `actionWhy` を追加

### v10.7.3 (2026-03-01)
**セキュリティ強化 & 管理者テストモード**
- `checkRateLimit(key, ms)` — 汎用レートリミッター追加
  - コミット: 3秒, 投稿: 5秒, リアクション: 2秒/投稿, 応援: 10秒/フレンド
- `runOnce(key, fn)` — 非同期処理の二重実行防止
- `validateLength(text, min, max)` — テキスト長検証（XSS・DB負荷対策）
- `isSafeUrl(url)` — URL検証（https:のみ許可）
- **管理者テストモード**: URLに `?admin_test=saikou2026` を付けてアクセスすることで
  - Proロック条件（5日ストリーク）をバイパス
  - 覚悟画面からのStripe課金をバイパスして直接入室
  - コンソールから `window._adminEnterRoom(challengeId)` で強制入室


- **Bug**: 通知を削除してベルアイコンを再タップすると削除した通知が再表示される
  - **原因**: Supabase RLS（Row Level Security）ポリシーがanon keyでの`DELETE`を制限
  - **修正①**: `_deleteNotif` に `to_user_id` フィルターを追加（RLSポリシーを満たす形で削除）
  - **修正②**: クライアント側で削除済みIDをlocalStorageに保存し、パネル再表示時にフィルタリング
  - **修正③**: `toggleNotifPanel` で削除済みIDを除外してから表示する処理を追加
  - **副作用**: RLSによる削除失敗でも、ローカルで追跡するためUIには再表示されない（7日後に自動クリーンアップ）

### v10.7.1
- `escapeHtml is not defined` エラー修正
- テーブル名を `majiroom_*` に統一（`serious_room_challenges` → `majiroom_challenges` 等）

### v10.3.0 (2026-02-26)
- **Bug1**: ログアウト後に画面が戻らない → `appMain` → `mainApp` に修正
- **Bug2**: 招待上限チェックがハードコード2のまま → `MAX_INVITES_FREE` 変数に統一
- **Bug3**: 日付変更時に存在しないDBカラム `todayStatus` を更新していた → 削除
- **Bug4**: 新規登録時のフレンド関係が `status: 'approved'` なしで作成されていた → 修正
- **Bug5**: `icon-192.png` が空ファイル（404エラー） → `icon-512x512.png` でコピー

### v10.2.0
- `index.html` と `sw.js` をキャッシュ対象から除外（常にネットワーク優先）
- キャッシュ名を `saikou-v10.2.0` に更新

### v10.1.0
- `refreshNotifBadge` の `currentUser` 参照エラーを修正（window._currentUserId使用）
- `_safeRefreshNotifBadge` をグローバルに定義
- SW自動リロード機能追加

---

## ⏳ 未実装・要対応

### Saikou! Pro / 本気部屋
- **Stripe決済**: `proceedToPayment()` 内の `STRIPE_PAYMENT_URL` を実際のPayment Link URLに差し替える
  - Stripeダッシュボード → Payment Links → `https://buy.stripe.com/XXXXX`
  - Stripe Webhook で支払い完了後に `majiroom_participants` テーブルへINSERT
- **Supabase RLS（通知削除）**: `notifications` テーブルに削除ポリシーが未設定の場合、以下のSQLで追加：
  ```sql
  CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (to_user_id = auth.uid());
  ```
- **Supabase RLS**: `majiroom_posts`, `majiroom_participants`, `majiroom_comments` テーブルのRLSポリシー設定
- **脱落自動判定**: Edge Function で毎日23:59後に未投稿ユーザーのstatusをeliminatedに更新
- **次回参加権管理**: 支払い完了済みユーザーへの割引コード発行

### その他
- **課金システム**: App Store In-App Purchase（Apple Developer承認後）
- **プッシュ通知（バックグラウンド）**: iOS Safari は permission: default のまま → 設定タブで手動許可が必要
- **Expo/EAS Build**: React Native WebViewラッパー作成中（Apple Developer承認待ち）

---

## 📋 次の開発ステップ

1. **Stripe連携**（最優先）:
   - Stripeダッシュボードで Payment Link 作成（¥5,000）
   - `STRIPE_PAYMENT_URL` を実際のURLで差し替え
   - Stripe Webhook → Supabase Edge Function → `challenge_participants` INSERT

2. **Supabase DB対応**:
   - `users` テーブルに `instagram_handle TEXT` カラムを追加
   - `serious_room_challenges`, `challenge_participants`, `challenge_posts`, `challenge_comments` テーブル作成
   - 各テーブルにRLSポリシー設定

3. **管理者機能**:
   - `/admin.html` にチャレンジ部屋作成・参加者管理・脱落処理を追加

4. **Apple Developer Program 承認後**:
   - App Store Connect でアプリ登録・EAS Build
