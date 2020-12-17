import { context } from "~/context";
import { useContext } from "~/preact-lock";
import type { UseQuery } from "~/types";
import { get } from "./get";
import { querystring } from "./querystring";

export const useQuery: UseQuery = (args: any) => {
  const query = querystring(args);
  const graphql = useContext(context).graphql;

  const result = (graphql[query] ||= get(query).then((result) => (graphql[query] = result)));

  if (typeof result.then === "function") {
    throw result;
  }

  return result;
};
