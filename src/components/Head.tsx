import jsesc from "jsesc";
import { styleId } from "#variables";
import { Consumer } from "#context";
import { styles } from "#cache";
import type { ComponentChildren } from "#preact-lock";

export type HeadProps = {
  children?: ComponentChildren;
};

export const Head = (props: HeadProps) => (
  <Consumer>
    {(value) => {
      if (value.prepass) {
        return props.children;
      }

      const type = value.type;
      const scriptSrc = `/${type}.js`;
      const isNoModule = type === "nomodule";
      const scriptType = isNoModule ? undefined : "module";
      const scriptNoModule = isNoModule || undefined;
      const styleContent = {
        __html: jsesc(
          Object.values(value.classes)
            .map((className) => styles[className].styles[type])
            .join(""),
          { isScriptContext: true }
        ),
      };

      return (
        <head>
          <meta charSet="utf-8" />
          {isNoModule ? <meta httpEquiv="X-UA-Compatible" content="IE=edge" /> : null}
          {props.children}
          <script src={scriptSrc} type={scriptType} noModule={scriptNoModule} defer={scriptNoModule} />
          <style id={styleId} dangerouslySetInnerHTML={styleContent} />
        </head>
      );
    }}
  </Consumer>
);
