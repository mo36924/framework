import type { DocumentNode, GraphQLSchema, Source } from "graphql";
import { DIAGNOSTIC_SEVERITY, validateQuery, getRange } from "graphql-language-service-interface";
import type { Diagnostic } from "vscode-languageserver-types";
import { parse } from "./parse";
import { source as _source } from "./source";

const schemaCache = new WeakMap<GraphQLSchema, WeakMap<Source, Diagnostic[]>>();

export const diagnostics = (schema: GraphQLSchema, query: string) => {
  let cache = schemaCache.get(schema);
  if (!cache) {
    cache = new WeakMap();
    schemaCache.set(schema, cache);
  }

  const source = _source(query);
  let diagnostics = cache.get(source);
  if (diagnostics) {
    return diagnostics;
  }
  let documentNode: DocumentNode;
  try {
    documentNode = parse(source);
  } catch (error) {
    const range = getRange(error.locations[0], query);
    diagnostics = [
      {
        severity: DIAGNOSTIC_SEVERITY.Error,
        message: error.message,
        source: "GraphQL: Syntax",
        range,
      },
    ];
    cache.set(source, diagnostics);
    return diagnostics;
  }

  diagnostics = validateQuery(documentNode, schema);
  cache.set(source, diagnostics);
  return diagnostics;
};
