import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const dtoPath = path.resolve(
  process.cwd(),
  "src/apis/generated/model/authMeResponseDto.ts",
);

describe("AuthMeResponseDto contract", () => {
  it("表示用フィールドだけを許可し、tokenや識別子を公開しない", () => {
    const sourceFile = ts.createSourceFile(
      dtoPath,
      fs.readFileSync(dtoPath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const dto = sourceFile.statements.find(
      (statement): statement is ts.InterfaceDeclaration =>
        ts.isInterfaceDeclaration(statement) &&
        statement.name.text === "AuthMeResponseDto",
    );

    expect(dto).toBeDefined();

    const propertyNames =
      dto?.members.flatMap((member) => {
        if (
          !ts.isPropertySignature(member) ||
          (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name))
        ) {
          return [];
        }

        return [member.name.text];
      }) ?? [];

    expect(propertyNames.sort()).toEqual(
      ["displayName", "profileImageUrl"].sort(),
    );
    expect(propertyNames).not.toEqual(
      expect.arrayContaining(["jwt", "token", "id", "sub", "email"]),
    );
  });
});
