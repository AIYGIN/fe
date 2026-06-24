import { describe, expect, it } from "vitest";
import { resolveTodoBrowserMockEnabled } from ".";

describe("todo page browser mock flag", () => {
  it("未指定時は実BFFへ向けるためブラウザMSWを無効にする", () => {
    expect(resolveTodoBrowserMockEnabled(undefined)).toBe(false);
  });

  it("NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK=true のときだけブラウザMSWを有効にする", () => {
    expect(resolveTodoBrowserMockEnabled("true")).toBe(true);
    expect(resolveTodoBrowserMockEnabled("false")).toBe(false);
    expect(resolveTodoBrowserMockEnabled("1")).toBe(false);
    expect(resolveTodoBrowserMockEnabled("TRUE")).toBe(false);
  });
});
