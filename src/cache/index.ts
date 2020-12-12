import type { NodeCssFactory } from "~/babel-plugin-css-tagged-template";
import { createObjectNull } from "~/utils/createObjectNull";

export const styles: {
  [className: string]: { cacheKey: string; styles: ReturnType<NodeCssFactory> };
} = createObjectNull();
