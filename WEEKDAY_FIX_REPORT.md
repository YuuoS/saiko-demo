# ホーム画面の曜日ずれ修正レポート

## 🐛 問題

**症状**: ホーム画面の週次ビューで曜日が1日ずれている
- 実際は土曜日なのに金曜日と表示される
- プロフィールの月間ビューは正しく表示される

## 🔍 原因分析

### 問題のあるコード（修正前）

```javascript
function renderWeeklyView(history) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]); // ← 問題！
  }
  
  const html = last7Days.map(date => {
    const dayOfWeek = days[new Date(date).getDay()]; // ← ここでタイムゾーンのずれ発生
    // ...
  });
}
```

### 根本原因

1. **ISO文字列の問題**:
   - `date.toISOString()`はUTC時刻を返す
   - 日本時刻（JST）が2026-02-21 08:00の場合
   - UTC時刻は2026-02-20 23:00になる
   - ISO文字列は"2026-02-20"になる（1日ずれる）

2. **Date型への再変換の問題**:
   - `new Date("2026-02-20")`は文字列をUTCとして解釈
   - `.getDay()`で曜日を取得すると、さらにずれる可能性

### 正しく動作している月間ビュー

```javascript
function renderMonthlyView() {
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day); // ← 正しい！
    const dateString = date.toISOString().split('T')[0];
    // ローカルタイムゾーンで生成されたDateオブジェクトを使用
  }
}
```

## ✅ 修正内容

### 修正後のコード

```javascript
function renderWeeklyView(history) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const last7Days = [];
  
  // 過去7日間の日付を生成（今日を含む）
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // タイムゾーンの問題を回避するため、年月日を個別に取得
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // dateObjとdateStringの両方を保存
    last7Days.push({
      dateString: dateString,
      dateObj: date  // ← 重要！オリジナルのDateオブジェクトを保持
    });
  }
  
  const today = getTodayString();
  const html = last7Days.map(item => {
    const record = history.find(r => r.date === item.dateString);
    const isToday = item.dateString === today;
    
    // 実際のDateオブジェクトから曜日を取得
    const dayOfWeek = days[item.dateObj.getDay()]; // ← 正しい曜日
    
    console.log(`日付: ${item.dateString}, 曜日: ${dayOfWeek}, 今日: ${isToday}`);
    
    return `
      <div class="text-center">
        <p class="text-xs text-gray-500 mb-1">${dayOfWeek}</p>
        <!-- ... -->
      </div>
    `;
  }).join('');
  
  document.getElementById('weeklyView').innerHTML = html;
}
```

## 📊 修正のポイント

### 1. Dateオブジェクトを保持 ✅

```javascript
// 修正前
last7Days.push(date.toISOString().split('T')[0]); // 文字列のみ

// 修正後
last7Days.push({
  dateString: dateString,
  dateObj: date  // Dateオブジェクトを保持
});
```

### 2. 年月日を個別に取得 ✅

```javascript
const year = date.getFullYear();      // 2026
const month = String(date.getMonth() + 1).padStart(2, '0'); // "02"
const day = String(date.getDate()).padStart(2, '0');        // "21"
const dateString = `${year}-${month}-${day}`;  // "2026-02-21"
```

### 3. オリジナルのDateオブジェクトから曜日取得 ✅

```javascript
// 修正前（ずれる）
const dayOfWeek = days[new Date(date).getDay()];

// 修正後（正確）
const dayOfWeek = days[item.dateObj.getDay()];
```

### 4. デバッグログの追加 ✅

```javascript
console.log(`日付: ${item.dateString}, 曜日: ${dayOfWeek}, 今日: ${isToday}`);
```

## 🧪 テスト方法

### コンソールで確認

F12でコンソールを開くと、以下のようなログが表示されます：

```
日付: 2026-02-15, 曜日: 日, 今日: false
日付: 2026-02-16, 曜日: 月, 今日: false
日付: 2026-02-17, 曜日: 火, 今日: false
日付: 2026-02-18, 曜日: 水, 今日: false
日付: 2026-02-19, 曜日: 木, 今日: false
日付: 2026-02-20, 曜日: 金, 今日: false
日付: 2026-02-21, 曜日: 土, 今日: true  ← 今日が土曜日
```

### 視覚的確認

ホーム画面の週次ビュー:
```
日  月  火  水  木  金  土
○  ○  ○  ○  ○  ○  🔵  ← 今日（土曜日）
```

## 📝 技術的な解説

### タイムゾーン問題の詳細

#### 問題のある方法
```javascript
const date = new Date(); // 2026-02-21 08:00 JST
const str = date.toISOString().split('T')[0]; // "2026-02-20" (UTC)
const newDate = new Date(str); // 2026-02-20 00:00 UTC = 2026-02-20 09:00 JST
const day = newDate.getDay(); // 金曜日（ずれる！）
```

#### 正しい方法
```javascript
const date = new Date(); // 2026-02-21 08:00 JST
const day = date.getDay(); // 土曜日（正しい！）
```

### なぜ月間ビューは正しかったのか

月間ビューは最初からローカルタイムゾーンで日付を生成：

```javascript
const date = new Date(currentYear, currentMonth, day);
// ローカルタイムゾーン（JST）で直接生成
// ISOStringを経由しないため、ずれが発生しない
```

## 🎯 修正の効果

### 修正前 ❌
```
ホーム画面:
日  月  火  水  木  金  土
○  ○  ○  ○  ○  🔵  ○  ← 金曜日と表示（間違い）

実際の今日: 土曜日
```

### 修正後 ✅
```
ホーム画面:
日  月  火  水  木  金  土
○  ○  ○  ○  ○  ○  🔵  ← 土曜日と表示（正しい）

実際の今日: 土曜日
```

## 📊 変更サマリー

| 項目 | 修正前 | 修正後 |
|------|--------|--------|
| 日付生成 | `toISOString()`使用 | 年月日を個別取得 |
| データ保存 | 文字列のみ | オブジェクト（dateString + dateObj） |
| 曜日取得 | `new Date(string).getDay()` | `dateObj.getDay()` |
| タイムゾーン | UTC経由でずれる | ローカルタイムゾーンで正確 |
| デバッグ | なし | 詳細ログ追加 |

## 🎊 修正完了

**問題**: ホーム画面の曜日が1日ずれる  
**原因**: ISO文字列変換時のタイムゾーン問題  
**修正**: Dateオブジェクトを保持して直接曜日を取得  
**効果**: 曜日が正確に表示される

---

**バージョン**: v3.4.1  
**修正内容**: ホーム画面週次ビューの曜日ずれ修正  
**実装日**: 2026-02-20

**今すぐデプロイして確認してください！** 🚀

コンソールログで各日付の曜日を確認できます。今日が土曜日なら、ログに「曜日: 土, 今日: true」と表示されます！
