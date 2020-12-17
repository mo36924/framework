import { DocumentNode, parse as _parse, GraphQLError, Source } from "graphql";
import { source as _source } from "./source";

const cache = new WeakMap<Source, DocumentNode | GraphQLError>();

export const parse = (source: Source) => {
  let documentNode = cache.get(source);
  if (documentNode) {
    if (documentNode instanceof Error) {
      throw documentNode;
    }
    return documentNode;
  }

  try {
    documentNode = _parse(source);
  } catch (err) {
    cache.set(source, err);
    throw err;
  }

  cache.set(source, documentNode);
  return documentNode;
};
