import type { GraphQLArgs } from "~/types/graphql";

export const body = (args: GraphQLArgs) => JSON.stringify(args);
