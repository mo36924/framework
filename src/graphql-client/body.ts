import type { GraphQLArgs } from "#types";

export const body = (args: GraphQLArgs) => JSON.stringify(args);
