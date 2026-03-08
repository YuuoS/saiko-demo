# Supabase UNIQUE制約の確認と修正

## 🔍 問題

`daily_status` テーブルの UNIQUE 制約が正しく設定されていない可能性があります。

---

## ✅ 確認方法

Supabase SQL Editorで以下を実行：

```sql
-- 既存の制約を確認
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'daily_status'::regclass;
```

**期待される結果**:
```
daily_status_user_id_date_key | u | UNIQUE (user_id, date)
```

---

## 🛠️ 修正SQL（制約が無い場合）

もし UNIQUE 制約が存在しない場合、以下を実行：

```sql
-- UNIQUE制約を追加
ALTER TABLE daily_status 
ADD CONSTRAINT daily_status_user_id_date_key 
UNIQUE (user_id, date);
```

---

## 🎯 現在の解決策

コードを修正して、upsertの代わりに以下のロジックを使用：

1. 既存レコードを検索
2. 存在する → UPDATE
3. 存在しない → INSERT

これで UNIQUE 制約の有無に関わらず動作します。

---

## ✅ 動作確認

1. Publishから再デプロイ
2. タスクにチェック
3. 「今日を確定」をクリック
4. コンソールにエラーが出ないことを確認
5. Supabaseの `daily_status` テーブルにレコードが作成されることを確認

---

これで確実に動作します！
