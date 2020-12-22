import jsesc from "jsesc";
import type { ComponentChildren } from "~/preact-lock";
import { rootId, classesId, graphqlId } from "~/variables";
import { Consumer } from "~/context";

export type BodyProps = {
  children?: ComponentChildren;
};

export const Body = (props: BodyProps) => (
  <Consumer>
    {(value) => {
      if (value.prepass) {
        return <>{props.children}</>;
      }

      return (
        <body>
          <div id={rootId}>{props.children}</div>
          <script
            id={classesId}
            type="application/json"
            dangerouslySetInnerHTML={{
              __html: jsesc(value.classes, {
                isScriptContext: true,
                json: true,
              }),
            }}
          />
          <script
            id={graphqlId}
            type="application/json"
            dangerouslySetInnerHTML={{
              __html: jsesc(value.graphql, {
                isScriptContext: true,
                json: true,
              }),
            }}
          />
        </body>
      );
    }}
  </Consumer>
);

if (typeof __PROD__ === "undefined") {
  Body.displayName = "Body";
}
