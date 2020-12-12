import { createObjectNull } from "~/utils/createObjectNull";

export type Store = {
  classes: {
    [cacheKey: string]: string;
  };
  graphql: {
    [query: string]: any;
  };
};

export const classes: Store["classes"] = createObjectNull();
export const graphql: Store["graphql"] = createObjectNull();
