import { useEffect, useState } from "~/preact-lock";
import { graphql } from "~/store";
import type { UseQuery } from "~/types";
import { get } from "./get";
import { querystring } from "./querystring";

export const useQuery: UseQuery = (args: any) => {
  const query = querystring(args);
  const [result, setResult] = useState(graphql[query]);

  useEffect(() => {
    result || get(query).then(setResult);
  }, [result, query]);

  return result || { loading: true };
};
