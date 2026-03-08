# Saikou! v6.0.1 テストガイド

## 🎯 今回の修正内容

### **修正された不具合**
✅ **進捗バー表示問題**を完全に解決しました。

**問題**:
- ホーム画面で「本日の挑戦を達成」ボタンをタップ後、本気の部屋タブを開いても進捗バーが 0% のまま
- 残り日数が1日少なく表示される（例: 7日間挑戦なのに「残り 5日」と表示）

**原因**:
- `commitChallengeDay()` 関数が本気の部屋画面が開いている場合のみデータ更新していた
- 残り日数の計算で今日を含めていなかった

**解決策**:
- `commitChallengeDay()` の最後で **常に** `loadCurrentChallenge()` を呼び出すように変更
- 残り日数計算を `Math.ceil((endDate - todayDate) / (1000 * 60 * 60 * 24)) + 1` に修正
- 進捗バーの計算を `challenge_daily_history` から直接カウント（整数%表示）

---

## 🚀 デプロイ手順

### **Step 1: Supabase で Publish**
1. Supabase ダッシュボードを開く
2. **Publish** タブをクリック
3. **Publish** ボタンをクリック
4. 「Deployment successful」が表示されるまで **30秒〜2分** 待つ

---

## 🧪 テスト手順（ユーザー実施）

### **Step 1: キャッシュクリア & 再ログイン**

1. **ブラウザで開く**:
   - URL: https://gegsmoop.gensparkspace.com/

2. **キャッシュをクリア**:
   - **Windows/Linux**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`

3. **Service Worker をアンインストール**:
   - **F12** でデベロッパーツールを開く
   - **Application** タブ → **Service Workers**
   - **Unregister** をクリック
   - ページをリロード

4. **再ログイン**:
   - ログアウト → `rikki5.929@gmail.com` でログイン

---

### **Step 2: ホーム画面でテスト**

#### **期待される表示**
```
🔥 本気の挑戦 [進行中]

👤 相棒: 大島隆季   🔥 継続 7日

レベル 1: 覚悟の芽生え
📅 残り: 7/7日   💰 デポジット: 50ポイント

進捗 1/7日 (14%)
▓▓░░░░░░░░░░░░ 14%

📅 7日間カレンダー
[✓][2][3][4][5][6][7]  ← 1日目に金色の✓

