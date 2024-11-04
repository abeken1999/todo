import { User, deleteUser, onAuthStateChanged } from "firebase/auth"; // Firebase Auth関連
import { useState, useEffect, useRef } from "react"; // Reactのフックをインポート
import { useRouter } from "next/router"; // Next.jsのrouterフックをインポート
import React from 'react';
import { db,auth } from "../firebase"; // Firestoreをインポート
import { 
  collection, addDoc, query, onSnapshot, orderBy, doc, deleteDoc, 
  updateDoc, where, getDocs
} from "firebase/firestore"; // Firestore操作関連
import NavbarComponent from "../components/Navbar"; // Navbarコンポーネントをインポート

// Navbarコンポーネントの型を定義
interface NavbarProps {
  user: User | null; // FirebaseのUserまたはnullを許容
  onSignOut: () => void; // ログアウト処理
  onDeleteAccount: () => void; // 退会処理
}

// ナビゲーションバーのコンポーネント
const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, onDeleteAccount }) => {
  const [showMenu, setShowMenu] = useState(false); // メニューの表示状態

  // メニューの表示/非表示をトグルする関数
const toggleMenu = () => {
  setShowMenu(!showMenu);
};

return (
  <nav style={{ position: 'fixed', top: 10, right: 10 }}>
    {/* ねじアイコン */}
    <button onClick={toggleMenu} className="menu-icon">
      <i className="bi bi-gear"></i>
    </button>
    {showMenu && (
      <div
        className="menu"
        style={{
          backgroundColor: '#343a40',
          padding: '10px',
          borderRadius: '5px',
          position: 'absolute',
          top: '30px',
          right: '0',
          minWidth: '150px',  // メニューの最小幅を150pxに設定
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',  // テキストの折り返しを防止
        }}
      >
        {/* ユーザー名の表示 */}
        {user && (
          <p>
            {user.displayName}
          </p>
        )}
        {/* ボタンを横並びに配置 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* ログアウトボタン */}
          <button
            onClick={onSignOut}
          >
            ログアウト
          </button>
          {/* 退会ボタン */}
          <button
            onClick={onDeleteAccount}
          >
          退会する
          </button>
        </div>
      </div>
    )}
  </nav>
);
};

