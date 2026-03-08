# リリースノート v5.2.0

**リリース日**: 2026-02-22  
**バージョン**: 5.2.0  
**種別**: メジャーアップデート

## 🎯 今回のアップデートの概要

v5.2.0では、**iPhone（Safari）でのプロフィール画像アップロード対応**、**デザインの高級感向上**、**目標設定機能の追加**、**Google OAuth ログイン実装**、**Apple ログイン機能の削除**を行いました。これにより、iOS ユーザーも快適にプロフィール画像をアップロードでき、フレンドとの目標共有機能でモチベーションを高め合うことができるようになりました。

---

## ✨ 新機能

### 1. **プロフィール画像機能の完全対応**
- ✅ **iPhone（Safari）でのプロフィール画像アップロード対応**
  - iOS Safari での HEIC/HEIF 形式の画像処理に完全対応
  - 画像を正方形に自動クロップ（Canvas API使用）
  - 高品質JPEG変換（品質92%）で美しい画像を保存
  - 最大ファイルサイズ: 5MB
  - `capture` 属性削除でギャラリーから自由に選択可能

- ✅ **プロフィール画像の完全表示**
  - 自分のプロフィール画像を全画面（ホーム、フレンド、招待、設定）で表示
  - フレンドのプロフィール画像をフレンド詳細画面に表示
  - 設定画面のプロフィールボタンにも反映

### 2. **デザインの高級感向上**
- ✅ **カラーパレットの刷新**
  - ダークブラウン系統の高級感あるトーン
  - カフェ風の落ち着いた配色
  - 主要カラー:
    - `#2d2420` (ダークブラウン) - メインカラー
    - `#8b7355` (アクセント) - アクセントカラー
    - `#c9a961` (ゴールド) - ハイライト
    - `#7a9d7e` (グリーン) - 成功・完了
    - `#d4cfc7` (ベージュ) - 背景・カード

- ✅ **UI要素の改善**
  - カードの影を柔らかくして高級感アップ（`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`）
  - ホバーエフェクトの追加（`hover:shadow-lg`）
  - ボタンのグラデーション効果（`linear-gradient(135deg, #2d2420, #3d3430)`）
  - フォントの最適化（DM Sans + Noto Sans JP）
  - レスポンシブデザインの改善

### 3. **目標設定機能**
- ✅ **短期目標と長期目標の設定**
  - プロフィール画面から「目標を編集」ボタンで編集モーダル表示
  - 短期目標・長期目標を各200文字まで入力可能
  - 文字数カウンター表示（例: 50/200文字）
  - 保存・キャンセルボタン

- ✅ **フレンドとの目標共有**
  - フレンド詳細画面で相手の短期目標・長期目標を閲覧可能
  - 未設定時は非表示（設定済みの目標のみ表示）
  - お互いの目標を確認してモチベーション向上

- ✅ **データベース対応**
  - `users` テーブルに `short_term_goal`, `long_term_goal` カラム追加（TEXT型）
  - マイグレーションSQL: `database_goals.sql`

### 4. **Google OAuth ログイン実装**
- ✅ **Google アカウントでログイン**
  - Supabase OAuth 統合完了
  - Google Cloud Console でのクライアントID設定完了
  - セキュアな OAuth 2.0 フロー
  - 新規登録・ログインの両方に対応
  - 登録時は招待コード不要（Google アカウントで自動登録）

### 5. **Apple ログイン機能削除**
- ✅ **シンプルな認証フローへの統一**
  - Apple Developer Program が不要になり、開発コスト削減
  - 認証方法: メール/パスワード + Google OAuth のみ
  - HTML とイベントリスナーから完全削除

---

## 🔧 技術的な改善

### プロフィール画像アップロード
```javascript
// iOS Safari での HEIC/HEIF 形式の自動変換
const isHEIC = fileType.includes('heic') || fileType.includes('heif');
const outputType = isHEIC ? 'image/jpeg' : (file.type || 'image/jpeg');
const quality = 0.92; // 高品質JPEG（0.0～1.0）

canvas.toBlob((blob) => {
  if (blob) {
    resolve(blob);
  } else {
    reject(new Error('画像の処理に失敗しました'));
  }
}, outputType, quality);
```

### 目標設定機能
```javascript
// 短期目標・長期目標の編集
async function editGoals() {
  // モーダル表示、文字数カウンター更新
  document.getElementById('goalEditModal').classList.remove('hidden');
  updateCharCount('shortTermGoalInput', 'shortTermCharCount');
  updateCharCount('longTermGoalInput', 'longTermCharCount');
}

// Supabase に保存
await supabase
  .from('users')
  .update({
    short_term_goal: shortTermGoal,
    long_term_goal: longTermGoal
  })
  .eq('id', currentUser.id);
```

### デザイン改善
```css
:root {
  --cafe-dark-brown: #2d2420;
  --cafe-brown: #8b7355;
  --cafe-beige: #d4cfc7;
  --cafe-gold: #c9a961;
  --cafe-green: #7a9d7e;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
```

---

## 📝 データベースマイグレーション

### 必須マイグレーション: `database_goals.sql`

Supabase SQL Editor で以下のSQLを実行してください：
```sql
-- 短期目標・長期目標カラムの追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS short_term_goal TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS long_term_goal TEXT;

-- 既存ユーザーのデフォルト値（任意）
UPDATE users SET short_term_goal = '' WHERE short_term_goal IS NULL;
UPDATE users SET long_term_goal = '' WHERE long_term_goal IS NULL;
```

