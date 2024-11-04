import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestoreをインポート

// Firebaseの設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebaseを初期化
const firebaseApp = initializeApp(firebaseConfig);

// 認証機能とGoogle認証プロバイダの設定
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Firestoreの初期化
const db = getFirestore(firebaseApp);

// 名前付きエクスポート
export { auth, googleProvider, db }; // Firestoreもエクスポート
// デフォルトエクスポートとしてfirebaseAppを追加
export default firebaseApp;
