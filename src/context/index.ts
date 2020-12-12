import { Context, createContext } from "~/preact-lock";
import type * as browserslists from "~/browserslists";
import { createObjectNull } from "~/utils/createObjectNull";

export type ContextValue = {
  url: string;
  type: keyof typeof browserslists;
  classes: {
    [cacheKey: string]: string;
  };
  graphql: {
    [query: string]: any;
  };
  prepass: boolean;
};
export const defaultContextValue = (): ContextValue => ({
  url: "/",
  type: "modern",
  classes: createObjectNull(),
  graphql: createObjectNull(),
  prepass: true,
});
export const context: Context<ContextValue> = (createContext as any)();
export const { Provider, Consumer } = context;
