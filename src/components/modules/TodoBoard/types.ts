import type { TodoApiStoreState } from "@/hooks/todo";
import type { TodoFilter } from "@/types/todo";

export type Todo = TodoApiStoreState["todos"][number];

export type TodoBoardProps = {
  initialFilter: TodoFilter;
  initialDraft: string;
  initialValidationError: string;
};

export type DeleteRequest =
  | { kind: "single"; todos: [Todo] }
  | { kind: "bulk"; todos: Todo[] };
