import type { DocumentNode, GraphQLError, GraphQLSchema } from "graphql";
import { getRange, validateQuery } from "graphql-language-service-interface";
import { DiagnosticSeverity, Diagnostic } from "vscode-languageserver-types";
import { parse } from "./parse";

const errorMap = new WeakMap<GraphQLError, Diagnostic[]>();
const documentMap = new WeakMap<DocumentNode, Diagnostic[]>();
const schemaMap = new WeakMap<GraphQLSchema, WeakMap<DocumentNode, Diagnostic[]>>();

export const getDiagnostics = (query: string, schema?: GraphQLSchema) => {
  let documentNode: DocumentNode;
  try {
    documentNode = parse(query);
  } catch (error) {
    let diagnostics = errorMap.get(error);
    if (!diagnostics) {
      diagnostics = [
        {
          severity: DiagnosticSeverity.Error,
          message: error.message,
          source: "GraphQL: Syntax",
          range: getRange(error.locations[0], query),
        },
      ];
      errorMap.set(error, diagnostics);
    }
    return diagnostics;
  }
  if (!schema) {
    let diagnostics = documentMap.get(documentNode);
    if (!diagnostics) {
      diagnostics = validateQuery(documentNode);
      documentMap.set(documentNode, diagnostics);
    }
    return diagnostics;
  }

  let _documentMap = schemaMap.get(schema);
  if (_documentMap) {
    const diagnostics = _documentMap.get(documentNode);
    if (diagnostics) {
      return diagnostics;
    }
  } else {
    _documentMap = new WeakMap();
    schemaMap.set(schema, documentMap);
  }
  const diagnostics = validateQuery(documentNode, schema);
  _documentMap.set(documentNode, diagnostics);
  return diagnostics;
};
