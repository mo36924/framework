import type { UseMutation } from "~/types";

export const useMutation: UseMutation = (args: any) => {
  throw new Error("Not support ssr useMutation");
};
