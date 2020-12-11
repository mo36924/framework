import {
  DocumentNode,
  getNamedType,
  getNullableType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isNullableType,
  isScalarType,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from "graphql";
import { minify } from "./minify";
import { parse } from "./parse";
import { getType } from "./typeMap";

type QueryType = {
  values: string;
  returnType: string;
};

const defaultType: QueryType = {
  values: "[]",
  returnType: "{}",
};

const schemaMap = new WeakMap<GraphQLSchema, WeakMap<DocumentNode, QueryType>>();

export function resolveQueryType(schema: GraphQLSchema, query: string) {
  const minifyQuery = minify(query);
  if (!minifyQuery) {
    return defaultType;
  }

  let documentNode: DocumentNode;
  try {
    documentNode = parse(minifyQuery);
  } catch {
    return defaultType;
  }

  let documentMap = schemaMap.get(schema);
  if (documentMap) {
    const queryType = documentMap.get(documentNode);
    if (queryType) {
      return queryType;
    }
  } else {
    documentMap = new WeakMap();
    schemaMap.set(schema, documentMap);
  }

  const operationDefinition = documentNode.definitions.find((definition) => definition.kind === "OperationDefinition")!;
  const typeInfo = new TypeInfo(schema);
  let values = "[";
  let returnType = "{";
  visit(
    operationDefinition,
    visitWithTypeInfo(typeInfo, {
      VariableDefinition() {
        const inputType = typeInfo.getInputType()!;
        const nullableType = getNullableType(inputType);
        const namedType = getNamedType(nullableType);
        let valueType = namedType.name;
        if (isScalarType(namedType)) {
          valueType = getType(valueType);
        } else {
          valueType = "GraphQL." + valueType;
        }
        if (isListType(nullableType)) {
          valueType += "[]";
        }
        if (isNullableType(inputType)) {
          valueType += "|null";
        }
        values += values === "[" ? valueType : "," + valueType;
      },
      Field: {
        enter(node) {
          returnType += `${(node.alias ?? node.name).value}:`;
          if (node.selectionSet) {
            returnType += "{";
          } else {
            const outputType = typeInfo.getType()!;
            if (isNonNullType(outputType)) {
              returnType += getType(outputType.ofType.toString()) + ";";
            } else {
              returnType += getType(outputType.toString()) + "|null;";
            }
            return false;
          }
        },
        leave() {
          const outputType = typeInfo.getType()!;
          returnType += "}";
          if (isNonNullType(outputType)) {
            if (isListType(outputType.ofType)) {
              returnType += "[]";
            }
          } else {
            returnType += "|null";
          }
        },
      },
    })
  );
  values += "]";
  returnType += "}";
  const queryType: QueryType = {
    values,
    returnType,
  };
  documentMap.set(documentNode, queryType);
  return queryType;
}
