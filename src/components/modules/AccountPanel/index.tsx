import Image from "next/image";
import styles from "./styles.module.css";

export type AccountPanelProps = {
  displayName: string;
  profileImageUrl?: string;
  isLoggingOut: boolean;
  errorMessage: string;
  onLogout: () => void;
};

export function AccountPanel({
  displayName,
  profileImageUrl,
  isLoggingOut,
  errorMessage,
  onLogout,
}: AccountPanelProps) {
  return (
    <section className={styles.panel} aria-label="アカウント">
      <div className={styles.identity}>
        {profileImageUrl ? (
          <Image
            className={styles.avatar}
            src={profileImageUrl}
            alt={`${displayName}のプロフィール画像`}
            width={42}
            height={42}
            unoptimized
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {displayName.slice(0, 1)}
          </span>
        )}
        <span className={styles.meta}>
          <span className={styles.label}>ログイン中</span>
          <span className={styles.name}>{displayName}</span>
        </span>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.button}
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          ログアウト
        </button>
        <div className={styles.message} aria-live="polite">
          {isLoggingOut ? "ログアウトしています" : null}
          {!isLoggingOut && errorMessage ? (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
