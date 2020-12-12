import { graphqlEndpoint } from "~/variables";
import { fetch } from "./fetch";

export const post = (body: string) =>
  fetch(graphqlEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body });
