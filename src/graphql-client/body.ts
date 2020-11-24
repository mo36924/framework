import type { GraphQLArgs } from "#types";

export const body = (args: GraphQLArgs<any>) => JSON.stringify(args);
