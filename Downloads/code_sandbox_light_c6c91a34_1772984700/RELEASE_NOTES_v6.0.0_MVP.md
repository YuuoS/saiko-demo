# リリースノート v6.0.0 MVP - 本気の部屋

**リリース日**: 2026-02-22  
**バージョン**: 6.0.0 MVP  
**種別**: メジャーアップデート（新機能追加）

---

## 🎯 今回のアップデートの概要

v6.0.0では、**「本気の部屋」機能**を実装しました。これは、フレンドと共にデポジットを預けて挑戦する、覚悟を買うシステムです。MVP版（最小実装版）として、Lv.1〜10、架空ポイント制で実装しました。

---

## ✨ 新機能

### 1. **本気の部屋（Serious Room）**

#### 1.1 解放条件
- ✅ **継続7日以上で解放**
  - 継続7日未満のユーザーには🔒ロック画面を表示
  - 「現在の継続日数: X日」「あとY日で解放！」を表示
  - 継続日数はホーム画面の継続日数と連動

#### 1.2 レベルシステム（Lv.1〜10）

| レベル | 挑戦日数 | 条件 | デポジット | 称号 | 難易度 |
|--------|----------|------|-----------|------|--------|
| Lv.1 | 7日 | 連続7日達成 | 50ポイント | 覚悟の芽生え | ★☆☆☆☆ |
| Lv.2 | 10日 | 連続10日達成 | 60ポイント | 継続の証 | ★☆☆☆☆ |
| Lv.3 | 14日 | 連続14日達成 | 80ポイント | 二週間の勇者 | ★★☆☆☆ |
| Lv.4 | 21日 | 連続21日達成 | 100ポイント | 習慣の守護者 | ★★☆☆☆ |
| Lv.5 | 30日 | 連続30日達成 | 150ポイント | 一ヶ月の覇者 | ★★★☆☆ |
| Lv.6 | 40日 | 36日以上達成 | 200ポイント | 不屈の挑戦者 | ★★★☆☆ |
| Lv.7 | 50日 | 45日以上達成 | 250ポイント | 五十日の鉄人 | ★★★☆☆ |
| Lv.8 | 60日 | 54日以上達成 | 300ポイント | 二ヶ月の猛者 | ★★★☆☆ |
| Lv.9 | 75日 | 68日以上達成 | 400ポイント | 不動の意志 | ★★★★☆ |
| Lv.10 | 90日 | 81日以上達成 | 500ポイント | 三ヶ月の支配者 | ★★★★☆ |

- **レベルは順番にしか進めない**（Lv.1クリア後にLv.2が解放）
- **Lv.1〜5**: 連続達成必須（許容失敗日0日）
- **Lv.6〜10**: 許容失敗日あり（挑戦日数の10%）

#### 1.3 ポイントシステム（MVP版: 架空ポイント）

- ✅ **初期ポイント: 500ポイント**
  - 1ポイント = ¥10相当（¥5,000相当）
  - 新規ユーザーには自動付与
  - 既存ユーザーにも自動付与（トリガー機能）

- ✅ **デポジット**
  - 本人と相棒で割り勘（50%ずつ）
  - 例: Lv.1（50ポイント）→ 本人25ポイント、相棒25ポイント

- ✅ **成功時**
  - デポジット全額返還
  - 称号を獲得
  - 次のレベルが解放

- ✅ **失敗時（将来実装）**
  - デポジットは没収
  - 再挑戦クレジットとして付与（同額）
  - 再挑戦時にクレジットを使用可能

#### 1.4 挑戦フロー

**Step 1: レベル選択**
- 解放されているレベルから選択
- レベルカードに挑戦日数、条件、デポジット額、称号を表示
- 完了済みレベルには✓マーク
- ロック中レベルには🔒マーク

**Step 2: 相棒選択**
- フレンドリスト（承認済みフレンドのみ）から選択
- フレンドのアバターと名前を表示
- フレンドがいない場合は「まずはフレンドを追加しましょう」

**Step 3: 宣言入力**
- 何を達成するかを宣言（10〜200文字）
- 文字数カウンター表示
- 宣言の例を表示
  - 毎日30分のランニング
  - 毎朝6時に起床
  - 毎日1時間の読書
  - 毎日の英語学習30分

