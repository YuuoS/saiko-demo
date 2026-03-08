# Saikou! v7.0.0 テストガイド - ポイント獲得システム

## 🎯 今回の新機能

### **実装された機能**
✅ **継続日数ボーナスシステム**
- 3/7/14/30/50/100/200/300/500/1000日達成時に自動でポイント付与
- 豪華なアニメーション付きモーダル表示
- 重複受け取り防止機能

✅ **フレンド招待ボーナスシステム**
- 招待者・被招待者の両方に50pt付与
- 新規登録時に自動適用

✅ **ポイント履歴の記録**
- すべてのボーナスが `point_transactions` に記録される
- ボーナスタイプ: `streak_bonus`, `invitation_bonus`

---

## 💰 **ポイント獲得の全体像**

### **ユーザーがポイントを獲得できる方法**

| 方法 | ポイント | タイミング | 備考 |
|-----|---------|----------|------|
| 初回登録 | 500pt | 登録時 | 自動付与 |
| フレンド招待ボーナス | 50pt | 登録時 | 招待者・被招待者の両方 |
| 継続3日達成 | 10pt | ログイン時 | 1回のみ |
| 継続7日達成 | 50pt | ログイン時 | 1回のみ |
| 継続14日達成 | 100pt | ログイン時 | 1回のみ |
| 継続30日達成 | 200pt | ログイン時 | 1回のみ |
| 継続50日達成 | 300pt | ログイン時 | 1回のみ |
| 継続100日達成 | 500pt | ログイン時 | 1回のみ |
| 継続200日達成 | 1,000pt | ログイン時 | 1回のみ |
| 継続300日達成 | 2,000pt | ログイン時 | 1回のみ |
| 継続500日達成 | 5,000pt | ログイン時 | 1回のみ |
| 継続1000日達成 | 10,000pt | ログイン時 | 1回のみ |
| 挑戦成功 | デポジット返還 | 7日達成時 | Lv.1 = 25pt |

### **例：新規ユーザーの獲得ポイント**
```
初回登録: 500pt
招待ボーナス: 50pt
---------------------
初日の残高: 550pt

3日継続: +10pt → 560pt
7日継続: +50pt → 610pt

Lv.1 挑戦開始: -25pt → 585pt
Lv.1 挑戦成功: +25pt → 610pt

14日継続: +100pt → 710pt
30日継続: +200pt → 910pt
```

---

## 🧪 **テスト手順**

### **テスト1: 継続日数ボーナス（3日）**

#### **前提条件**
- 既存ユーザーの `current_streak` を 3 に設定
- 過去に3日ボーナスを受け取っていないこと

#### **SQLで継続日数を設定**
```sql
-- テストユーザーの継続日数を3に設定
UPDATE users
SET current_streak = 3
WHERE email = 'rikki5.929@gmail.com';

-- 確認
SELECT email, current_streak, display_name
FROM users
WHERE email = 'rikki5.929@gmail.com';
```

#### **テスト手順**
1. ブラウザで https://gegsmoop.gensparkspace.com/ を開く
2. `Ctrl + Shift + R` でキャッシュクリア
3. `rikki5.929@gmail.com` でログイン

#### **期待される動作**
1. ログイン直後に **豪華なモーダル** が表示される:
   ```
   🎉
   継続ボーナス獲得！
   
   3日 継続達成！
   
   +10pt
   ポイント残高に追加されました
   
   [閉じる]
   ```

2. モーダルのアニメーション:
   - フェードイン（背景暗転）
   - スケールイン（カード拡大）
   - バウンス（絵文字🎉が跳ねる）

3. **5秒後に自動で閉じる**

4. コンソールログ:
   ```javascript
   ✓ Streak bonus awarded: 3 days = 10pt
   ```

5. ポイント残高が **+10pt** 増加している

#### **データベース確認**
```sql
-- ポイント履歴を確認
SELECT 
  user_id,
  amount,
  type,
  description,
  created_at
FROM point_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'rikki5.929@gmail.com')
ORDER BY created_at DESC
LIMIT 5;
```

期待される結果:
| amount | type | description |
|--------|------|-------------|
| 10 | streak_bonus | 継続3日達成ボーナス |

---

### **テスト2: 継続日数ボーナス（7日）**

#### **SQLで継続日数を設定**
```sql
-- テストユーザーの継続日数を7に設定
UPDATE users
SET current_streak = 7
WHERE email = 'rikki5.929@gmail.com';

-- 3日ボーナスのレコードを削除（再テスト用）
DELETE FROM point_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'rikki5.929@gmail.com')
  AND type = 'streak_bonus';
```

#### **テスト手順**
1. ログアウト
2. `Ctrl + Shift + R` でキャッシュクリア
3. 再ログイン

#### **期待される動作**
1. モーダル表示:
   ```
   🎉
   継続ボーナス獲得！
   
   7日 継続達成！
   
   +50pt
   ポイント残高に追加されました
   
   [閉じる]
   ```

2. ポイント残高が **+50pt** 増加

---

### **テスト3: 重複受け取り防止**

#### **テスト手順**
1. 上記テスト2を実行してボーナスを受け取る
2. **そのままログアウト**
3. **再度ログイン**

#### **期待される動作**
1. **モーダルが表示されない**
2. コンソールログ:
   ```javascript
   ✓ Streak 7 bonus already received
   ```

3. ポイント残高が変わらない

4. データベースに重複レコードが作成されない

---

### **テスト4: フレンド招待ボーナス**

#### **テスト手順**
1. **新しいメールアドレス**でテストアカウントを作成
2. 招待コード: `rikki5.929@gmail.com` のユーザーの招待コード
3. サインアップ

