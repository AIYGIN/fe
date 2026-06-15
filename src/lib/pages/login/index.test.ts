import { describe, expect, it } from "vitest";
import { parseLoginSearchParams, sanitizeLoginReturnTo } from ".";

describe("login page params", () => {
  it("内部pathをreturnToとして受け付ける", () => {
    expect(parseLoginSearchParams({ next: "/todo?filter=active" })).toEqual({
      returnTo: "/todo?filter=active",
    });
  });

  it("複数nextは先頭だけを採用する", () => {
    expect(parseLoginSearchParams({ next: ["/todo", "/settings"] })).toEqual({
      returnTo: "/todo",
    });
  });

  it("外部URLとprotocol-relative URLは破棄する", () => {
    expect(
      parseLoginSearchParams({ next: "https://evil.example/todo" }),
    ).toEqual({ returnTo: undefined });
    expect(parseLoginSearchParams({ next: "//evil.example/todo" })).toEqual({
      returnTo: undefined,
    });
  });

  it("ログイン開始hook用のreturnToも同じ制約で検証する", () => {
    expect(sanitizeLoginReturnTo("/todo#today")).toBe("/todo#today");
    expect(sanitizeLoginReturnTo("https://evil.example/todo")).toBeUndefined();
  });
});
