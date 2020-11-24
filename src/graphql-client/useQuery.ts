import { useContext } from "#preact-lock";
import type { UseQuery } from "#types";
import { querystring } from "./querystring";
import { context } from "#context";
import { get } from "./get";

export const useQuery: UseQuery = (args: any) => {
  const qs = querystring(args);
  const graphql = useContext(context).graphql;

  const result = (graphql[qs] ||= get(qs).then((result) => (graphql[qs] = result)));

  if (typeof result.then === "function") {
    throw result;
  }

  return result;
};
