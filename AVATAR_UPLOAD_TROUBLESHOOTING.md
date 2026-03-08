# iPhone 写真アップロード トラブルシューティングガイド

## 🔍 問題の診断

### **現在の状況**
- ✅ 画像選択: 成功（ファイル選択ダイアログが表示される）
- ❌ アップロード: 失敗

---

## 📋 **診断手順**

### **Step 1: エラーメッセージを確認**

1. iPhone Safari で https://gegsmoop.gensparkspace.com/ を開く
2. **F12ではなく**、画面を長押し → 「要素を調査」でDevToolsを開く
   - または、Mac で Safari → 開発 → iPhone → Console
3. プロフィール画面 → 📷 ボタンタップ → 画像選択
4. Console タブでエラーメッセージを確認

#### **予想されるエラーパターン**

##### **パターン A: Bucket not found**
```
❌ Upload error: {message: "Bucket not found"}
```
**原因**: Supabase Storage に `avatars` バケットが存在しない

**解決方法**:
1. Supabase Dashboard を開く
2. Storage → New Bucket
3. 設定:
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
4. Create Bucket

---

##### **パターン B: Permission denied**
```
❌ Upload error: {message: "new row violates row-level security policy"}
```
**原因**: RLS（Row Level Security）ポリシーが設定されていない

**解決方法**:
1. Supabase SQL Editor で `supabase_storage_avatars_setup.sql` を実行
2. 特に Step 3 の RLS ポリシー作成部分を実行

---

##### **パターン C: Invalid file type**
```
❌ Upload error: {message: "invalid mime type"}
```
**原因**: アップロードしようとしているファイル形式が許可されていない

**解決方法**:
1. Supabase Dashboard → Storage → avatars バケット
2. Settings → Allowed MIME types に追加:
   - `image/jpeg`
   - `image/jpg`
   - `image/png`
   - `image/webp`
   - `image/heic`
   - `image/heif`

---

##### **パターン D: File size limit**
```
❌ Upload error: {message: "file size limit exceeded"}
```
**原因**: ファイルサイズが5MBを超えている

**解決方法**:
1. より小さい画像を選択する
2. または、Supabase Dashboard でサイズ制限を増やす

---

### **Step 2: Supabase Storage の確認**

#### **SQL で確認**
```sql
-- Supabase SQL Editor で実行

-- 1. avatars バケットが存在するか確認
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- 期待される結果:
-- id | name    | public | file_size_limit | allowed_mime_types
-- XX | avatars | true   | 5242880         | [...]

-- 結果が空 = バケットが存在しない → Dashboard で作成
```

```sql
-- 2. RLS ポリシーが設定されているか確認
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%avatars%';

-- 期待される結果: 4つのポリシー
-- avatars_upload_policy (INSERT)
-- avatars_public_read_policy (SELECT)
-- avatars_update_policy (UPDATE)
-- avatars_delete_policy (DELETE)

-- 結果が少ない = ポリシー不足 → SQL で作成
```

---

### **Step 3: 詳細ログの確認**

#### **新しいエラーハンドリング（v8.0.2）**

修正後のコードは以下の詳細ログを出力します:

```javascript
// Console に表示される情報
📷 Starting upload process...
File: IMG_1234.jpg Type: image/jpeg Size: 2456789
📷 Cropping image...
✓ Image cropped, blob size: 1234567
📷 Uploading to: avatars/360f2120-..._1234567890.jpg
❌ Upload error: {...}
Error details: {...}
```

#### **ログから問題を特定**

1. **"Cropping image..." で止まる**
   → 画像処理に失敗
   → ファイル形式が対応していない可能性

2. **"Uploading to: ..." の後にエラー**
   → Storage の問題
   → Bucket または RLS ポリシーを確認

3. **"Image uploaded" の後にエラー**
   → Database 更新の問題
   → `users` テーブルの権限を確認

---

## 🔧 **完全な修正手順**

### **方法 A: Supabase Dashboard で設定（推奨）**

#### 1. Storage Bucket 作成
```
Supabase Dashboard → Storage → New Bucket

Name: avatars
Public: ✅ Yes (重要！)
File size limit: 5242880 (5MB)
Allowed MIME types:
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp
  - image/heic
  - image/heif

→ Create Bucket
```

#### 2. RLS ポリシー設定
```
Supabase Dashboard → Storage → avatars → Policies

以下の4つのポリシーを作成:

Policy 1: Upload (INSERT)
  Name: avatars_upload_policy
  Target roles: authenticated
  USING expression: (empty)
  WITH CHECK expression:
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]

Policy 2: Read (SELECT)
  Name: avatars_public_read_policy
  Target roles: public
  USING expression:
    bucket_id = 'avatars'

Policy 3: Update (UPDATE)
  Name: avatars_update_policy
  Target roles: authenticated
  USING expression:
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  WITH CHECK expression:
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]

Policy 4: Delete (DELETE)
  Name: avatars_delete_policy
  Target roles: authenticated
  USING expression:
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
```

---

### **方法 B: SQL で設定（高度）**

```sql
-- Supabase SQL Editor で実行
-- supabase_storage_avatars_setup.sql の内容を実行
```

---

## ✅ **テスト手順**

### **完全なテストフロー**

1. **Bucket 確認**
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'avatars';
   -- 結果が返ってくることを確認
   ```

2. **ポリシー確認**
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'objects' AND policyname LIKE '%avatars%';
   -- 4つのポリシーが返ってくることを確認
   ```

3. **アプリでテスト**
   - iPhone Safari で https://gegsmoop.gensparkspace.com/ を開く
   - キャッシュクリア（Cmd + Shift + R）
   - ログイン
   - プロフィール → 📷 ボタン
   - 画像選択 → アップロード

4. **成功確認**
   ```
   ✅ Console: "✓ Image uploaded: avatars/..."
   ✅ Console: "✓ Public URL: https://..."
   ✅ Console: "✓ Avatar URL saved to database"
   ✅ Alert: "プロフィール画像を変更しました！"
   ✅ UI: プロフィール画像が表示される
   ```

---

## 📝 **報告テンプレート**

### **失敗時**
```
❌ 写真アップロード失敗

【エラーメッセージ】
（Consoleに表示されたエラーをコピペ）

【Bucket確認結果】
SELECT * FROM storage.buckets WHERE name = 'avatars';
（結果をコピペ）

【ポリシー確認結果】
SELECT policyname FROM pg_policies ...
（結果をコピペ）

【ファイル情報】
ファイル名: IMG_1234.jpg
サイズ: 2.5MB
形式: JPEG

【ブラウザ】
iPhone Safari 17.2
```

### **成功時**
```
✅ 写真アップロード成功！

【確認項目】
✅ Bucket作成完了
✅ RLSポリシー設定完了
✅ アップロード成功
✅ 画像表示確認

すべて完了しました！
```

---

## 🚀 **次のステップ**

1. **まず Bucket を確認**
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'avatars';
   ```

2. **存在しなければ作成**
   - Dashboard → Storage → New Bucket

3. **RLS ポリシーを確認・作成**
   - `supabase_storage_avatars_setup.sql` を実行

4. **アプリで再テスト**
   - 詳細なエラーログを確認

5. **結果を報告**
   - 成功 or エラーメッセージ

---

© 2026 Saikou Team. All rights reserved.
