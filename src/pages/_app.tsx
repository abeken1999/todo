import "bootstrap/dist/css/bootstrap.min.css"; // BootstrapのCSSをインポート
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../styles/globals.css"; // カスタムCSSをインポート（後述）
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
