import type { ExecutionResult } from "graphql";
import { fetch as _fetch, RequestInit } from "~/fetch";

export const fetch = (url: string, init?: RequestInit): Promise<ExecutionResult> =>
  _fetch(url, init)
    .then((res) => res.json())
    .catch((error) => ({
      errors: [{ message: `${error}` }],
    }));
