import type { GraphQLArgs } from "#types";

const fixedEncodeURIComponent = (str: string) =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });

export const querystring = ({ query, variables }: GraphQLArgs<any>) => {
  let qs = `query=${fixedEncodeURIComponent(query)}`;
  if (variables) {
    qs += `&variables=${fixedEncodeURIComponent(JSON.stringify(variables))}`;
  }
  return qs;
};
