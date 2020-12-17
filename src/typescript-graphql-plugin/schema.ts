import {
  getNamedType,
  getNullableType,
  GraphQLInputField,
  GraphQLInputType,
  GraphQLSchema,
  isInputObjectType,
  isListType,
  isNullableType,
  isScalarType,
} from "graphql";
import { getType } from "./typeMap";

export const schema = (schema: GraphQLSchema) => {
  const typeMap = schema.getTypeMap();
  let schemaType = "declare global { namespace GraphQL {";
  for (const value of Object.values(typeMap)) {
    const typeName = value.name;
    if (typeName.startsWith("__")) {
      continue;
    }
    if (isInputObjectType(value)) {
      schemaType += `interface ${typeName} {`;
      const fields = value.getFields();
      for (const field of Object.values(fields)) {
        schemaType += resolveFieldType(field);
      }
      schemaType += "};";
      continue;
    }
  }
  schemaType += "}}";
  return schemaType;
};

function resolveFieldType({ name, type }: GraphQLInputField) {
  return `${name}:${resolveReturnType(type)};`;
}

function resolveReturnType(type: GraphQLInputType) {
  const nullableType = getNullableType(type);
  const namedType = getNamedType(nullableType);
  let returnType = namedType.name;
  if (isScalarType(namedType)) {
    returnType = getType(returnType);
  }
  if (isListType(nullableType)) {
    returnType += "[]";
  }
  if (isNullableType(type)) {
    returnType += "|null";
  }
  return returnType;
}