#### **期待される動作**
1. 登録完了後、ポイント残高が **550pt** になる:
   - 初回登録: 500pt
   - 招待ボーナス: 50pt

2. **招待者** (`rikki5.929@gmail.com`) のポイント残高も **+50pt** 増加

3. データベース確認:
```sql
-- 両ユーザーのポイント履歴を確認
SELECT 
  u.email,
  pt.amount,
  pt.type,
  pt.description,
  pt.created_at
FROM point_transactions pt
JOIN users u ON pt.user_id = u.id
WHERE pt.type = 'invitation_bonus'
ORDER BY pt.created_at DESC
LIMIT 2;
```

期待される結果:
| email | amount | type | description |
|-------|--------|------|-------------|
| test@example.com | 50 | invitation_bonus | フレンド招待ボーナス（被招待者） |
| rikki5.929@gmail.com | 50 | invitation_bonus | フレンド招待ボーナス（招待者） |

---

### **テスト5: 大きな継続日数（100日）**

#### **SQLで継続日数を設定**
```sql
-- テストユーザーの継続日数を100に設定
UPDATE users
SET current_streak = 100
WHERE email = 'rikki5.929@gmail.com';

-- 既存のボーナス記録を削除
DELETE FROM point_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'rikki5.929@gmail.com')
  AND type = 'streak_bonus';
```

#### **期待される動作**
1. モーダル表示:
   ```
   🎉
   継続ボーナス獲得！
   
   100日 継続達成！
   
   +500pt
   ポイント残高に追加されました
   
   [閉じる]
   ```

2. ポイント残高が **+500pt** 増加

---

## ✅ **テスト成功の判定基準**

### **継続日数ボーナス**
- ✅ ログイン時にモーダルが表示される
- ✅ モーダルに正しい日数とポイント数が表示される
- ✅ アニメーションが滑らかに動作する
- ✅ 5秒後に自動で閉じる
- ✅ ポイント残高が正しく増加する
- ✅ `point_transactions` に記録される
- ✅ 重複受け取りができない

### **フレンド招待ボーナス**
- ✅ 新規登録時に被招待者が50pt獲得
- ✅ 同時に招待者も50pt獲得
- ✅ 両方の履歴が `point_transactions` に記録される

---

## 🔧 **デバッグ方法**

### **モーダルが表示されない場合**
1. コンソールログを確認:
   ```javascript
   // ボーナス対象外
   (ログなし)
   
   // 既に受け取り済み
   ✓ Streak 7 bonus already received
   
   // エラー
   Error checking streak bonus: ...
   ```

2. データベースを確認:
   ```sql
   -- 継続日数を確認
   SELECT email, current_streak
   FROM users
   WHERE email = 'rikki5.929@gmail.com';
   
   -- 既存のボーナス記録を確認
   SELECT *
   FROM point_transactions
   WHERE user_id = (SELECT id FROM users WHERE email = 'rikki5.929@gmail.com')
     AND type = 'streak_bonus'
   ORDER BY created_at DESC;
   ```

### **ポイントが増加しない場合**
```sql
-- ポイント残高を確認
SELECT u.email, up.balance
FROM users u
JOIN user_points up ON u.id = up.user_id
WHERE u.email = 'rikki5.929@gmail.com';

-- increment_user_points 関数が存在するか確認
SELECT proname FROM pg_proc WHERE proname = 'increment_user_points';
```

---

## 📊 **統合テストシナリオ**

### **シナリオ: 新規ユーザーの30日間**

```sql
-- 新規ユーザーを作成（SQLではなく、実際に招待コードで登録）
-- 期待されるポイント推移:

初日（登録）:
  初回ボーナス: 500pt
  招待ボーナス: 50pt
  合計: 550pt

3日目（ログイン）:
  継続ボーナス: +10pt
  合計: 560pt

7日目（ログイン）:
  継続ボーナス: +50pt
  合計: 610pt
  本気の部屋解放！

7日目（挑戦開始）:
  Lv.1 デポジット: -25pt
  合計: 585pt

14日目（挑戦成功 & ログイン）:
  Lv.1 返還: +25pt
  継続ボーナス: +100pt
  合計: 710pt

30日目（ログイン）:
  継続ボーナス: +200pt
  合計: 910pt
```

---

## 🎉 **テスト完了後の報告**

### **成功した場合**
```
✅ v7.0.0 テスト完了！

1. 継続3日ボーナス: ✅ 10pt獲得、モーダル表示OK
2. 継続7日ボーナス: ✅ 50pt獲得、モーダル表示OK
3. 重複防止: ✅ 2回目はモーダル非表示
4. フレンド招待ボーナス: ✅ 招待者・被招待者に各50pt
5. ポイント履歴: ✅ すべて正しく記録
6. アニメーション: ✅ スムーズに動作

スクリーンショット: [添付]
```

### **問題があった場合**
```
❌ テスト失敗

問題の内容:
- モーダルが表示されない
- ポイントが増加しない

スクリーンショット: [添付]
コンソールログ: [添付]
SQL結果: [添付]
```

---

## 🚀 **次のステップ**

✅ すべてのテストが成功したら:
1. README.md の更新を確認
2. デプロイ実施
3. **App Store 公開準備**に進む

📱 **App Store 公開準備ガイド**: `APP_STORE_GUIDE.md`

---

## 📞 **サポート**

問題が発生した場合は、以下の情報を提供してください:
- コンソールログのスクリーンショット
- データベースクエリの結果
- 期待される動作と実際の動作の差異
