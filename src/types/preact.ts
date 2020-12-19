import type {} from "preact";

declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      noModule?: boolean;
    }
  }
}
