import type { KeyboardEvent, RefObject } from "react";
import styles from "../styles.module.css";
import type { DeleteRequest } from "../types";

type TodoDeleteDialogProps = {
  request: DeleteRequest;
  error: string;
  isPending: boolean;
  dialogRef: RefObject<HTMLDivElement | null>;
  cancelButtonRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onConfirm: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function TodoDeleteDialog({
  request,
  error,
  isPending,
  dialogRef,
  cancelButtonRef,
  onCancel,
  onConfirm,
  onKeyDown,
}: TodoDeleteDialogProps) {
  return (
    <div className={styles.dialogBackdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-body"
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        <div className={styles.dialogMark} aria-hidden="true">
          !
        </div>
        <h2 className={styles.dialogTitle} id="delete-dialog-title">
          {request.kind === "bulk" ? "完了済みTODOを一括削除" : "TODOを削除"}
        </h2>
        <p className={styles.dialogBody} id="delete-dialog-body">
          {request.kind === "bulk"
            ? `完了済みのTODO ${request.todos.length}件を削除します。`
            : `「${request.todos[0].title}」を削除します。確定するまで一覧には残ります。`}
        </p>
        {error ? (
          <p className={styles.dialogError} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.dialogActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            ref={cancelButtonRef}
            disabled={isPending}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending
              ? "削除中..."
              : request.kind === "bulk"
                ? `${request.todos.length}件を削除する`
                : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
