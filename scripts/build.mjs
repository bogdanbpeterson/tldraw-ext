// @ts-check

import * as esbuild from "esbuild";
import { cp, readFileSync, rm } from "fs";
import { dirname } from "path";
import typescript from "typescript";

/**
 * Reads typescript config
 * @param {string} configPath
 * @returns {{options: typescript.CompilerOptions, fileNames: string[]}}
 */
const readConfig = (configPath) => {
  const rawConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  const basePath = dirname(configPath);
  const { options, fileNames, errors } = typescript.parseJsonConfigFileContent(
    rawConfig,
    typescript.sys,
    basePath,
  );

  if (errors && errors.length) {
    throw new Error(
      typescript.formatDiagnostics(errors, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: process.cwd,
        getNewLine: () => typescript.sys.newLine,
      }),
    );
  }

  return { options, fileNames };
};

/**
 * Does type checking on ts files
 * @returns {boolean}
 */
const typeCheck = () => {
  const { options, fileNames } = readConfig("./tsconfig.json");
  const program = typescript.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  let hasErrors = false;

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.category === typescript.DiagnosticCategory.Error) {
      hasErrors = true;
    }

    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start ?? 0,
      );
      const message = typescript.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1
        }): ${message}`,
      );
    } else {
      console.log(
        typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    }
  });

  return !hasErrors;
};

const buildApp = async () => {
  await esbuild.build({
    entryPoints: ["./src/app/index.tsx"],
    outfile: "./dist/app/index.js",
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "esm",
    target: "chrome100",
  });
};

const buildExt = async () => {
  await esbuild.build({
    entryPoints: ["./src/ext/main.ts"],
    outfile: "./dist/main.js",
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "esm",
    target: "chrome100",
  });
};

const copyAssets = () => {
  cp("./public/", "./dist/", { recursive: true }, (err) => {
    if (err) console.error(err);
  });
};

rm("./dist", { recursive: true, force: true }, (err) => {
  if (err) console.error(err);
});

const isTypeCheckOk = typeCheck();
if (!isTypeCheckOk) process.exit(1);

await buildApp();
await buildExt();

copyAssets();
