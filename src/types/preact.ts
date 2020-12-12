import type {} from "~/preact-lock";

declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      noModule?: boolean;
    }
  }
}
