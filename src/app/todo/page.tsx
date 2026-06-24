import { TodoTemplate } from "@/components/templates/Todo";
import { resolveTodoBrowserMockEnabled } from "@/lib/pages/todo";

export default function Page() {
  return (
    <TodoTemplate
      enableBrowserMock={resolveTodoBrowserMockEnabled(
        process.env.NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK,
      )}
    />
  );
}