// TodoPageコンポーネントの定義
const TodoPage = () => {
  const [user, setUser] = useState<User | null>(null); // ユーザー情報を管理する状態
  const [text, setText] = useState(''); // 入力されたテキストを管理する状態
  const [tasks, setTasks] = useState<any[]>([]); // Firestoreから取得したタスクを管理する状態
  const [editingTask, setEditingTask] = useState<any>(null); // 編集中のタスク
  const [inputVisible, setInputVisible] = useState(false); // タスク入力フィールドの表示状態
  const MAX_LENGTH = 140; // テキストの最大文字数
  const router = useRouter(); // Next.jsのルーターを使用する
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // テキストエリアへの参照を生成

  // 検索窓の入力内容を保持する状態
  const [searchTerm, setSearchTerm] = useState("");

  // 特殊文字や不正なタグを削除する関数
  const sanitizeInput = (input: string): string => {
    // HTMLタグやスクリプトタグを削除
    return input.replace(/<\/?[^>]+(>|$)/g, "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  // 検索窓の入力イベントで呼ばれる関数
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 検索語句に一致するタスクのみを含む新しい配列
  const filteredTasks = tasks.filter(task => 
    searchTerm.length > 0 ? task.text.includes(searchTerm) : true
  );

  // 認証状態の変更を監視し、ユーザー情報を設定
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe(); // クリーンアップ関数
  }, []);

  // 退会処理の関数
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("これまでのタスクが削除されますが、退会しますか？");
    if (confirmed && user) {
      try {
        // ユーザーに紐付いたタスクを取得して削除
        const tasksQuery = query(collection(db, "todos"), where("userId", "==", user.uid));
        const taskSnapshots = await getDocs(tasksQuery);
        taskSnapshots.forEach(async (doc) => await deleteDoc(doc.ref));

        // Firebase Authからユーザーアカウントを削除
        await deleteUser(user);
        alert("退会が完了しました。");
        router.push("/auth/signin"); // サインインページへリダイレクト
      } catch (error) {
        console.error("Error deleting account: ", error);
        alert("退会に失敗しました。再度お試しください。");
      }
    }
  };

  // ログインユーザーのタスクをリアルタイムで取得
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "todos"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedTasks = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setTasks(loadedTasks);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // サインアウト処理とルーターによるページ遷移
  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/auth/signin"); // サインインページに遷移
  };

  // テキストエリアの入力イベントハンドラーで、動的に高さを調整
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value); // 入力された内容を状態に設定
    if (textareaRef.current) { // テキストエリア要素が存在する場合
      textareaRef.current.style.height = 'auto'; // 現在の高さ設定をリセット
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 内容に応じた高さを設定
    }
  };

  // 新規タスクをFirestoreに追加
  // タスクを追加する関数内
  const addTask = async () => {
    if (text.trim().length > 0 && user) {
      // 入力内容をサニタイズ
      const sanitizedText = sanitizeInput(text);
      
      try {
        await addDoc(collection(db, "todos"), {
          text: sanitizedText, // サニタイズ済みのテキストを保存
          timestamp: new Date(),
          userId: user.uid // ログイン中のユーザーIDを保存
        });
        setText('');
        setInputVisible(false);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      console.error("タスクを追加することはできません");
    }
  };

// useEffect内のクエリ
useEffect(() => {
  if (user) {
    const q = query(
      collection(db, "todos"),
      where("userId", "==", user.uid), // ログイン中のユーザーIDでフィルタリング
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setTasks(loadedTasks);
    });

    return () => unsubscribe();
  }
}, [user]);


  // タスクをFirestoreで削除
  const removeTask = async (id: string) => {
    const confirmed = window.confirm("タスクを削除しますが、よろしいですか？");
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "todos", id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      setEditingTask(null); // 編集中であればリセット
      setInputVisible(false);
    }
  };

  // タスクの編集モードを開始
  const editTask = (task: any) => {
    setEditingTask(task);
    setText(task.text);
    setInputVisible(true);
  };

  // 編集中のタスクをFirestoreで更新
  const saveTaskEdit = async () => {
    if (editingTask && text.trim().length > 0) {
      // 入力内容をサニタイズ
      const sanitizedText = sanitizeInput(text);
      
      try {
        await updateDoc(doc(db, "todos", editingTask.id), {
          text: sanitizedText, // サニタイズ済みのテキストを保存
          timestamp: new Date()
        });
        setEditingTask(null);
        setText('');
        setInputVisible(false);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      console.error("空欄のため、保存できません");
    }
  };

  // キャンセルして入力や編集を終了
  const cancelInput = () => {
    setEditingTask(null);
    setText('');
    setInputVisible(false);
  };

// タスクを表示する部分
<div className="taskList" style={{ marginTop: '20px' }}>
  {/* filteredTasksを使って検索条件に一致するタスクのみを表示 */}
  {filteredTasks.map((task) => (
    <div
      key={task.id}  // 各タスクに一意のキーを指定
      className="taskItem"
      style={{ marginBottom: '10px', position: 'relative', cursor: 'pointer' }}
      onClick={() => editTask(task)}  // タスクをクリックしたときに編集関数を呼び出し
    >
      {/* タスクのテキストを表示 */}
      <p>{task.text}</p>
      {/* 作成日時を表示（UNIXタイムスタンプをローカル日時に変換） */}
      <small>作成日時: {new Date(task.timestamp.seconds * 1000).toLocaleString()}</small>
    </div>
  ))}
</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      {/* ナビゲーションバーを表示 */}
      <NavbarComponent user={user} onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount} />
      <h1>Todo List</h1>
      <div style={{ width: '100%', maxWidth: '600px', marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        {/* 検索フィールド */}
        <input
          type="text"
          placeholder="検索"
          value={searchTerm}
          onChange={handleSearch} // 検索キーワードの変更を監視
          style={{
            flex: 1,
            padding: '10px',
            boxSizing: 'border-box',
            marginRight: '10px'
          }}
        />
        {/* ＋ボタンを検索窓の右横に配置 */}
        <button
          style={{
            padding: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '50%', // 円形ボタン
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' // ボタンに影を追加
          }}
          onClick={() => { setInputVisible(true); setEditingTask(null); setText(''); }}
        >
          ＋
        </button>
      </div>

      {/* タスク入力ウィンドウ */}
      {inputVisible && (
  <div className="input-area" style={{
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    boxSizing: 'border-box'
  }}>
    <div style={{ marginBottom: '5px' }}>
      <textarea
        ref={textareaRef}
        placeholder="タスクを入力"
        style={{
          width: '100%',
          height: '140px',
          padding: '10px',
          boxSizing: 'border-box',
          resize: 'none',
          overflow: 'hidden',
          fontFamily: 'inherit',
          fontSize: 'inherit'
        }}
        maxLength={MAX_LENGTH}
        onChange={handleInput}
        value={text}
      />
    </div>
    <div style={{ textAlign: 'right', marginBottom: '20px', color: text.length >= MAX_LENGTH ? 'red' : 'black' }}>
      残り{MAX_LENGTH - text.length}文字
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
      <button
        style={{
          padding: '5px 10px',
          backgroundColor: '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          opacity: text.trim().length === 0 ? 0.5 : 1,
          pointerEvents: text.trim().length === 0 ? 'none' : 'auto'
        }}
        onClick={editingTask ? saveTaskEdit : addTask}
      >
        OK
      </button>
      {editingTask && (
        <button
          style={{
            padding: '5px 10px',
            backgroundColor: '#DC3545',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          onClick={() => removeTask(editingTask.id)}
        >
          削除
        </button>
      )}
      <button
        style={{
          padding: '5px 10px',
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
        onClick={cancelInput}
      >
        キャンセル
      </button>
    </div>
  </div>
)}

<div className="taskList" style={{ marginTop: '20px' }}>
  {filteredTasks.map((task) => (
    <div
      key={task.id}
      className="taskItem"
      style={{ marginBottom: '10px', position: 'relative', cursor: 'pointer' }}
      onClick={() => editTask(task)} // タスクをクリックしたときに編集関数を呼び出し
    >
      <p>{task.text}</p>
      <small>作成日時: {new Date(task.timestamp.seconds * 1000).toLocaleString()}</small>
    </div>
  ))}
</div>

    </div>
  );
};

export default TodoPage; // TodoPageコンポーネントをエクスポート