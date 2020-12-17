import type { GraphQLArgs } from "~/types";
import { encode } from "./encode";

export const querystring = ({ query, variables }: GraphQLArgs) => {
  let params = "query=" + encode(query);
  if (variables) {
    params += "&variables=" + encode(JSON.stringify(variables));
  }
  return params;
};
