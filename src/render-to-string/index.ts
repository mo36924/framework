import type { VNode } from "~/preact-lock";
import { renderToString as _renderToString } from "preact-render-to-string";

export const renderToString = (vnode: VNode) => _renderToString(vnode);
