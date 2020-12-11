// import { jsx, Fragment } from "./index.browser";
// import { Consumer } from "#context";
// import { styles } from "#cache";

// const createVNode: typeof jsx = (type: any, props: any, key: any) => {
//   if (!props) {
//     return jsx(type, props, key);
//   }
//   const className: undefined | string = props.className || props.class;
//   if (!className) {
//     return jsx(type, props, key);
//   }
//   const classNames = className
//     .trim()
//     .split(/ +/)
//     .filter((className) => styles[className]);

//   if (!classNames.length) {
//     return jsx(type, props, key);
//   }

//   return jsx(Consumer, {
//     children: (value) => {
//       classNames.forEach((className) => {
//         value.classes[styles[className].cacheKey] = className;
//       });
//       return jsx(type, props, key);
//     },
//   });
// };

// export { createVNode as jsx, createVNode as jsxs, createVNode as jsxDEV, Fragment };

export { jsx, jsxs, jsxDEV, Fragment } from "preact/jsx-runtime";
