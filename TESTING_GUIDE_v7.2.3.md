# v7.2.3 テストガイド - ログインボーナス無限受け取りバグ修正

## 🎯 修正内容

### **問題**
ログインボーナスが何度でも受け取れてしまう重大なバグ

### **原因**
処理順序の問題により、アトミック性が保証されていなかった：
1. ポイント付与（RPC）
2. DB記録（INSERT）← ここで失敗してもポイントは既に付与済み
3. 結果：DB記録がないので次回ログイン時も「未受け取り」と判定される

### **修正内容（v7.2.3）**
処理順序を逆転し、アトミック性を確保：
1. **DB記録（INSERT）** ← 先にロック
2. ポイント付与（RPC）
3. RPC失敗時 → DB記録を削除（ロールバック）

### **追加改善**
- ✅ チェッククエリを最新10件→最新1件に最適化
- ✅ エラー時は処理を中断（二重付与防止）
- ✅ デバッグログ強化

---

## 🧪 テスト手順

### **準備：今日のボーナスをクリア**

Supabase SQL Editor で実行:
```sql
-- rikki5.929@gmail.com の今日のログインボーナスを削除
DELETE FROM point_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'rikki5.929@gmail.com')
  AND type = 'login_bonus'
  AND DATE(created_at AT TIME ZONE 'Asia/Tokyo') = CURRENT_DATE;

-- 確認
SELECT 
  u.email,
  pt.amount,
  pt.type,
  pt.description,
  pt.created_at,
  DATE(pt.created_at AT TIME ZONE 'Asia/Tokyo') AS bonus_date_jst
FROM point_transactions pt
JOIN users u ON pt.user_id = u.id
WHERE u.email = 'rikki5.929@gmail.com'
  AND pt.type = 'login_bonus'
ORDER BY pt.created_at DESC
LIMIT 5;
```

---

### **テスト A: 初回ログインボーナス受け取り**

#### 手順
1. ブラウザで https://gegsmoop.gensparkspace.com/ を開く
2. **Ctrl + Shift + R** を5回押してキャッシュクリア
3. **F12** でDevToolsを開く → **Console** タブ
4. **Application** → **Service Workers** → **Unregister** → リロード
5. ログアウト → ログイン（rikki5.929@gmail.com）

#### 期待される動作
✅ **モーダル表示**
```
🎉 ログインボーナス獲得！
7日目 ログイン！
+25pt
ポイント残高に追加されました
[閉じる]
```

✅ **Console ログ**
```
🔍 Checking login bonus for user 360f2120-087d-4a04-9089-37aa938e9bd4, today: 2026-02-23
📊 Found 0 recent login bonuses
🎁 No login bonus found for today: 2026-02-23, awarding bonus...
✅ Login bonus transaction recorded: <transaction-id>
✅ Login bonus awarded: day 7 = 25pt
```

✅ **ポイント残高が +25pt 増加**

---

### **テスト B: 同日2回目ログイン（重複防止）**

#### 手順
1. モーダルを閉じる
2. すぐに**ログアウト**
3. すぐに**ログイン**（同じアカウント）

#### 期待される動作
❌ **モーダルは表示されない**

✅ **Console ログ**
```
🔍 Checking login bonus for user 360f2120-087d-4a04-9089-37aa938e9bd4, today: 2026-02-23
📊 Found 1 recent login bonuses
📅 Latest bonus record: <bonus-id>
   - created_at (UTC): 2026-02-23T06:XX:XX.XXXXXX+00:00
   - Local timestamp: Sun Feb 23 2026 15:XX:XX GMT+0900 (日本標準時)
   - Extracted date: 2026-02-23
   - Today's date: 2026-02-23
   - Match: true
✅ Login bonus already received today: 2026-02-23
```

✅ **ポイント残高は変化しない**

---

### **テスト C: 複数回ログイン・ログアウト（ストレステスト）**

#### 手順
1. 5回連続で「ログアウト → ログイン」を繰り返す
2. 各ログイン時のConsoleログをチェック

#### 期待される動作
- ✅ 初回のみモーダル表示
- ✅ 2回目以降は「already received today」メッセージ
- ✅ ポイント残高は初回+25ptのみ（それ以上増えない）

---

### **テスト D: データベース確認**

