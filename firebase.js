// ===== FIREBASE RANKING =====
// Firebase v9 (Modular SDK)
// 使用前に: firebaseConfig の値を自分のプロジェクトのものに差し替えてください

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
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

// ===== スコア送信 =====
window.submitScore = async function(name, score) {
  if (!db) {
    console.warn("Firebase が未設定です。firebaseConfig を設定してください。");
    return;
  }
  try {
    await addDoc(collection(db, "scores"), {
      name: name.slice(0, 12),
      score: Number(score),
      createdAt: serverTimestamp()
    });
    console.log(`✅ スコア登録: ${name} - ${score}`);
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
