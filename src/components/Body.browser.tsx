import { Fragment } from "~/preact-lock";
import type { Props } from "./Body";

export const Body: typeof Fragment = typeof __PROD__ !== "undefined" ? Fragment : dev();

function dev(): any {
  function Body(props: Props) {
    return <>{props.children}</>;
  }
  Body.displayName = "Body";
  return Body;
}
