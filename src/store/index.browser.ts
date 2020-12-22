import { classesId, graphqlId } from "~/variables";
import { createObject } from "~/utils/createObject";
import { getElementById } from "~/utils/getElementById";

export const classes = createObject(JSON.parse(getElementById(classesId).innerHTML));
export const graphql = createObject(JSON.parse(getElementById(graphqlId).innerHTML));
