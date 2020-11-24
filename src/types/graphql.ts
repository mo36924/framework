import type { ExecutionResult } from "graphql";

export interface GraphQL {
  default: [values: any[], data: { [key: string]: any }];
}

type GraphQLKeys = keyof GraphQL;

export type GraphQLArgs<T> = { query: string; variables?: T };

type ResultType<T extends GraphQLKeys> = ExecutionResult<GraphQL[T][1]> & { loading?: boolean };

export type UseQuery = {
  <T extends GraphQLKeys>(strings: TemplateStringsArray, ...values: GraphQL[T][0]): ResultType<T>;
  <T extends GraphQLKeys>(args: GraphQLArgs<GraphQL[T][0]>): ResultType<T>;
};

export type UseMutationReturnType<T extends GraphQLKeys> = [() => void, ResultType<T>];

export type UseMutation = {
  <T extends GraphQLKeys>(strings: TemplateStringsArray, ...values: GraphQL[T][0]): UseMutationReturnType<T>;
  <T extends GraphQLKeys>(args: GraphQLArgs<GraphQL[T][0]>): UseMutationReturnType<T>;
};
