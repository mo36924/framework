import type { NodeCssFactory } from "~/babel-plugin-css-tagged-template";
import { createClassName } from "~/utils/createClassName";
import { classes } from "~/store";
import { styles } from "~/cache";

export type CssTaggedTemplate = (strings: TemplateStringsArray, ...values: CssTaggedTemplateValues) => string;
export type CssTaggedTemplateValues = (string | number)[];

let i = 0;

export const css = (((cssFactory: NodeCssFactory, hash: string) => (...values: CssTaggedTemplateValues) => {
  const cacheKey = values.length ? hash + JSON.stringify(values) : hash;

  let className = classes[cacheKey];

  if (!className) {
    className = classes[cacheKey] = createClassName(i++);
    styles[className] = { cacheKey, styles: cssFactory(className, ...values) };
  }

  return className;
}) as any) as CssTaggedTemplate;