[🎯 本日の挑戦を達成]  ← このボタンをクリック
```

#### **ボタンをタップ後の動作**
1. ダイアログが表示される:
   ```
   本日の挑戦を達成しますか？
   
   この操作は取り消せません。
   [キャンセル] [OK]
   ```

2. **OK** をクリック

3. **成功メッセージ**:
   ```
   本日の挑戦を達成しました！🎉
   ```

4. **カードの表示が更新される**:
   - カレンダーの1日目に **金色の✓** が表示
   - 進捗バー: `1/7日 (14%)` → `2/7日 (29%)`（既に達成している場合）
   - ボタンが変化: `✓ 本日は達成済み`（灰色、非活性）

---

### **Step 3: 本気の部屋画面でテスト**

1. **本気の部屋タブ**をタップ

2. **期待される表示**:
   ```
   📅 挑戦カレンダー（1日目 / 7日間）
   [✓][2][3][4][5][6][7]  ← 1日目に金色の✓
   
   あなたの進捗
   ▓▓░░░░░░░░░░░░ 14%
   ✓ 達成: 1日   ✗ 失敗: 0/2日
   
   相棒の進捗
   ▓▓░░░░░░░░░░░░ 14%
   ✓ 達成: 1日   ✗ 失敗: 0/2日
   
   レベル 1
   覚悟の芽生え
   
   残り 7日  ← 正確に表示される
   
   💭 （宣言文が表示される）
   
   相棒: 大島隆季   🔥 継続 7日
   
   [✓ 本日は達成済み]  ← 灰色ボタン
   ```

3. **確認ポイント**:
   - ✅ 進捗バーが **14%** と表示される（0% ではない）
   - ✅ `✓ 達成: 1日` と表示される（0日 ではない）
   - ✅ カレンダーの1日目に **金色の✓** が表示される
   - ✅ 残り日数が **7日** と表示される（5日 ではない）
   - ✅ ボタンが「✓ 本日は達成済み」になっている

---

### **Step 4: 再度ボタンをタップ（重複防止テスト）**

1. ホーム画面または本気の部屋で **もう一度ボタンをタップ**

2. **期待される動作**:
   ```
   本日は既に達成済みです
   ```
   - このメッセージが表示される
   - データベースに重複レコードが作成されない

---

## ✅ テスト成功の判定基準

### **合格条件（すべて満たす必要あり）**
- ✅ ホーム画面で達成ボタンをタップ → 成功メッセージが表示
- ✅ カレンダーに金色の✓が表示される
- ✅ 進捗バーが整数%（14%, 29%, 43%...）で表示される
- ✅ 本気の部屋タブで進捗バーが **0% ではなく 14%** と表示される
- ✅ 残り日数が正しく表示される（例: 7日間挑戦なら「残り 7日」）
- ✅ `✓ 達成: 1日` と表示される（0日 ではない）
- ✅ 再度ボタンをタップ → 「本日は既に達成済みです」メッセージ

### **不合格条件（1つでも該当すれば NG）**
- ❌ 本気の部屋の進捗バーが 0% のまま
- ❌ 達成日数が 0日 のまま
- ❌ カレンダーに✓が表示されない
- ❌ 残り日数が1日少なく表示される
- ❌ エラーメッセージが表示される

---

## 🔧 デバッグ情報（エラーが発生した場合）

### **コンソールログの確認**
1. **F12** でデベロッパーツールを開く
2. **Console** タブを選択
3. 以下のログを確認:

#### **期待されるログ**
```javascript
💰 Loading points balance for user: <user-id>
Points query result: { data: { balance: 1975 }, error: null }
✓ Points balance loaded: 1975pt

// 達成ボタンをタップ後
✓ Challenge day committed: 1

// 本気の部屋を開いた後
🔥 Loading Serious Room...
✓ Points balance loaded: 1975pt
Current challenge: { id: "...", level: 1, ... }
✓ Serious Room loaded
```

#### **エラーが出る場合**
```javascript
// 400 Bad Request エラー
❌ Error: Could not find the 'is_success' column
→ データベーススキーマの不一致（修正済みのはず）

// 409 Conflict エラー
❌ Error: duplicate key value violates unique constraint
→ 重複防止機能が正常に動作している

// 403 Forbidden エラー
❌ Error: row-level security policy violation
→ RLS ポリシーの問題（修正済みのはず）
```

---

## 🎉 テスト完了後の報告

以下の情報を報告してください:

### **成功した場合**
```
✅ テスト完了！

1. ホーム画面での達成: ✅
2. カレンダー✓表示: ✅
3. 進捗バー14%表示: ✅
4. 本気の部屋での進捗確認: ✅
5. 残り日数正確: ✅
6. 重複防止: ✅

スクリーンショット: [添付]
```

### **問題があった場合**
```
❌ テスト失敗

問題の内容:
- 本気の部屋の進捗バーが 0% のまま

スクリーンショット: [添付]
コンソールログ: [添付]
```

---

## 📱 次のステップ（テスト完了後）

### **Option 1: 7日間達成テスト（強制完了）**
テストを加速したい場合、以下のSQLを実行して強制的に7日間達成状態にできます:

```sql
-- 7日間分のレコードを追加（テスト用）
DO $$
DECLARE
  challenge_rec RECORD;
  i INTEGER;
  test_date DATE;
