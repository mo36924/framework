import { Fragment } from "~/preact-lock";
import type { HeadProps } from "./Head";
export type { HeadProps } from "./Head";
export const Head: typeof Fragment = typeof __PROD__ === "boolean" ? Fragment : dev();

function dev(): any {
  function Head(props: HeadProps) {
    return props.children;
  }
  Head.displayName = "Head";
  return Head;
}
