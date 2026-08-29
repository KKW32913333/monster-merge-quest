# ⚔️ モンスターマージクエスト（MMQ）

ダーク・ファンタジー×火山地帯のワールドで、モンスターを合体・進化させる長編パズルゲーム。
PWA対応で、ホーム画面に追加してアプリのように遊べます。

---

## 🎮 ゲームの遊び方

1. 画面を押したまま左右に動いて落とす位置を決める
2. 指を離した瞬間にモンスターが落下
3. 同じモンスター同士が触れ合って進化！
4. 上限ライン（⚠ DANGER）を超えるとゲームオーバー
5. より強いモンスターへの進化を目指してスコア（GOLD）を稼ごう

---

## 👾 モンスター進化ライン（10段階）

| 段階 | モンスター | 特徴 |
|---|---|---|
| 1 | スライム | 最も弱い。でも大量に現れる |
| 2 | コウモリ | とりあえず動き回る |
| 3 | ピクシー | いたずら好きな妖精 |
| 4 | スケルトン | 不死の戦士 |
| 5 | ケンタウルス | 弓を操る森の番人 |
| 6 | ミノタウロス | 迷宮の主 |
| 7 | 魔女 | 強力な魔法を操る |
| 8 | フェニックス | 不死鳥。炎をまとう |
| 9 | ドラゴン | 氷雪の竜 |
| 10 | 魔王 | 最強の存在 |

すべて専用イラストを使用（画像未設定の場合はCanvas描画にフォールバック）。

### 💣 特殊モンスター

| モンスター | 出現確率 | 効果 |
|---|---|---|
| 爆弾スライム | 低確率 | 触れた瞬間に爆発し、周囲のモンスターをまとめて消してボーナススコア獲得 |
| 虹スライム | 低確率 | どのモンスターとも合体できるワイルドカード |

---

## ✨ 主な機能・システム

- **ホールド＆ドロップ操作**：押している間はプレビュー表示。離した瞬間に落下するので戦略的な配置が可能
- **🔄 ホールド機能**：ヘッダーの「HOLD」パネルから現在のモンスターを1体キープ（1ドロップにつき1回まで）
- **💥 魔法爆発エフェクト＆コンボボーナス**：合体のたびにルーン文字と魔法陣が炸裂。連続合体でコンボ倍率（最大x8）
- **🌊 爆風・画面揺れ・振動**：強力な合体や爆弾の爆発で画面が揺れ、対応端末では振動フィードバック
- **📋 デイリーミッション**：日替わりで5種類からランダムに1つ選ばれる。タイトル画面で進捗確認・達成通知
- **🎚️ 難易度選択**：初級／中級／上級から選択。落下速度・出現モンスターの幅・スコア倍率が変化
- **🎨 テーマ選択（4種類）**：タイトル画面からいつでも切り替え可能、端末に保存
  - 漆黒の地下大迷宮
  - 業火の火山地帯（デフォルト）
  - 氷結の永久凍土
  - 星霜の魔法陣
- **💎 ルーンマッチ（マッチ3パズル）**：合体ゲームとは別に遊べるミニゲーム。6種類のモンスターアイコンを揃えて消す定番マッチ3形式。持ち手数（20手）以内のスコアを競う。詰み検出で自動シャッフル
- **🏆 オンラインランキング**：Firebase連携でスコアを世界中の冒険者と競える
- **📱 PWA対応**：オフライン動作、新バージョン公開時は自動リロードで最新化
- **🏠 タイトルへの復帰**：プレイ中でも確認ダイアログを経てタイトル画面に戻れる

---

## 🚀 セットアップ手順

### ① GitHubリポジトリを作成

