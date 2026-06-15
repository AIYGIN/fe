import { enableApiMocking } from "./api.mock-browser";

export const enableTodoMocking = async () => {
  await enableApiMocking();
};
