import { useCallback, useState } from "#preact-lock";
import type { UseMutation, UseMutationReturnType } from "#types";
import { body } from "./body";
import { post } from "./post";

export const useMutation: UseMutation = (args: any): UseMutationReturnType<any> => {
  const [result, setResult] = useState({});

  const callback = useCallback(() => {
    setResult({ loading: true });
    post(body(args)).then((result) => setResult(result));
  }, [args]);

  return [callback, result];
};
