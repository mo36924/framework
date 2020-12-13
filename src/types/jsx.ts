import type { JSX as JSXInternal } from "preact/jsx-runtime";

declare module "preact/jsx-runtime" {
  namespace jsx {
    type _IntrinsicElements = JSXInternal.IntrinsicElements;
    type __IntrinsicElements = {
      [P in keyof _IntrinsicElements]: Omit<_IntrinsicElements[P], "class">;
    };
    namespace JSX {
      interface Element extends JSXInternal.Element {}
      interface ElementClass extends JSXInternal.ElementClass {}
      interface ElementAttributesProperty extends JSXInternal.ElementAttributesProperty {}
      interface ElementChildrenAttribute extends JSXInternal.ElementChildrenAttribute {}
      type LibraryManagedAttributes<C, P> = JSXInternal.LibraryManagedAttributes<C, P>;
      interface IntrinsicAttributes extends JSXInternal.IntrinsicAttributes {}
      interface IntrinsicClassAttributes<T> extends preact.ClassAttributes<T> {}
      interface IntrinsicElements extends __IntrinsicElements {}
    }
  }
}
