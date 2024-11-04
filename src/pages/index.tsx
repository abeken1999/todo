import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase"; // 名前付きインポートに修正
import { User } from "firebase/auth"; // firebase/auth から User 型をインポート

const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 認証状態の監視
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        // ユーザーがログインしていない場合、ログインページにリダイレクト
        router.push("/auth/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null; // ユーザーがいない場合、何も表示しない
  }

  return (
    <div>
      <h1>Todoリスト</h1>
      <p>ログイン成功！</p>
      {/* ログイン成功後のコンテンツをここに追加 */}
    </div>
  );
};

export default HomePage;
