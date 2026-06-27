# ⚔️ Monster Merge Quest

> ダーク・ファンタジーの世界でモンスターを合体・進化させる落下パズルゲーム  
> スマホアプリ（PWA）としてホーム画面に追加して遊べます

---

## 🎮 ゲームの遊び方

- 画面を**押したまま**左右に動かして落とす位置を決める
- **指を離した瞬間**にモンスターが落下
- **同じモンスター同士が触れると合体して進化！**
- 上限ライン（☠ DANGER）を超えるとゲームオーバー
- より強いモンスターへの進化を目指してスコアを稼ごう

---

## 👾 モンスター進化ライン（10段階）

| 段階 | モンスター | 特徴 |
|:----:|-----------|------|
| 1 | スライム | 最弱。でも大量に現れる |
| 2 | コウモリ | 素早く動き回る |
| 3 | ゴブリン | 小賢しい魔物 |
| 4 | スケルトン | 不死の戦士 |
| 5 | オーク | 屈強な戦士 |
| 6 | ミノタウロス | 迷宮の主 |
| 7 | 魔女 | 強力な魔法を操る |
| 8 | フェニックス | 不死鳥。炎をまとう |
| 9 | リッチ王 | 闇の支配者 |
| 10 | 魔王 | 最強の存在 |

---

## ✨ 特徴・システム

### 🎨 オリジナルモンスターアート
絵文字ではなくCanvas描画のフルオリジナルアート。各モンスターが個性的なデザイン。

### 🎯 ホールド＆ドロップ操作
押している間はプレビュー表示。離した瞬間に落下するので、戦略的な配置が可能。

### 💥 魔法爆発エフェクト
合体のたびにルーン文字と魔法陣が炸裂する演出。

### ⚔️ コンボボーナス
連続で合体するとコンボ倍率（最大x8）でゴールドが大幅UP！

### 🌊 爆風システム
強力なモンスターが合体すると周囲のモンスターを吹き飛ばす。

### 🔥 エンバー演出
ダンジョン内を常時漂う残り火が雰囲気を演出。

### 📱 PWA対応
ホーム画面に追加してアプリのように遊べる。オフラインでも動作。

### 🏆 オンラインランキング
Firebase連携でスコアを世界中の冒険者と競える。

---

## 🚀 セットアップ手順

### ① GitHubリポジトリを作成

1. [github.com](https://github.com) にログイン
2. 右上「+」→「New repository」
3. Repository name を入力（例：`monster-merge-quest`）
4. **Public** を選択 → 「Create repository」

### ② ファイルをアップロード

リポジトリページで「Add file」→「Upload files」をクリックし、以下をドラッグ＆ドロップ：

```
index.html
style.css
game.js
firebase.js
manifest.json
sw.js
README.md
```

「Commit changes」をクリック。

### ③ アイコンをアップロード（PWA用）

アイコンはルート直下に1枚ずつアップロードします：

```
icon-58.png
icon-80.png
icon-87.png
icon-120.png
icon-180.png
icon-1024.png
```

> ⚠️ `icons/` フォルダは作らず、リポジトリのルート直下にそのままアップロードしてください。

### ④ GitHub Pages を有効化

1. リポジトリの **Settings** タブ
2. 左メニュー **Pages**
3. Source → `Deploy from a branch` → `main` → `/(root)`
4. **Save** をクリック

数分後にURLが発行されます：
```
https://<ユーザー名>.github.io/<リポジトリ名>/
```

### ⑤ 更新方法（ブラウザのみ）

ファイルを修正したいときは：
1. GitHubのリポジトリページでファイルをクリック
2. 右上の「…」→「Edit file」をクリック
3. 内容を編集 → 「Commit changes」
4. 数分後に自動反映 ✅

---

## 📱 スマホアプリとして使う（PWA）

### iPhoneの場合

1. Safariでゲームの URL を開く
2. 下部の **共有ボタン（□↑）** をタップ
3. **「ホーム画面に追加」** をタップ
4. 「追加」をタップ

ホーム画面にアイコンが追加され、フルスクリーンでアプリのように起動できます。

### Androidの場合

1. Chromeでゲームの URL を開く
2. 右上「⋮」→「ホーム画面に追加」
3. 「追加」をタップ

---

## 🔥 Firebase ランキング設定（任意）

### 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」→ プロジェクト名を入力
3. Googleアナリティクスはスキップでも可

### 2. Firestore データベース作成

1. 左メニュー「Firestore Database」→「データベースを作成」
2. モード：**テストモード**で開始
3. ロケーション：`asia-northeast1`（東京）推奨

### 3. 設定値の取得

1. プロジェクトの歯車アイコン →「プロジェクトの設定」
2. 「アプリを追加」→ `</>` (Web) を選択
3. アプリ名を入力 →「アプリを登録」
4. 表示された `firebaseConfig` を**まるごとコピー**

### 4. firebase.js に貼り付け

`firebase.js` をテキストエディタで開き、`YOUR_〇〇` の部分を差し替える：

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

### 5. Firestore セキュリティルール（推奨）

Firebase Console → Firestore → **ルール** タブで以下に変更：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{doc} {
      allow read: if true;
      allow create: if request.resource.data.score is number
                    && request.resource.data.name is string
                    && request.resource.data.name.size() <= 12;
    }
  }
}
```

---

## 📁 ファイル構成

```
monster-merge-quest/
├── index.html        # ゲーム本体・HTML構造
├── style.css         # ダーク・ファンタジーデザイン
├── game.js           # ゲームロジック・物理エンジン・エフェクト
├── firebase.js       # オンラインランキング連携
├── manifest.json     # PWA設定（アプリ名・アイコン）
├── sw.js             # Service Worker（オフライン対応）
├── icon-58.png       # アイコン 58×58px（設定アプリ用）
├── icon-80.png       # アイコン 80×80px（Spotlight用）
├── icon-87.png       # アイコン 87×87px（設定アプリ用）
├── icon-120.png      # アイコン 120×120px（ホーム画面用）
├── icon-180.png      # アイコン 180×180px（ホーム画面用・最重要）
├── icon-1024.png     # アイコン 1024×1024px（高解像度）
└── README.md         # このファイル
```

---

## 🛠 使用技術

| 技術 | 用途 |
|------|------|
| [Matter.js](https://brm.io/matter-js/) | 物理エンジン（重力・衝突） |
| Canvas API | モンスター描画・魔法エフェクト |
| [Firebase Firestore](https://firebase.google.com/) | ランキングデータ保存 |
| GitHub Pages | ゲームホスティング（無料） |
| PWA (Service Worker) | スマホアプリ化・オフライン対応 |

---

## 📜 ライセンス

MIT License — 自由に改変・配布してください。
