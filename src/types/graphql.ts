import type { ExecutionResult } from "graphql";

type GraphQLTemplateType = {
  _values?: any[];
  _variables?: any;
  _return?: any;
};

export type GraphQLTemplateStringsArray = TemplateStringsArray & GraphQLTemplateType;

export type GraphQLTemplateValues<T extends GraphQLTemplateType> = T["_values"] extends any[] ? T["_values"] : [];

export type GraphQLExecutionResult<T extends GraphQLTemplateType> = ExecutionResult<
  T["_return"] extends {} ? T["_return"] : {}
>;

export type GraphQLArgs = { query: string; variables?: any } & GraphQLTemplateType;

export type UseQueryExecutionResult<T extends GraphQLTemplateType> = GraphQLExecutionResult<T> & {
  loading: boolean;
};
export type UseQuery = {
  <T extends GraphQLTemplateStringsArray>(strings: T, ...values: GraphQLTemplateValues<T>): UseQueryExecutionResult<T>;
  <T extends GraphQLArgs>(args: T): UseQueryExecutionResult<T>;
};

export type UseMutationExecutionResult<T extends GraphQLTemplateType> = [() => void, UseQueryExecutionResult<T>];
export type UseMutation = {
  <T extends GraphQLTemplateStringsArray>(strings: T, ...values: GraphQLTemplateValues<T>): UseMutationExecutionResult<
    T
  >;
  <T extends GraphQLArgs>(args: T): UseMutationExecutionResult<T>;
};
