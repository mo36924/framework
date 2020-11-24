import { storeId } from "#variables";
import { createObject } from "#utils/createObject";
import { getElementById } from "#utils/getElementById";
import type { Store } from "./index";

const store: Store = JSON.parse(getElementById(storeId).innerHTML);
export const classes = createObject(store.classes);
export const graphql = createObject(store.graphql);
