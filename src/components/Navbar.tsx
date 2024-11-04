import { User } from "firebase/auth"; // FirebaseのUser型をインポート
import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap Iconsをインポートしてアイコンを使用可能に

// Navbarコンポーネントに渡すプロパティの型を定義
interface NavbarProps {
  user: User | null; // FirebaseのUser型またはnull（ログイン状態に応じて変わる）
  onSignOut: () => void; // ログアウト処理の関数
  onDeleteAccount: () => void; // 退会処理の関数
}

// Navbarコンポーネントを定義（Propsを引数に受け取る）
const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, onDeleteAccount }) => {
  // メニューの表示状態を管理するための状態変数
  const [showMenu, setShowMenu] = useState(false);

  // メニューの表示/非表示を切り替える関数
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav style={{ position: 'fixed', top: 10, right: 10 }}> {/* ナビゲーションバーを画面右上に固定配置 */}
      {/* 設定アイコン（ギアアイコン）をクリックでメニューの表示/非表示を切り替え */}
      <button onClick={toggleMenu} className="menu-icon" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <i className="bi bi-gear" style={{ fontSize: '24px', color: '#fff' }}></i>
      </button>
      {showMenu && ( // showMenuがtrueの場合のみ、メニューを表示
        <div className="menu" style={{ position: 'absolute', right: 0, background: '#343a40', padding: '10px', borderRadius: '5px' }}> {/* メニューのスタイルを設定 */}
          {/* ログイン中のユーザー名を表示（userがnullでない場合） */}
          {user && <p style={{ color: '#fff' }}>{user.displayName}</p>}
          
          {/* ログアウトボタン。クリックでonSignOut関数が実行される */}
          <button onClick={onSignOut} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>ログアウト</button>
          
          {/* 退会ボタン。クリックでonDeleteAccount関数が実行される */}
          <button onClick={onDeleteAccount} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginTop: '5px' }}>退会する</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
