import { DocumentNode, GraphQLError, GraphQLSchema, validate as _validate } from "graphql";
import { minify } from "./minify";
import { parse } from "./parse";

const documentMap = new WeakMap<GraphQLSchema, WeakMap<DocumentNode, readonly GraphQLError[]>>();

export const validate = (schema: GraphQLSchema, query: string): readonly GraphQLError[] => {
  const minifyQuery = minify(query);
  if (!minifyQuery) {
    return [];
  }

  let documentNode: DocumentNode;
  try {
    documentNode = parse(minifyQuery);
  } catch {
    return [];
  }

  let errorMap = documentMap.get(schema);
  if (errorMap) {
    const errors = errorMap.get(documentNode);
    if (errors) {
      return errors;
    }
  } else {
    errorMap = new WeakMap();
    documentMap.set(schema, errorMap);
  }
  const errors = _validate(schema, documentNode);
  errorMap.set(documentNode, errors);
  return errors;
};
