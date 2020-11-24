import type { CompilerHost, CompilerOptions, CreateProgramOptions, Diagnostic, Program } from "typescript";
import { babelTransformFile } from "./babelTransformFile";
import { scriptRegExp, testRegExp } from "./config";
import { queue } from "./queue";
import { resolveTransformerFactory } from "./resolveTransformer";
import type typescript from "./typescript";
import { writeFile } from "./writeFile";

function createCreateProgramOptions(
  rootNames: readonly string[],
  options: CompilerOptions,
  host?: CompilerHost,
  oldProgram?: Program,
  configFileParsingDiagnostics?: readonly Diagnostic[]
) {
  return { rootNames, options, host, oldProgram, configFileParsingDiagnostics };
}

export function patchTypescript(ts: typeof typescript) {
  const createProgram = ts.createProgram;

  ts.createProgram = (
    rootNamesOrOptions: any,
    options?: any,
    host?: any,
    oldProgram?: any,
    configFileParsingDiagnostics?: any
  ) => {
    const createProgramOptions: CreateProgramOptions = Array.isArray(rootNamesOrOptions)
      ? createCreateProgramOptions(rootNamesOrOptions, options, host, oldProgram, configFileParsingDiagnostics)
      : rootNamesOrOptions;
    const compilerOptions = createProgramOptions.options;
    compilerOptions.module = ts.ModuleKind.ESNext;
    compilerOptions.sourceMap = undefined;
    compilerOptions.inlineSourceMap = true;
    const program = createProgram(createProgramOptions);
    const emit = program.emit;

    program.emit = (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, _customTransformers) => {
      return emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, {
        after: [resolveTransformerFactory as any],
        afterDeclarations: [resolveTransformerFactory],
      });
    };

    return program;
  };

  ts.sys.writeFile = (path, data, writeByteOrderMark) => {
    if (testRegExp.test(path)) {
      return;
    }

    if (scriptRegExp.test(path)) {
      babelTransformFile(path, data, writeByteOrderMark);
    } else {
      writeFile(path, data, writeByteOrderMark);
    }
  };

  const exit = ts.sys.exit;

  ts.sys.exit = (exitCode) => {
    queue.onIdle().then(
      () => exit(exitCode),
      () => exit(exitCode || 1)
    );
  };
}
