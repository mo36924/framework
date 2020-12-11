import { useCallback, useState } from "#preact-lock";
import type { UseMutation } from "#types";
import { body } from "./body";
import { post } from "./post";

export const useMutation: UseMutation = (args: any) => {
  const [result, setResult] = useState({});

  const callback = useCallback(() => {
    setResult({ loading: true });
    post(body(args)).then((result) => setResult(result));
  }, [args]);

  return [callback, result] as any;
};
