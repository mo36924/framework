import { DocumentNode, parse as _parse, GraphQLError } from "graphql";

let cache: { [query: string]: DocumentNode | GraphQLError } = Object.create(null);
let count = 0;

export const parse = (query: string) => {
  let documentNode = cache[query];
  if (documentNode) {
    if (documentNode instanceof Error) {
      throw documentNode;
    }
    return documentNode;
  }

  if (count > 1000) {
    cache = Object.create(null);
    count = 0;
  }

  try {
    documentNode = _parse(query);
  } catch (err) {
    cache[query] = err;
    throw err;
  }

  cache[query] = documentNode;
  count++;

  return documentNode;
};
