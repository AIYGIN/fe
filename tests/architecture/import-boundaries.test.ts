import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(process.cwd(), "src");
const productionExtensions = new Set([".ts", ".tsx"]);

const collectSourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    if (
      !productionExtensions.has(path.extname(entry.name)) ||
      entry.name.includes(".test.") ||
      entry.name.includes(".stories.") ||
      entryPath.includes(`${path.sep}generated${path.sep}`)
    ) {
      return [];
    }

    return [entryPath];
  });

const getImports = (filePath: string) => {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  return sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      return [];
    }

    return [statement.moduleSpecifier.text];
  });
};

const toRelativePath = (filePath: string) =>
  path.relative(process.cwd(), filePath).split(path.sep).join("/");

const isDeepFeatureImport = (importPath: string, layer: string) =>
  importPath.startsWith(`@/${layer}/`) &&
  importPath.slice(`@/${layer}/`.length).includes("/");

const findViolations = () => {
  const violations: string[] = [];

  for (const filePath of collectSourceFiles(sourceRoot)) {
    const relativePath = toRelativePath(filePath);

    if (
      relativePath.startsWith("src/components/") &&
      path.extname(filePath) === ".tsx" &&
      path.basename(filePath) !== "index.tsx"
    ) {
      violations.push(
        `${relativePath}: each component must live in <ComponentName>/index.tsx`,
      );
    }

    for (const importPath of getImports(filePath)) {
      if (
        relativePath.startsWith("src/components/") &&
        (importPath.startsWith("@/stores/") || importPath.startsWith("@/apis/"))
      ) {
        violations.push(
          `${relativePath}: components must access stores and APIs through hooks (${importPath})`,
        );
      }

      if (
        relativePath.startsWith("src/components/") &&
        isDeepFeatureImport(importPath, "hooks")
      ) {
        violations.push(
          `${relativePath}: components must use a hook feature's public index (${importPath})`,
        );
      }

      if (
        (importPath.startsWith("@/components/templates/") ||
          importPath.startsWith("@/components/modules/")) &&
        importPath.split("/").length > 4
      ) {
        violations.push(
          `${relativePath}: component packages must be imported through their public index (${importPath})`,
        );
      }

      if (
        relativePath.startsWith("src/components/templates/") &&
        importPath.startsWith("@/components/") &&
        !importPath.startsWith("@/components/modules/") &&
        !importPath.startsWith("@/components/common/")
      ) {
        violations.push(
          `${relativePath}: templates may import only component modules or common UI (${importPath})`,
        );
      }

      if (
        relativePath.startsWith("src/components/modules/") &&
        importPath.startsWith("@/components/templates/")
      ) {
        violations.push(
          `${relativePath}: modules must not depend on templates (${importPath})`,
        );
      }

      if (
        relativePath.startsWith("src/app/") &&
        path.basename(filePath) === "page.tsx" &&
        importPath.startsWith("@/components/") &&
        !importPath.startsWith("@/components/templates/")
      ) {
        violations.push(
          `${relativePath}: page.tsx may import only component templates (${importPath})`,
        );
      }

      if (
        relativePath.startsWith("src/app/") &&
        path.basename(filePath) === "page.tsx" &&
        (importPath.startsWith("@/components/modules/") ||
          importPath.startsWith("@/hooks/") ||
          importPath.startsWith("@/stores/"))
      ) {
        violations.push(
          `${relativePath}: page.tsx must delegate UI and state to a template (${importPath})`,
        );
      }
    }
  }

  return violations;
};

describe("frontend import boundaries", () => {
  it("コンポーネント配置とapp → templates → modules → hooks → storesの依存方向を守る", () => {
    expect(findViolations()).toEqual([]);
  });

  it("TODO routeはpage.tsxからTODO templateを直接利用する", () => {
    const todoPagePath = path.join(sourceRoot, "app/todo/page.tsx");

    expect(getImports(todoPagePath)).toContain("@/components/templates/Todo");
  });
});