**Step 4: 挑戦リクエスト送信（MVP版）**
- 相棒に挑戦リクエストを送信
- 48時間以内に承認が必要
- MVP版では自動承認（相棒承認機能は次回実装）

**Step 5: 挑戦開始（将来実装）**
- 相棒が承認すると挑戦開始
- デポジットをポイント残高から差し引く
- 毎日の達成状況を記録

**Step 6: 進行中表示（MVP版）**
- 自分と相棒の進捗を表示
- プログレスバーで可視化
- 達成日数/挑戦日数、失敗日数/許容失敗日数
- デポジット額を強調表示（「失敗するとこのポイントを失います」）

**Step 7: 成功 or 失敗（将来実装）**
- 成功: 称号付与、デポジット返還、次レベル解放
- 失敗: デポジット没収、再挑戦クレジット付与

#### 1.5 相棒システム

- ✅ **フレンドを相棒として選択**
  - 承認済みフレンドのみ選択可能
  - フレンドリストから選択

- ✅ **相棒の承認（将来実装）**
  - 48時間以内に承認必要
  - 承認されない場合: 自動キャンセル、デポジット返還

- ✅ **相棒の進捗を可視化**
  - 自分と相棒の進捗をリアルタイム表示
  - プログレスバーで可視化

---

## 🔧 技術的な変更

### データベーステーブル追加

```sql
-- 1. 挑戦テーブル
CREATE TABLE serious_room_challenges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  buddy_id UUID REFERENCES users(id),
  level INTEGER,
  challenge_days INTEGER,
  allowed_fail_days INTEGER,
  deposit_points INTEGER,
  user_share_points INTEGER,
  buddy_share_points INTEGER,
  declaration TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT, -- pending, in_progress, succeeded, failed, cancelled, buddy_dropped
  ...
);

-- 2. 挑戦リクエストテーブル
CREATE TABLE challenge_requests (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES users(id),
  buddy_id UUID REFERENCES users(id),
  level INTEGER,
  deposit_points INTEGER,
  user_share_points INTEGER,
  declaration TEXT,
  status TEXT, -- pending, approved, rejected, expired, cancelled
  expires_at TIMESTAMP,
  ...
);

-- 3. 称号テーブル
CREATE TABLE titles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  level INTEGER,
  title TEXT,
  challenge_id UUID REFERENCES serious_room_challenges(id),
  earned_at TIMESTAMP
);

-- 4. ポイント残高テーブル
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  balance INTEGER DEFAULT 500, -- 初期値500ポイント
  ...
);

-- 5. ポイント履歴テーブル
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  challenge_id UUID REFERENCES serious_room_challenges(id),
  amount INTEGER,
  type TEXT, -- deposit, refund, earn, spend
  description TEXT,
  ...
);

-- 6. 挑戦日次履歴テーブル
CREATE TABLE challenge_daily_history (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES serious_room_challenges(id),
  user_id UUID REFERENCES users(id),
  date DATE,
  is_succeeded BOOLEAN,
  committed_at TIMESTAMP,
  ...
);
```

### JavaScript 関数追加

```javascript
// 本気の部屋のメイン関数
async function loadSeriousRoom()

// ポイント残高を取得
async function loadPointsBalance()

// 現在の挑戦を取得
async function loadCurrentChallenge()

// レベル選択リストを表示
async function renderLevelList()

// レベルを選択
function selectLevel(levelNum)

// 相棒選択モーダルを開く
async function openBuddySelectModal()

// 相棒を選択
function selectBuddy(buddy)

// 宣言入力モーダルを開く
function openDeclarationModal()

// 挑戦を開始
async function startChallenge()

// 挑戦中の表示
async function renderCurrentChallenge()
```

### UI追加

- ✅ 下タブに「本気の部屋」ボタン追加
- ✅ 本気の部屋画面（`seriousRoomScreen`）
- ✅ ポイント残高表示
- ✅ ロック画面（継続7日未満）
- ✅ レベル選択リスト
- ✅ 挑戦中表示
- ✅ 相棒選択モーダル（`buddySelectModal`）
- ✅ 宣言入力モーダル（`declarationModal`）
- ✅ 成功モーダル（`successModal`）（将来実装）
- ✅ 失敗モーダル（`failureModal`）（将来実装）

---

## 📦 変更されたファイル

