import jsesc from "jsesc";
import { styles } from "~/cache";
import { context } from "~/context";
import { ComponentChildren, useContext } from "~/preact-lock";
import { styleId } from "~/variables";

export type Props = {
  children?: ComponentChildren;
};

export const Head = (props: Props) => {
  const value = useContext(context);
  if (value.prepass) {
    return <>{props.children}</>;
  }
  const type = value.type;
  const isNoModule = type === "nomodule";
  const styleContent = {
    __html: jsesc(
      Object.values(value.classes)
        .map((className) => styles[className].styles[type])
        .join(""),
      { isScriptContext: true }
    ),
  };

  return isNoModule ? (
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      {props.children}
      <script src="/s.js" defer />
      <script src="/nomodule.js" defer id="main" />
      <style id={styleId} dangerouslySetInnerHTML={styleContent} />
    </head>
  ) : (
    <head>
      <meta charSet="utf-8" />
      {props.children}
      <script src="/index.js" type="module" />
      <style id={styleId} dangerouslySetInnerHTML={styleContent} />
    </head>
  );
};
