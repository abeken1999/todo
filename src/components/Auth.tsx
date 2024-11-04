import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, signInWithPopup, User } from "firebase/auth";
import { googleProvider } from "../firebase"; // Firebaseの設定をインポート
import GoogleButton from "react-google-button"; // Googleボタンをインポート
// import styles from "../styles/Auth.module.css"; // カスタムCSSをインポート

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        router.push("/todo");
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    try {
      const auth = getAuth();
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      router.push("/todo");
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    await auth.signOut();
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>ログインユーザー: {user.displayName}</p>
          <button onClick={handleSignOut}>ログアウト</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Googleボタンを中央に配置 */}
          <GoogleButton onClick={handleSignIn} />
        </div>
      )}
    </div>
  );
};

export default Auth;
