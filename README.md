# ⚔️ Monster Merge Quest

> ダーク・ファンタジーの世界でモンスターを合体・進化させる落下パズルゲーム

---

## 🎮 ゲームの遊び方

- 画面をクリック（またはタップ）してモンスターを落とす
- **同じモンスター同士が触れると合体して進化！**
- 上限ライン（☠ DANGER）を超えるとゲームオーバー
- より強いモンスターへの進化を目指してスコアを稼ごう

---

## 👾 モンスター進化ライン（10段階）

| 段階 | モンスター | 特徴 |
|------|-----------|------|
| 1 | 🟢 スライム | 最弱。でも大量に現れる |
| 2 | 🦇 コウモリ | 素早く動き回る |
| 3 | 👺 ゴブリン | 小賢しい魔物 |
| 4 | 💀 スケルトン | 不死の戦士 |
| 5 | 👹 オーク | 屈強な戦士 |
| 6 | 🐂 ミノタウロス | 迷宮の主 |
| 7 | 🧙 魔女 | 強力な魔法を操る |
| 8 | 🔥 フェニックス | 不死鳥。炎をまとう |
| 9 | 👑 リッチ王 | 闇の支配者 |
| 10 | 😈 魔王 | 最強の存在 |

---

## ✨ 特徴・システム

### 💥 魔法爆発エフェクト
合体のたびにルーン文字と魔法陣が炸裂する演出。

### ⚔️ コンボボーナス
連続で合体するとコンボ倍率（最大x8）でゴールドが大幅UP！

### 🌊 爆風システム
強力なモンスターが合体すると周囲のモンスターを吹き飛ばす。

### 🎯 ネクストプレビュー
次に落ちてくるモンスターが事前にわかるので戦略的に配置できる。

### 🔥 エンバー演出
ダンジョン内を常時漂う残り火が雰囲気を演出。

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

リポジトリページで「uploading an existing file」をクリックし、以下をドラッグ＆ドロップ：

```
index.html
style.css
game.js
firebase.js
README.md
```

「Commit changes」をクリック。

### ③ GitHub Pages を有効化

1. リポジトリの **Settings** タブ
2. 左メニュー **Pages**
3. Source → `Deploy from a branch` → `main` → `/(root)`
4. **Save** をクリック

数分後にURLが発行されます：
```
https://<ユーザー名>.github.io/<リポジトリ名>/
```

### ④ 更新方法（ブラウザのみ）

ファイルを修正したいときは：
1. GitHubのリポジトリページでファイルをクリック
2. 右上の鉛筆アイコン（Edit）をクリック
3. 内容を編集 → 「Commit changes」
4. 数分後に自動反映 ✅

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
3. 表示された `firebaseConfig` をコピー

### 4. firebase.js に貼り付け

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
├── index.html       # ゲーム本体・HTML構造
├── style.css        # ダーク・ファンタジーデザイン
├── game.js          # ゲームロジック・物理エンジン・エフェクト
├── firebase.js      # オンラインランキング連携
└── README.md        # このファイル
```

---

## 🛠 使用技術

| 技術 | 用途 |
|------|------|
| [Matter.js](https://brm.io/matter-js/) | 物理エンジン（重力・衝突） |
| Canvas API | ゲーム描画・魔法エフェクト |
| [Firebase Firestore](https://firebase.google.com/) | ランキングデータ保存 |
| GitHub Pages | ゲームホスティング（無料） |

---

## 📜 ライセンス

MIT License — 自由に改変・配布してください。
