import { NextPage } from 'next'; // Next.js ページで型を使用
import 'bootstrap/dist/css/bootstrap.min.css'; // BootstrapのCSSをインポート
// import styles from "../../styles/SignInPage.module.css"; // CSSモジュールをインポート
import Auth from '@/components/Auth';

const SignInPage: NextPage = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
  <div className="text-center">
    <h1 className="mb-4">私のタスク管理</h1>
    <p className="mb-4">Googleアカウントを使用してサインインしてください。</p>
    <Auth />
  </div>
</div>
  );
};

export default SignInPage;