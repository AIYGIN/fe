import styles from "./styles.module.css";

export type LoginPanelProps = {
  isChecking: boolean;
  isLoginDisabled: boolean;
  errorMessage: string;
  onLogin: () => void;
};

export function LoginPanel({
  isChecking,
  isLoginDisabled,
  errorMessage,
  onLogin,
}: LoginPanelProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.panel} aria-labelledby="login-title">
        <p className={styles.eyebrow}>Account access</p>
        <h1 id="login-title" className={styles.title}>
          ログイン
        </h1>
        <p className={styles.description}>
          Googleアカウントでログインして、アプリケーションを利用します。
        </p>
        <div className={styles.status} aria-live="polite">
          {isChecking ? "認証状態を確認しています" : null}
          {!isChecking && errorMessage ? (
            <p className={styles.error}>{errorMessage}</p>
          ) : null}
        </div>
        <button
          className={styles.button}
          type="button"
          onClick={onLogin}
          disabled={isLoginDisabled}
        >
          Googleでログイン
        </button>
      </section>
    </main>
  );
}
