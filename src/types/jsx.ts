import type { JSX } from "~/preact-lock";

type _IntrinsicElements = JSX.IntrinsicElements;
type __IntrinsicElements = {
  [P in keyof _IntrinsicElements]: Omit<_IntrinsicElements[P], "class">;
};

declare global {
  namespace JSX {
    interface Element extends preact.JSX.Element {}
    interface ElementClass extends preact.JSX.ElementClass {}
    interface ElementAttributesProperty extends preact.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends preact.JSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = preact.JSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicAttributes extends preact.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends preact.ClassAttributes<T> {}
    interface IntrinsicElements extends __IntrinsicElements {}
  }
}
