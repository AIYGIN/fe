import { expect, test } from "@playwright/test";

test("TODOの追加、完了切替、フィルタ、確認付き削除ができる", async ({
  page,
}) => {
  await page.goto("/todo");

  await expect(page.getByRole("heading", { name: "TODOリスト" })).toBeVisible();

  await page
    .getByRole("textbox", { name: "新しいTODO" })
    .fill("E2EでTODOを追加する");
  await page.getByRole("button", { name: "追加" }).click();

  const addedTodo = page
    .getByRole("listitem")
    .filter({ hasText: "E2EでTODOを追加する" });

  await expect(addedTodo).toBeVisible();

  await page
    .getByRole("checkbox", { name: "E2EでTODOを追加するを完了にする" })
    .click();
  await page.getByRole("button", { name: "完了", exact: true }).click();

  await expect(addedTodo).toBeVisible();

  await page.getByRole("button", { name: "削除: E2EでTODOを追加する" }).click();
  await expect(page.getByRole("dialog", { name: "TODOを削除" })).toBeVisible();

  await page.getByRole("button", { name: "削除する" }).click();
  await expect(addedTodo).toBeHidden();
});
