import { graphqlEndpoint } from "#variables";
import { fetch } from "./fetch";

export const get = (queryString: string) => fetch(`${graphqlEndpoint}?${queryString}`);
