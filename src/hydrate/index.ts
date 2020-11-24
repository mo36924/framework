import { hydrate as _hydrate, VNode } from "#preact-lock";
import { getElementById } from "#utils/getElementById";
import { rootId } from "#variables";

export const hydrate = (vnode: VNode) => _hydrate(vnode, getElementById(rootId));