| ファイル | 変更内容 | 行数 |
|---------|---------|------|
| `index.html` | 本気の部屋UI + JavaScript関数追加 | +600行 |
| `database_serious_room.sql` | 新規作成（DBテーブル作成） | +180行 |
| `README.md` | v6.0.0情報追加 | +50行 |
| `SERIOUS_ROOM_DEPLOY_GUIDE.md` | 新規作成（デプロイガイド） | +300行 |
| `RELEASE_NOTES_v6.0.0_MVP.md` | 新規作成（このファイル） | - |

**合計**: +1,130行追加

---

## 🧪 テスト手順

### 1. データベースマイグレーション

1. Supabase SQL Editor を開く
2. `database_serious_room.sql` を実行
3. 成功メッセージを確認
4. `user_points` テーブルに初期ポイント500が付与されているか確認

### 2. 解放条件の確認

**継続7日未満のユーザー**
1. 本気の部屋タブをタップ
2. 🔒ロック画面が表示される
3. 「現在の継続日数: X日」「あとY日で解放！」が表示される

**継続7日以上のユーザー**
1. 本気の部屋タブをタップ
2. レベル選択画面が表示される
3. ポイント残高「500」が表示される

### 3. レベル選択

1. Lv.1カードをクリック
2. 相棒選択モーダルが開く
3. フレンドリストが表示される

### 4. 相棒選択

1. フレンドをクリック
2. 宣言入力モーダルが開く
3. レベル情報と相棒名が表示される

### 5. 宣言入力

1. 宣言を入力（例: 「毎日30分のランニング」）
2. 文字数カウンター「X/200文字」が更新される
3. 「宣言して開始」ボタンをクリック
4. 「相棒に挑戦リクエストを送信しました！」アラートが表示

### 6. ポイント残高の確認

1. Supabase Table Editor で `user_points` テーブルを確認
2. `balance` が `500` であること

---

## 🐛 既知の問題

### MVP版の制限事項

1. **相棒承認機能は未実装**
   - 現在は挑戦リクエストを送信するのみ
   - 相棒が承認する機能は次回実装

2. **挑戦進行管理は未実装**
   - 毎日の達成状況の自動記録は未実装
   - 進行中表示は静的データのみ

3. **成功/失敗判定は未実装**
   - 成功/失敗の自動判定は未実装
   - 成功/失敗モーダルは表示されない

4. **ポイントは架空**
   - リアルマネーではなく架空ポイント制
   - 決済システムは未実装

---

## 🚀 次のステップ（Phase 2）

### 相棒承認機能（v6.1.0）
- 相棒が挑戦リクエストを承認する機能
- 承認待ちリストの表示
- 48時間以内の承認期限
- 期限切れ時の自動キャンセル

### 挑戦進行管理（v6.2.0）
- 毎日の達成状況を自動記録
- `challenge_daily_history` テーブルへの保存
- 日次バッチ処理

### 成功/失敗判定（v6.3.0）
- 成功/失敗の自動判定
- 称号付与
- ポイント返還/没収
- 再挑戦クレジット付与
- 成功/失敗モーダルの表示

### Lv.11〜30の追加（v7.0.0）
- より長期の挑戦レベル
- 高額デポジット
- プラチナ称号、レインボー称号

### リアルマネー決済（v8.0.0）
- Stripe等の決済システム連携
- リアルマネーのデポジット
- 資金決済法への対応

---

## 📚 関連ドキュメント

- [README.md](README.md) - プロジェクト全体の概要
- [database_serious_room.sql](database_serious_room.sql) - データベースマイグレーションSQL
- [SERIOUS_ROOM_DEPLOY_GUIDE.md](SERIOUS_ROOM_DEPLOY_GUIDE.md) - デプロイガイド
- [SERIOUS_ROOM_DESIGN.md](SERIOUS_ROOM_DESIGN.md) - 完全設計書（将来実装含む）

---

## 🙏 謝辞

このバージョンでは、**「本気の部屋」機能の基盤**を実装しました。MVP版として、最小限の機能で動作確認を行い、次のフェーズで段階的に機能を追加していきます。

---

**開発者**: Saikou! Development Team  
**リリース日**: 2026-02-22  
**バージョン**: 6.0.0 MVP  
**ライセンス**: Proprietary
