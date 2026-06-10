import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

describe("Todo型の公開契約", () => {
  it("Orval生成DTOの別名となるFE独自型を公開しない", () => {
    const todoTypesPath = path.resolve(process.cwd(), "src/types/todo.ts");
    const configPath = path.resolve(process.cwd(), "tsconfig.json");
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      process.cwd(),
    );
    const program = ts.createProgram({
      rootNames: parsedConfig.fileNames,
      options: parsedConfig.options,
    });
    const sourceFile = program.getSourceFile(todoTypesPath);

    expect(sourceFile).toBeDefined();

    const checker = program.getTypeChecker();
    const moduleSymbol = sourceFile
      ? checker.getSymbolAtLocation(sourceFile)
      : undefined;
    const generatedModelPath = `${path.sep}src${path.sep}apis${path.sep}generated${path.sep}model${path.sep}`;
    const isGeneratedModelDeclaration = (declaration: ts.Declaration) =>
      declaration.getSourceFile().fileName.includes(generatedModelPath);
    const referencesGeneratedModel = (node: ts.Node) => {
      let found = false;

      const visit = (current: ts.Node) => {
        if (found) {
          return;
        }

        if (
          ts.isImportTypeNode(current) &&
          ts.isLiteralTypeNode(current.argument) &&
          ts.isStringLiteral(current.argument.literal) &&
          current.argument.literal.text.includes("/apis/generated/model")
        ) {
          found = true;
          return;
        }

        if (ts.isIdentifier(current)) {
          const symbol = checker.getSymbolAtLocation(current);
          const target =
            symbol && symbol.flags & ts.SymbolFlags.Alias
              ? checker.getAliasedSymbol(symbol)
              : symbol;

          if (target?.declarations?.some(isGeneratedModelDeclaration)) {
            found = true;
            return;
          }
        }

        ts.forEachChild(current, visit);
      };

      visit(node);
      return found;
    };
    const generatedDtoExports = moduleSymbol
      ? checker
          .getExportsOfModule(moduleSymbol)
          .filter((symbol) =>
            symbol.declarations?.some((declaration) => {
              if (isGeneratedModelDeclaration(declaration)) {
                return true;
              }

              if (ts.isTypeAliasDeclaration(declaration)) {
                return referencesGeneratedModel(declaration.type);
              }

              if (ts.isExportSpecifier(declaration)) {
                const exportDeclaration = declaration.parent.parent;
                return (
                  (exportDeclaration.moduleSpecifier &&
                    ts.isStringLiteral(exportDeclaration.moduleSpecifier) &&
                    exportDeclaration.moduleSpecifier.text.includes(
                      "/apis/generated/model",
                    )) ||
                  referencesGeneratedModel(
                    declaration.propertyName ?? declaration.name,
                  )
                );
              }

              return false;
            }),
          )
          .map((symbol) => symbol.getName())
      : [];

    expect(generatedDtoExports).toEqual([]);
  });
});
