"use client";

import { memo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTodos } from "@/hooks/todo";
import styles from "../styles.module.css";

type TodoComposerProps = {
  initialDraft: string;
  initialValidationError: string;
};

const validateTitle = (value: string) => {
  const title = value.trim();

  if (title.length === 0) {
    return "TODOを入力してください";
  }

  if (title.length > 80) {
    return "TODOは80文字以内で入力してください";
  }

  return null;
};

export const TodoComposer = memo(function TodoComposer({
  initialDraft,
  initialValidationError,
}: TodoComposerProps) {
  const { createError, isCreating, addTodo, clearCreateError } = useTodos(
    useShallow((state) => ({
      createError: state.createError,
      isCreating: state.isCreating,
      addTodo: state.addTodo,
      clearCreateError: state.clearCreateError,
    })),
  );
  const [draft, setDraft] = useState(initialDraft);
  const [validationError, setValidationError] = useState(
    initialValidationError,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validateTitle(draft);

    if (nextError) {
      setValidationError(nextError);
      return;
    }

    setValidationError("");
    const created = await addTodo({ title: draft.trim() });
    if (created) {
      setDraft("");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="todo-title">
          新しいTODO
        </label>
        <input
          id="todo-title"
          className={styles.input}
          value={draft}
          maxLength={120}
          onChange={(event) => {
            setDraft(event.target.value);
            setValidationError("");
            clearCreateError();
          }}
          aria-invalid={validationError || createError ? "true" : "false"}
          aria-describedby={
            validationError || createError ? "todo-title-error" : undefined
          }
          placeholder="次に終わらせることは？"
        />
        {validationError || createError ? (
          <p
            className={styles.errorText}
            id="todo-title-error"
            role={createError ? "alert" : undefined}
          >
            {validationError || createError}
          </p>
        ) : (
          <p className={styles.hint}>1〜80文字で入力できます</p>
        )}
      </div>
      <button
        className={styles.primaryButton}
        type="submit"
        disabled={isCreating}
      >
        {isCreating ? "追加中..." : "追加"}
      </button>
    </form>
  );
});