BEGIN
  -- 進行中の挑戦を取得
  SELECT * INTO challenge_rec
  FROM serious_room_challenges
  WHERE status = 'in_progress'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No in_progress challenge found';
    RETURN;
  END IF;
  
  -- 7日間分のレコードを追加
  FOR i IN 1..7 LOOP
    test_date := challenge_rec.start_date::date + (i - 1);
    
    -- ユーザー分
    INSERT INTO challenge_daily_history (challenge_id, user_id, date, is_succeeded, created_at)
    VALUES (challenge_rec.id, challenge_rec.user_id, test_date, true, NOW())
    ON CONFLICT (challenge_id, user_id, date) DO NOTHING;
    
    -- 相棒分
    INSERT INTO challenge_daily_history (challenge_id, user_id, date, is_succeeded, created_at)
    VALUES (challenge_rec.id, challenge_rec.buddy_id, test_date, true, NOW())
    ON CONFLICT (challenge_id, user_id, date) DO NOTHING;
  END LOOP;
  
  -- user_succeeded_days と buddy_succeeded_days を更新
  UPDATE serious_room_challenges
  SET user_succeeded_days = 7,
      buddy_succeeded_days = 7,
      status = 'succeeded',
      succeeded_at = NOW()
  WHERE id = challenge_rec.id;
  
  RAISE NOTICE 'Challenge % marked as succeeded', challenge_rec.id;
END $$;

-- 確認
SELECT 
  c.id,
  c.level,
  c.user_succeeded_days,
  c.buddy_succeeded_days,
  c.challenge_days,
  c.status,
  c.deposit_points,
  u1.email AS user_email,
  u2.email AS buddy_email
FROM serious_room_challenges c
JOIN users u1 ON c.user_id = u1.id
JOIN users u2 ON c.buddy_id = u2.id
WHERE c.status = 'succeeded'
ORDER BY c.succeeded_at DESC
LIMIT 1;
```

実行後、ブラウザをリロードすると:
- ✅ 成功モーダルが表示される
- ✅ デポジット 25pt が返還される（残高 2,000pt に戻る）
- ✅ 称号「覚悟の芽生え」が付与される
- ✅ ホーム画面の挑戦カードが消える

### **Option 2: App Store 公開準備**
`APP_STORE_GUIDE.md` を参照してください。

---

## 📞 サポート情報

### **問題が解決しない場合**
1. **ブラウザのキャッシュを完全にクリア**:
   - Chrome: `chrome://settings/clearBrowserData`
   - すべてのデータをクリア

2. **シークレットモードで試す**:
   - 拡張機能の影響を排除

3. **別のブラウザで試す**:
   - Chrome → Safari → Firefox の順に試す

4. **Supabase のデータを確認**:
   ```sql
   -- ポイント残高確認
   SELECT u.email, up.balance
   FROM users u
   JOIN user_points up ON u.id = up.user_id
   WHERE u.email = 'rikki5.929@gmail.com';
   
   -- 挑戦状況確認
   SELECT * FROM serious_room_challenges
   WHERE status = 'in_progress'
   ORDER BY created_at DESC
   LIMIT 1;
   
   -- 達成履歴確認
   SELECT * FROM challenge_daily_history
   WHERE challenge_id = (
     SELECT id FROM serious_room_challenges
     WHERE status = 'in_progress'
     LIMIT 1
   )
   ORDER BY date;
   ```

---

## 🎯 最終チェックリスト

完璧なテストのために、すべての項目をチェックしてください:

- [ ] Supabase でデプロイ完了
- [ ] ブラウザキャッシュをクリア (Ctrl+Shift+R)
- [ ] Service Worker をアンインストール
- [ ] 再ログイン完了
- [ ] ホーム画面で達成ボタンをタップ
- [ ] 成功メッセージ確認
- [ ] カレンダー✓確認
- [ ] 進捗バー整数%確認
- [ ] 本気の部屋タブを開く
- [ ] 進捗バー14%確認（0% ではない）
- [ ] 残り日数確認（正確な数字）
- [ ] `✓ 達成: 1日` 確認（0日 ではない）
- [ ] 再度ボタンタップ → 「既に達成済み」メッセージ確認
- [ ] スクリーンショット撮影
- [ ] 結果報告

**すべてチェックが完了したら「テスト完了！」と報告してください。**
