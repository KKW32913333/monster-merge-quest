// ===== FIREBASE RANKING =====
// Firebase v9 (Modular SDK)
// 使用前に: firebaseConfig の値を自分のプロジェクトのものに差し替えてください

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =====================================================
// ▼▼▼ ここを自分のFirebaseプロジェクトの設定に変更 ▼▼▼
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhcOQGna6CS5ikcys-YRybTJCMRSxVaSY",
  authDomain: "monster-merge-quest.firebaseapp.com",
  projectId: "monster-merge-quest",
  storageBucket: "monster-merge-quest.firebasestorage.app",
  messagingSenderId: "715334723547",
  appId: "1:715334723547:web:964408467301a92a2fe9fe",
  measurementId: "G-QC5GK94JY6"
};
// ▲▲▲ ここまで ▲▲▲
// =====================================================

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("✅ Firebase 接続成功");
} catch (err) {
  console.warn("⚠️ Firebase 未設定 or 接続失敗:", err.message);
}

// ===== プレイヤー識別ID =====
// ログイン機能がないため、端末（ブラウザ）ごとに匿名IDを1つ自動生成し、
// localStorageに保存しておく。このIDをFirestoreのドキュメントIDとして使うことで
// 「同じ端末からの記録は1件に集約し、自己ベストのみ保持する」仕組みにする。
function getPlayerId() {
  let id = localStorage.getItem('monsterMergePlayerId');
  if (!id) {
    id = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('monsterMergePlayerId', id);
  }
  return id;
}

// ===== スコア送信（新規登録ではなく、自己ベスト更新時のみ上書き） =====
window.submitScore = async function(name, score) {
  if (!db) {
    console.warn("Firebase が未設定です。firebaseConfig を設定してください。");
    return;
  }
  try {
    const playerId = getPlayerId();
    const ref = doc(db, "scores", playerId);
    const snap = await getDoc(ref);
    const prevScore = snap.exists() ? Number(snap.data().score) || 0 : -1;
    const newScore = Number(score);

    if (newScore > prevScore) {
      await setDoc(ref, {
        name: name.slice(0, 12),
        score: newScore,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`✅ 自己ベスト更新: ${name} - ${newScore}`);
    } else {
      console.log(`ℹ️ 自己ベスト（${prevScore}）を超えなかったため、ランキングは更新されませんでした`);
    }
  } catch (err) {
    console.error("❌ スコア登録エラー:", err);
  }
};

// ===== ランキング取得 =====
window.loadRanking = async function() {
  if (!db) {
    console.warn("Firebase が未設定です。");
    return [];
  }
  try {
    const q = query(
      collection(db, "scores"),
      orderBy("score", "desc"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error("❌ ランキング取得エラー:", err);
    return [];
  }
};