1. [github.com](https://github.com/) にログイン
2. 右上の「+」→「New repository」
3. Repository name を入力（例：`monster-merge-quest`）
4. **Public** を選択 →「Create repository」

### ② ファイルをアップロード

リポジトリページで「Add file」→「Upload files」から、以下を全てドラッグ＆ドロップし「Commit changes」：

```
index.html
style.css
game.js
firebase.js
manifest.json
sw.js
README.md
```

### ③ アイコン・モンスター画像をアップロード

以下もリポジトリの**ルート直下**に、フォルダを作らずそのままアップロードしてください。

**アプリアイコン**
```
icon-58.png
icon-80.png
icon-87.png
icon-120.png
icon-180.png
icon-1024.png
```

**モンスター画像**
```
monster-slime.png
monster-bat.png
monster-pixie.png
monster-skeleton.png
monster-centaur.png
monster-minotaur.png
monster-witch.png
monster-phoenix.png
monster-dragon.png
monster-demonlord.png
```

> ⚠️ `icons/` や `images/` のようなフォルダは作らないでください。コード側がルート相対パスで参照しています。

### ④ GitHub Pagesを有効化

1. リポジトリの「Settings」タブ
2. 左メニュー「Pages」
3. Source を **「Deploy from a branch」→「main」→「/(root)」** に設定
4. 「Save」をクリック

数分後、以下のURLでアクセスできます：

```
https://<ユーザー名>.github.io/<リポジトリ名>/
```

### ⑤ 更新方法（ブラウザのみ）

1. GitHubのリポジトリページでファイルをクリック
2. 右上の「…」→「ファイルを編集」
3. 内容を編集 →「Commit changes」
4. 数分後に自動的に反映 ✅

複数ファイルをまとめて更新する場合は、「Add file」→「Upload files」で対象ファイルを一括ドラッグ＆ドロップし、1回のコミットでまとめて反映するのがおすすめです。

> **反映されない場合**：本アプリはService Worker（`sw.js`）でファイルをキャッシュしています。HTML/CSS/JSはネットワーク優先で取得され、更新後は自動リロードされますが、万一反映されない場合はブラウザで直接サイトURLを開いて確認するか、ホーム画面のアプリを一度削除・キャッシュクリアの上、再度「ホーム画面に追加」してください。

---

## 📱 ホーム画面への追加（PWA）

**iPhoneの場合**
1. SafariでゲームのURLを開く
2. 下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」→「追加」

**Androidの場合**
1. ChromeでゲームのURLを開く
2. 右上「⋮」→「ホーム画面に追加」→「追加」

---

## 🔥 Firebase ランキング設定（任意）

1. **Firebaseプロジェクト作成**：[Firebase コンソール](https://console.firebase.google.com/) → 「プロジェクトを追加」（Googleアナリティクスはスキップ可）
2. **Firestoreデータベースの作成**：左メニュー「Firestoreデータベース」→「データベースを作成」→ テストモード／`asia-northeast1`（東京）推奨
3. **設定値の取得**：歯車アイコン →「プロジェクトの設定」→「アプリを追加」→ `</>`（Web）→ 表示された `firebaseConfig` をコピー
4. **`firebase.js` に貼り付け**：

```javascript
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

5. **Firestore セキュリティルール（推奨）**：Firebase コンソール → Firestore →「ルール」タブで以下に変更

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
├── index.html                          # ゲーム本体・HTML構造
├── style.css                           # 4テーマ対応デザイン（CSS変数で切り替え）
├── game.js                             # ゲームロジック・物理エンジン・エフェクト・全機能
├── firebase.js                         # オンラインランキング連携
├── manifest.json                       # PWA設定（アプリ名・アイコン）
├── sw.js                               # Service Worker（オフライン対応・自動更新）
├── icon-58.png 〜 icon-1024.png        # アプリアイコン各サイズ
├── monster-slime.png 〜 monster-demonlord.png  # モンスター画像（10種）
└── README.md                           # このファイル
```

---

## 🛠 使用技術

| 技術 | 用途 |
|---|---|
| Matter.js | 物理エンジン（重力・衝突・合体判定） |
| Canvas API | モンスター描画・魔法エフェクト・マッチ3盤面描画 |
| Firebase Firestore | ランキングデータ保存 |
| GitHub Pages | ゲームホスティング（無料） |
| PWA（Service Worker） | オフライン対応・自動更新 |
| localStorage | テーマ／難易度／ミッション／ホールド／ハイスコア等の端末保存 |

---

## 📜 ライセンス

MIT License — 自由に改変・配布してください。
