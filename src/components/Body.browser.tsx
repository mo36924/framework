import { Fragment } from "#preact-lock";
import type { BodyProps } from "./Body";
export type { BodyProps } from "./Body";

export const Body: typeof Fragment = typeof __PROD__ !== "undefined" ? Fragment : dev();

function dev(): any {
  function Body(props: BodyProps) {
    return props.children;
  }
  Body.displayName = "Body";
  return Body;
}