#### SQL クエリ
```sql
-- 今日のログインボーナス記録を確認
SELECT 
  u.email,
  pt.id,
  pt.amount,
  pt.type,
  pt.description,
  pt.created_at,
  DATE(pt.created_at AT TIME ZONE 'Asia/Tokyo') AS bonus_date_jst,
  TO_CHAR(pt.created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD HH24:MI:SS') AS created_at_jst
FROM point_transactions pt
JOIN users u ON pt.user_id = u.id
WHERE u.email = 'rikki5.929@gmail.com'
  AND pt.type = 'login_bonus'
  AND DATE(pt.created_at AT TIME ZONE 'Asia/Tokyo') = CURRENT_DATE
ORDER BY pt.created_at DESC;
```

#### 期待される結果
- ✅ **ちょうど1件のレコード**（複数件ではない）
- ✅ `amount = 25`（7日目）
- ✅ `type = 'login_bonus'`
- ✅ `description = 'ログインボーナス（7日目）'`
- ✅ `bonus_date_jst = 2026-02-23`（今日）

---

## ✅ 合格基準

すべてのテストが以下を満たすこと：

- [x] テストA: 初回ログインでボーナスモーダル表示 + ポイント+25pt
- [x] テストB: 2回目ログインでモーダル非表示 + ポイント変化なし
- [x] テストC: 複数回ログインでポイント増加は初回のみ
- [x] テストD: DBレコードは今日分が**1件のみ**

---

## 🔴 不合格ケース

以下の場合は**バグが残っている**：

- ❌ 2回目ログインでもモーダルが表示される
- ❌ 複数回ログインでポイントが増え続ける
- ❌ DBに同じ日付の `login_bonus` レコードが複数ある
- ❌ Console に「Error inserting login bonus transaction」が出る

---

## 📊 エコノミーバランス確認

### **30日間のポイント獲得シミュレーション**
```
登録ボーナス:        500pt
フレンド招待:         50pt
ログインボーナス:
  1日目〜7日目:     110pt
  8日目〜30日目:    575pt (25pt × 23日)
-------------------------------
合計（30日後）:    1,235pt
```

### **ポイント消費（挑戦）**
```
Lv.1 挑戦 × 2回:   -50pt
Lv.2 挑戦 × 1回:   -50pt
Lv.3 挑戦 × 1回:  -100pt
Lv.5 挑戦 × 1回:  -250pt
-------------------------------
合計消費:          -450pt
```

### **30日後の残高**
```
1,235pt - 450pt = 785pt（健全）
```

✅ ポイントが枯渇せず、継続的に挑戦できる設計になっている

---

## 🚀 デプロイ後の確認事項

### **1. キャッシュクリア**
- ユーザーに「Ctrl + Shift + R」を案内
- Service Worker の Unregister を推奨

### **2. 本番環境でのテスト**
- https://gegsmoop.gensparkspace.com/ でテストA〜Dを実施
- 少なくとも2名のテストユーザーで確認

### **3. Supabase ログ監視**
- https://supabase.com/dashboard/project/mthfqqqukuvueprdokiq/logs
- `point_transactions` テーブルの `login_bonus` レコードを監視
- 異常な増加（1ユーザーが1日に複数回）がないか確認

---

## 📝 報告テンプレート

### **成功時**
```
✅ v7.2.3 テスト完了！

【テストA: 初回ログイン】
✅ モーダル表示
✅ +25pt 付与
✅ Console ログ正常

【テストB: 2回目ログイン】
✅ モーダル非表示
✅ already received today
✅ ポイント変化なし

【テストC: 複数回ログイン】
✅ 5回ログイン → ポイント増加は初回のみ

【テストD: DB確認】
✅ 今日のレコード: 1件のみ
✅ amount = 25, type = login_bonus
```

### **失敗時**
```
❌ v7.2.3 テスト失敗

【問題】
- （具体的な問題を記載）

【Console エラーログ】
（エラーメッセージをコピペ）

【DBクエリ結果】
（SQL結果をコピペ）

【ブラウザ】
Chrome 121.0 / Safari 17.2 / etc.

【スクリーンショット】
（可能であれば添付）
```

---

## 🎯 次のステップ

v7.2.3 のテストが全て成功したら：

1. ✅ App Store 公開準備
   - スクリーンショット撮影（iPhone 6.7"/6.5"/5.5"）
   - プライバシーポリシー作成
   - 利用規約作成
   - PWA Builder でビルド

2. ✅ マーケティング準備
   - アプリ説明文（日本語・英語）
   - アプリアイコン最終確認
   - プロモーション動画（オプション）

---

## 📞 サポート

質問やバグ報告は以下の形式で：
- **問題の詳細**: 何が起きているか
- **再現手順**: 1, 2, 3...
- **期待する動作**: どうあるべきか
- **実際の動作**: 実際はどうなっているか
- **環境情報**: ブラウザ、OS、デバイス

---

© 2026 Saikou Team. All rights reserved.
