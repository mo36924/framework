import { useEffect, useState } from "#preact-lock";
import { graphql } from "#store";
import type { UseQuery } from "#types";
import { get } from "./get";
import { querystring } from "./querystring";

export const useQuery: UseQuery = (args: any) => {
  const qs = querystring(args);
  const [result, setResult] = useState(graphql[qs]);

  useEffect(() => {
    result || get(qs).then(setResult);
  }, [result, qs]);

  return result || { loading: true };
};
