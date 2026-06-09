import type {
  CreateTodoRequestDto,
  TodoDto,
  UpdateTodoRequestDto,
} from "@/apis/generated/model";

export type Todo = TodoDto;

export type TodoFilter = "all" | "active" | "completed";

export type TodoCreateInput = CreateTodoRequestDto;

export type TodoUpdateInput = UpdateTodoRequestDto;
