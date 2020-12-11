import type { GraphQLArgs } from "#types";

export const querystring = ({ query, variables }: GraphQLArgs) => {
  const params = new URLSearchParams({ query: query });
  if (variables) {
    params.append("variables", JSON.stringify(variables));
  }
  return params.toString();
};
