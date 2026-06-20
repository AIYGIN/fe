import type { AuthStatus } from "@/hooks/auth";
import styles from "./styles.module.css";

export type AuthStatusPanelProps = {
  status: Exclude<AuthStatus, "authenticated">;
  errorMessage?: string;
  onRetry: () => void;
};

export function AuthStatusPanel({
  status,
  errorMessage = "",
  onRetry,
}: AuthStatusPanelProps) {
  const isError = status === "error";

  return (
    <main className={styles.shell}>
      <section className={styles.panel} aria-labelledby="auth-status-title">
        <p className={styles.eyebrow}>Account access</p>
        <h1 id="auth-status-title" className={styles.title}>
          {isError ? "認証状態を確認できません" : "認証状態を確認しています"}
        </h1>
        <div className={styles.status} aria-live="polite">
          {status === "idle" || status === "checking"
            ? "ログイン状態を確認しています"
            : null}
          {status === "unauthenticated" ? "ログイン画面へ移動しています" : null}
          {isError ? (
            <p className={styles.error} role="alert">
              {errorMessage || "認証状態を確認できませんでした"}
            </p>
          ) : null}
        </div>
        {isError ? (
          <button className={styles.button} type="button" onClick={onRetry}>
            再試行
          </button>
        ) : null}
      </section>
    </main>
  );
}
