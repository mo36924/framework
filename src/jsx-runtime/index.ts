import { jsx as _jsx, Fragment, JSX as JSXInternal } from "preact/jsx-runtime";
import { Consumer } from "~/context";
import { styles } from "~/cache";

const jsx: typeof _jsx = (type: any, props: any, ...args: any[]) => {
  if (!props) {
    return _jsx(type, props, ...args);
  }
  const className: undefined | string = props.className || props.class;
  if (!className) {
    return _jsx(type, props, ...args);
  }
  const classNames = className
    .trim()
    .split(/ +/)
    .filter((className) => styles[className]);

  if (!classNames.length) {
    return _jsx(type, props, ...args);
  }

  return _jsx(Consumer, {
    children: (value) => {
      classNames.forEach((className) => {
        value.classes[styles[className].cacheKey] = className;
      });
      return _jsx(type, props, ...args);
    },
  });
};
type _IntrinsicElements = JSXInternal.IntrinsicElements;
type __IntrinsicElements = {
  [P in keyof _IntrinsicElements]: Omit<_IntrinsicElements[P], "class">;
};
declare namespace JSX {
  interface Element extends JSXInternal.Element {}
  interface ElementClass extends JSXInternal.ElementClass {}
  interface ElementAttributesProperty extends JSXInternal.ElementAttributesProperty {}
  interface ElementChildrenAttribute extends JSXInternal.ElementChildrenAttribute {}
  type LibraryManagedAttributes<C, P> = JSXInternal.LibraryManagedAttributes<C, P>;
  interface IntrinsicAttributes extends JSXInternal.IntrinsicAttributes {}
  interface IntrinsicClassAttributes<T> extends preact.ClassAttributes<T> {}
  interface IntrinsicElements extends __IntrinsicElements {}
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
export type { JSX };
