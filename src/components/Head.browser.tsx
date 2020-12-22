import { Fragment } from "~/preact-lock";
import type { Props } from "./Head";

export const Head: typeof Fragment = typeof __PROD__ === "boolean" ? Fragment : dev();

function dev(): any {
  function Head(props: Props) {
    return <>{props.children}</>;
  }
  Head.displayName = "Head";
  return Head;
}
