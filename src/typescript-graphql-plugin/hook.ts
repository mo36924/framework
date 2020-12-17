import {
  DocumentNode,
  getNamedType,
  getNullableType,
  GraphQLNamedType,
  GraphQLSchema,
  isListType,
  isNullableType,
  isScalarType,
  OperationDefinitionNode,
  SelectionNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from "graphql";
import type typescript from "typescript/lib/tsserverlibrary";
import type { TaggedTemplateExpression, TypeChecker } from "typescript/lib/tsserverlibrary";
import { isGraphqlTag } from "./isGraphqlTag";
import { parse } from "./parse";
import { query } from "./query";
import { source } from "./source";
import { validate } from "./validate";

export type Checker = TypeChecker & {
  createTupleType: any;
  getLiteralType: any;
  getIntersectionType: any;
  createSyntheticExpression: any;
  getGlobalType: any;
  createSymbolTable: any;
  emptyArray: any;
  createSymbol: any;
  createAnonymousType: any;
  createArrayType: any;
  getUnionType: any;
  getNullType: any;
  getStringType: any;
  getNumberType: any;
  getBooleanType: any;
  getAnyType: any;
  getNeverType: any;
};

const schemaCache = new WeakMap<GraphQLSchema, WeakMap<DocumentNode, any[] | null>>();

const getType = (checker: Checker, namedType: GraphQLNamedType) => {
  const { getStringType, getNumberType, getBooleanType, getNeverType, getPropertyOfType, getGlobalType } = checker;
  const typeName = namedType.name;
  let type: any;
  if (isScalarType(namedType)) {
    switch (typeName) {
      case "ID":
      case "String":
        type = getStringType();
        break;
      case "Int":
      case "Float":
        type = getNumberType();
        break;
      case "Boolean":
        type = getBooleanType();
        break;
      case "Date":
        type = getGlobalType("Date");
        break;
      default:
        type = getNeverType();
        break;
    }
  } else {
    type = getPropertyOfType(getGlobalType("GraphQL"), typeName);
  }
  return type;
};

export const hook = (
  ts: typeof typescript,
  schema: GraphQLSchema,
  node: TaggedTemplateExpression,
  checker: Checker
) => {
  if (!ts.isIdentifier(node.tag) || !isGraphqlTag(node.tag.text)) {
    return;
  }
  const _query = query(ts, schema, node).query;
  let documentNode: DocumentNode;
  try {
    documentNode = parse(source(_query));
  } catch {
    return;
  }
  const errors = validate(schema, documentNode);
  if (errors.length) {
    return;
  }

  let cache = schemaCache.get(schema);
  if (!cache) {
    cache = new WeakMap();
    schemaCache.set(schema, cache);
  }

  let args = cache.get(documentNode);
  if (args !== undefined) {
    return args;
  }

  let operationDefinition: OperationDefinitionNode | undefined;
  for (const definition of documentNode.definitions) {
    if (definition.kind === "OperationDefinition") {
      if (operationDefinition === undefined) {
        operationDefinition = definition;
      } else {
        cache.set(documentNode, null);
        return;
      }
    }
  }
  if (operationDefinition === undefined) {
    cache.set(documentNode, null);
    return;
  }
  const {
    createTupleType,
    getLiteralType,
    createSymbolTable,
    createSymbol,
    createAnonymousType,
    emptyArray,
    getIntersectionType,
    createSyntheticExpression,
    createArrayType,
    getUnionType,
    getNullType,
  } = checker;
  const typeInfo = new TypeInfo(schema);
  const values: any[] = [];
  const variables: Symbol[] = [];
  const symbols: Symbol[] = [];
  const symbolsMap = new Map<readonly SelectionNode[], Symbol[]>();
  visit(
    operationDefinition,
    visitWithTypeInfo(typeInfo, {
      VariableDefinition(node) {
        const variableName = node.variable.name.value;
        const symbol = createSymbol(4, variableName);
        const inputType = typeInfo.getInputType()!;
        const nullableType = getNullableType(inputType);
        const namedType = getNamedType(nullableType);
        let type = getType(checker, namedType);
        if (isListType(nullableType)) {
          type = createArrayType(type);
        }
        if (isNullableType(inputType)) {
          type = getUnionType([type, getNullType()]);
        }
        symbol.type = type;
        values.push(type);
        variables.push(symbol);
      },
      Field: {
        enter(node, _key, parent: any) {
          if (node.selectionSet) {
            symbolsMap.set(node.selectionSet.selections, []);
            return;
          }
          const parentSymbols = symbolsMap.get(parent) || symbols;
          const fieldName = (node.alias ?? node.name).value;
          const symbol = createSymbol(4, fieldName);
          const outputType = typeInfo.getType()!;
          const namedType = getNamedType(outputType);
          let type = getType(checker, namedType);
          if (isNullableType(outputType)) {
            type = getUnionType([type, getNullType()]);
          }
          symbol.type = type;
          parentSymbols.push(symbol);
          return false;
        },
        leave(node, _key, parent: any) {
          const parentSymbols = symbolsMap.get(parent) || symbols;
          const fieldName = (node.alias ?? node.name).value;
          const symbol = createSymbol(4, fieldName);
          const outputType = typeInfo.getType()!;
          const nullableType = getNullableType(outputType);
          const selectionSymbols = symbolsMap.get(node.selectionSet!.selections)!;
          const selectionSymbolTable = createSymbolTable(selectionSymbols);
          let type = createAnonymousType(undefined, selectionSymbolTable, emptyArray, emptyArray, undefined, undefined);
          if (isListType(nullableType)) {
            type = createArrayType(type);
          }
          if (isNullableType(outputType)) {
            type = getUnionType([type, getNullType()]);
          }
          symbol.type = type;
          parentSymbols.push(symbol);
        },
      },
    })
  );

  const valuesSymbol = createSymbol(4, "_values");
  valuesSymbol.type = createTupleType(values, undefined);
  const variablesSymbol = createSymbol(4, "_variables");
  const variablesSymbolTable = createSymbolTable(variables);
  variablesSymbol.type = createAnonymousType(
    undefined,
    variablesSymbolTable,
    emptyArray,
    emptyArray,
    undefined,
    undefined
  );
  const returnSymbol = createSymbol(4, "_return");
  const returnSymbolTable = createSymbolTable(symbols);
  returnSymbol.type = createAnonymousType(undefined, returnSymbolTable, emptyArray, emptyArray, undefined, undefined);

  const template = node.template;
  args = [];
  if (ts.isNoSubstitutionTemplateLiteral(template)) {
    const arrayType = createTupleType([getLiteralType(template.text)], undefined, true);
    const rawType = createTupleType([getLiteralType(template.rawText)], undefined, true);
    const rawSymbol = createSymbol(4 /* Property */, "raw", 8 /* Readonly */);
    rawSymbol.type = rawType;
    const symbolTable = createSymbolTable([rawSymbol, valuesSymbol, variablesSymbol, returnSymbol]);
    const objectType = createAnonymousType(undefined, symbolTable, emptyArray, emptyArray, undefined, undefined);
    const stringsType = getIntersectionType([arrayType, objectType]);
    args.push(createSyntheticExpression(template, stringsType));
  } else {
    const texts = [getLiteralType(template.head.text)];
    const rawTexts = [getLiteralType(template.head.rawText)];
    for (const span of template.templateSpans) {
      texts.push(getLiteralType(span.literal.text));
      rawTexts.push(getLiteralType(span.literal.rawText));
      args.push(span.expression);
    }
    const arrayType = createTupleType(texts, undefined, true);
    const rawType = createTupleType(rawTexts, undefined, true);
    const rawSymbol = createSymbol(4 /* Property */, "raw", 8 /* Readonly */);
    rawSymbol.type = rawType;
    const symbolTable = createSymbolTable([rawSymbol, valuesSymbol, variablesSymbol, returnSymbol]);
    const objectType = createAnonymousType(undefined, symbolTable, emptyArray, emptyArray, undefined, undefined);
    const stringsType = getIntersectionType([arrayType, objectType]);
    args.unshift(createSyntheticExpression(template, stringsType));
  }
  cache.set(documentNode, args);
  return args;
};
