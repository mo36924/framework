import jsesc from "jsesc";
import { context } from "~/context";
import { ComponentChildren, useContext } from "~/preact-lock";
import { classesId, graphqlId, rootId } from "~/variables";

export type Props = {
  children?: ComponentChildren;
};

export const Body = (props: Props) => {
  const value = useContext(context);
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
};

if (typeof __PROD__ === "undefined") {
  Body.displayName = "Body";
}
