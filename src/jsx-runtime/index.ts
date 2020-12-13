import "../types";
import { jsx as _jsx, Fragment } from "preact/jsx-runtime";
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

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
