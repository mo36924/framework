import "~/types/module";
import type { default as babel, PluginObj } from "@babel/core";
import cssnanoPresetAdvanced from "cssnano-preset-advanced";
import postcss, { Transformer, Plugin } from "postcss";
import nested from "postcss-nested";
import * as browserslists from "~/browserslists";
import { createHash } from "crypto";
import { packageName } from "~/constants";
import { objectMap } from "~/utils/objectMap";

export type Options = {
  tags?: string[];
  pragma?: string;
  importSource?: string;
};

type State = {
  name: string;
  statements: babel.types.Statement[];
};

type Types = keyof typeof browserslists;

export type NodeCssFactory = (
  className: string,
  ...values: any[]
) => {
  [type in Types]: string;
};

export type CssFactory = (className: string, ...values: any[]) => string[];

const getPlugins = (browserslist: string[]) => {
  const preset: { plugins: [Plugin<{}>, any][] } = cssnanoPresetAdvanced({
    autoprefixer: { overrideBrowserslist: browserslist },
  });
  const nestedPlugin = nested();
  const asyncPlugins = ["postcss-svgo"];

  const cssnanoPlugins = preset.plugins
    .map(([creator, pluginConfig]) => creator(pluginConfig))
    .filter((plugin) => !plugin.postcssPlugin || !asyncPlugins.includes(plugin.postcssPlugin));

  return [nestedPlugin, ...cssnanoPlugins];
};
const browserslistsPlugins = objectMap(browserslists, (browserslist) => getPlugins(browserslist));

const splitRulePlugin = postcss.plugin<{ separator: string }>(
  "postcss-split-rule",
  (opts = { separator: "\n" }) => (root) => {
    root.walkRules((rule) => {
      if (rule.prev()) {
        rule.raws.before = opts.separator;
      }
    });
  }
);

const templateCss = (styles: string[], wrapper = "_") => {
  let uncompiledCss = `.${wrapper}0${wrapper}{${styles[0]}`;

  for (let i = 1, len = styles.length; i < len; i++) {
    uncompiledCss += `${wrapper}${i}${wrapper}${styles[i]}`;
  }

  uncompiledCss += `}`;
  return uncompiledCss;
};

const compileCss = (
  uncompiledCss: string,
  plugins: Transformer[] = browserslistsPlugins.module,
  separator: string = ""
) =>
  postcss(separator ? [...plugins, splitRulePlugin({ separator })] : plugins)
    .process(uncompiledCss)
    .toString();

const compileRules = (
  uncompiledCss: string,
  plugins: Transformer[] = browserslistsPlugins.module,
  separator: string = ""
) => compileCss(uncompiledCss, plugins, separator).split(separator);

export default (
  { types: t }: typeof babel,
  { tags = ["css"], pragma = "css", importSource = packageName }: Options
): PluginObj<State> => {
  return {
    name: "css-tagged-template",
    visitor: {
      Program: {
        enter(path, state) {
          state.name = path.scope.generateUid(pragma);
          state.statements = [];
        },
        exit(path, state) {
          if (!state.statements.length) {
            return;
          }

          path.unshiftContainer("body", [
            t.importDeclaration(
              [t.importSpecifier(t.identifier(state.name), t.identifier(pragma))],
              t.stringLiteral(importSource)
            ),
            ...state.statements,
          ]);
        },
      },
      TaggedTemplateExpression(path, state) {
        const {
          node: { tag, quasi },
        } = path;

        if (!t.isIdentifier(tag) || !tags.includes(tag.name)) {
          return;
        }

        const styles = quasi.quasis.map(({ value: { cooked, raw } }) => cooked ?? raw);
        const css = compileCss(templateCss(styles));
        const hash = createHash("shake128", { outputLength: 6 }).update(css).digest("base64");
        const wrapperLength = css.length;
        const wrapper = "_".repeat(wrapperLength);
        const trimWrapper = (str: string) => str.slice(wrapperLength, -wrapperLength);
        const wrapRegexp = new RegExp(`${wrapper}\\d+${wrapper}`, "g");
        const separator = `/*${"*".repeat(wrapperLength)}*/`;
        const uncompiledCss = templateCss(styles, wrapper);
        const params = styles.map((_, i) => t.identifier(`_${i}`));
        const nodeCssFactory = t.arrowFunctionExpression(
          params,
          t.objectExpression(
            Object.entries(browserslistsPlugins).map(([type, plugins]) => {
              const css = compileCss(uncompiledCss, plugins, "");
              const quasis = css
                .split(wrapRegexp)
                .map((str, index, array) => t.templateElement({ raw: str }, index === array.length - 1));

              const expressions = (css.match(wrapRegexp) || []).map((m) => t.identifier(`_${trimWrapper(m)}`));
              return t.objectProperty(t.identifier(type), t.templateLiteral(quasis, expressions));
            })
          )
        );
        const rulesFactories = objectMap(browserslistsPlugins, (plugins) => {
          const rules = compileRules(uncompiledCss, plugins, separator);
          const templates = rules.map((rule) => {
            const quasis = rule
              .split(wrapRegexp)
              .map((str, index, array) => t.templateElement({ raw: str }, index === array.length - 1));

            const expressions = (rule.match(wrapRegexp) || []).map((m) => t.identifier(`_${trimWrapper(m)}`));
            return t.templateLiteral(quasis, expressions);
          });
          const arrayExpression = t.arrayExpression(templates);
          return t.arrowFunctionExpression(params, arrayExpression);
        });

        const conditional = t.conditionalExpression(
          t.binaryExpression("===", t.unaryExpression("typeof", t.identifier("self")), t.stringLiteral("undefined")),
          nodeCssFactory,
          t.conditionalExpression(
            t.binaryExpression(
              "!==",
              t.unaryExpression("typeof", t.identifier("__MODULE__")),
              t.stringLiteral("undefined")
            ),
            rulesFactories.module,
            rulesFactories.nomodule
          )
        );

        const id = path.scope.generateUidIdentifier("css");
        const key = t.stringLiteral(hash);
        path.replaceWith(t.callExpression(id, quasi.expressions as any));
        state.statements.push(
          t.variableDeclaration("const", [
            t.variableDeclarator(id, t.callExpression(t.identifier(state.name), [conditional, key])),
          ])
        );
      },
    },
  };
};
