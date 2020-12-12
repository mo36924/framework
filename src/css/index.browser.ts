import type { CssFactory } from "~/babel-plugin-css-tagged-template";
import { classes } from "~/store";
import { getElementById } from "~/utils/getElementById";
import { styleId } from "~/variables";
import type { CssTaggedTemplate, CssTaggedTemplateValues } from "./index";
export type { CssTaggedTemplate, CssTaggedTemplateValues } from "./index";

let i = 0;
const sheet = (getElementById(styleId) as HTMLStyleElement).sheet!;

export const css = (((cssFactory: CssFactory, hash: string) => (...values: CssTaggedTemplateValues) => {
  const cacheKey = values.length ? hash + JSON.stringify(values) : hash;

  let className = classes[cacheKey];

  if (!className) {
    className = classes[cacheKey] = "_" + i++;
    cssFactory(className, ...values).forEach((rule: string) => sheet.insertRule(rule, sheet.cssRules.length));
  }

  return className;
}) as any) as CssTaggedTemplate;
