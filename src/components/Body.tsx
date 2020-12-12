import jsesc from "jsesc";
import type { ComponentChildren } from "~/preact-lock";
import { rootId, storeId } from "~/variables";
import { Consumer } from "~/context";
import type { Store } from "~/store";

export type BodyProps = {
  children?: ComponentChildren;
};

export const Body = (props: BodyProps) => (
  <Consumer>
    {(value) => {
      if (value.prepass) {
        return <>{props.children}</>;
      }

      const store: Store = { classes: value.classes, graphql: value.graphql };

      const storeJson = {
        __html: jsesc(store, {
          isScriptContext: true,
          json: true,
        }),
      };

      return (
        <body>
          <div id={rootId}>{props.children}</div>
          <script id={storeId} type="application/json" dangerouslySetInnerHTML={storeJson} />
        </body>
      );
    }}
  </Consumer>
);

if (typeof __PROD__ === "undefined") {
  Body.displayName = "Body";
}