**実行手順**:
1. Supabase ダッシュボード: https://supabase.com/dashboard/project/mthfqqqukuvueprdokiq/sql
2. 上記SQLをコピー＆ペースト
3. 「RUN」をクリック
4. 成功メッセージ確認

---

## 🔒 セキュリティ

### XSS対策の継続
```javascript
// HTML エスケープ関数（v5.1.0から継続）
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// プロフィール画像、表示名、目標のエスケープ
const safeAvatarUrl = escapeHtml(friend.avatar_url || '');
const safeName = escapeHtml(friend.display_name || 'Unknown');
const safeShortGoal = escapeHtml(shortTermGoal);
```

### OAuth セキュリティ
- Google OAuth 2.0 による安全な認証
- Supabase の RLS（Row Level Security）で個人データ保護
- リダイレクトURI の厳格な検証

---

## 🧪 テスト手順

### 1. プロフィール画像アップロード（iPhone Safari）
1. iPhone（Safari）で https://gegsmoop.gensparkspace.com/ にアクセス
2. ログイン後、プロフィールボタンをタップ
3. プロフィール画像の📷ボタンをタップ
4. 「写真ライブラリから選択」をタップ
5. 任意の写真を選択
6. 画像が正方形にクロップされ、アップロードされることを確認
7. プロフィール画面、ホーム画面、フレンド画面で画像が表示されることを確認

### 2. 目標設定機能
1. プロフィールボタンをタップ
2. 「目標を編集」ボタンをタップ
3. 短期目標に「3ヶ月で10kg痩せる」と入力
4. 長期目標に「マラソン完走」と入力
5. 文字数カウンターが更新されることを確認
6. 「保存」ボタンをタップ
7. プロフィール画面に目標が表示されることを確認
8. フレンド詳細画面でフレンドの目標が表示されることを確認

### 3. Google ログイン
1. ログアウト状態で https://gegsmoop.gensparkspace.com/ にアクセス
2. 「Googleで登録」または「Googleでログイン」ボタンをタップ
3. Google アカウント選択画面が表示されることを確認
4. アカウントを選択して許可
5. 自動的にアプリにログインすることを確認

### 4. デザイン確認
1. 全画面でダークブラウン系の高級感あるデザインを確認
2. カードのホバーエフェクトを確認
3. ボタンのグラデーション効果を確認
4. フォントの美しさを確認

---

## 🐛 バグ修正

- ✅ プロフィール画像が設定画面のボタンに表示されない問題を修正
- ✅ フレンド詳細画面でフレンドのプロフィール画像が表示されない問題を修正
- ✅ iOS Safari での画像アップロードが失敗する問題を修正（HEIC/HEIF 対応）
- ✅ `capture` 属性によりギャラリーから選択できない問題を修正

---

## 📦 変更されたファイル

| ファイル | 変更内容 | 行数 |
|---------|---------|------|
| `index.html` | プロフィール画像対応、目標設定、デザイン改善、Apple削除 | +250 |
| `database_goals.sql` | 新規作成（目標カラム追加） | +8 |
| `README.md` | v5.2.0 情報追加 | +80 |
| `RELEASE_NOTES_v5.2.0.md` | 新規作成 | - |

---

## 📚 関連ドキュメント

- [README.md](README.md) - プロジェクト全体の概要
- [database_goals.sql](database_goals.sql) - 目標設定DBマイグレーション
- [RELEASE_NOTES_v5.1.0.md](RELEASE_NOTES_v5.1.0.md) - 前バージョンのリリースノート
- [docs/rls-setup.md](docs/rls-setup.md) - Supabase RLS設定ガイド
- [docs/password-policy.md](docs/password-policy.md) - パスワードポリシー

---

## 🚀 次のステップ（v6.0.0予定）

1. **プッシュ通知機能**
   - フレンドがタスクを完了したときの通知
   - 毎日のリマインダー通知
   - Service Worker Push API 実装

2. **統計ダッシュボード**
   - 月間・年間の達成率グラフ
   - 継続日数の推移グラフ
   - フレンドとの比較グラフ

3. **テーマカスタマイズ**
   - ダーク/ライトモード切り替え
   - カスタムカラーテーマ
   - アクセシビリティ向上

4. **バッジシステム**
   - 達成バッジの獲得
   - レアバッジのコレクション
   - フレンドとのバッジ共有

---

## 💡 既知の制限事項

1. **HEIC/HEIF 画像**
   - iOS Safari では自動的に JPEG に変換されます
   - 変換により若干の品質低下がある場合があります

2. **画像サイズ**
   - 最大 5MB まで
   - 推奨サイズ: 500x500px 以上

3. **目標の文字数**
   - 短期目標・長期目標: 各200文字まで
   - 絵文字も1文字としてカウント

4. **Google ログイン**
   - Supabase ダッシュボードで Google OAuth を有効化する必要があります
   - Google Cloud Console でクライアントID設定が必要

---

## 🙏 謝辞

このバージョンでは、**iPhone（Safari）でのプロフィール画像アップロード対応**、**デザインの高級感向上**、**目標設定機能の追加**、**Google OAuth ログイン実装**が完了しました。ユーザーの皆様からのフィードバックに感謝いたします。

---

**開発者**: Saikou! Development Team  
**リリース日**: 2026-02-22  
**バージョン**: 5.2.0  
**ライセンス**: Proprietary
