import type { ExecutionResult } from "graphql";
import type { Join, ToArray } from "./utils";

export type GraphQLArgs<T = {}> = { query: string; variables?: T };

export interface UseQueryTypes {}
type UseQueryKeys = keyof UseQueryTypes;
type UseQueryKey<T extends TemplateStringsArray> = Join<ToArray<T>>;
type UseQueryReturnType<T> = ExecutionResult<T> & { loading?: boolean };
export type UseQuery = {
  <T extends TemplateStringsArray>(
    strings: T,
    ...values: UseQueryKey<T> extends UseQueryKeys ? UseQueryTypes[UseQueryKey<T>][0] : T[]
  ): UseQueryKey<T> extends UseQueryKeys ? UseQueryReturnType<UseQueryTypes[UseQueryKey<T>][1]> : unknown;
  <T = {}>(args: GraphQLArgs<any>): UseQueryReturnType<T>;
};

export interface UseMutationTypes {}
type UseMutationKeys = keyof UseQueryTypes;
type UseMutationKey<T extends TemplateStringsArray> = Join<ToArray<T>>;
type UseMutationReturnType<T> = [() => void, UseQueryReturnType<T>];
export type UseMutation = {
  <T extends TemplateStringsArray>(
    strings: T,
    ...values: UseMutationKey<T> extends UseMutationKeys ? UseMutationTypes[UseMutationKey<T>][0] : T[]
  ): UseMutationKey<T> extends UseMutationKeys
    ? UseMutationReturnType<UseMutationTypes[UseMutationKey<T>][1]>
    : unknown;
  <T = {}>(args: GraphQLArgs<any>): UseMutationReturnType<T>;
};
