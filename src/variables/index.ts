export const rootId = typeof __ROOT_ID__ === "string" ? __ROOT_ID__ : "root";
export const styleId = typeof __STYLE_ID__ === "string" ? __STYLE_ID__ : "style";
export const classesId = typeof __CLASSES_ID__ === "string" ? __CLASSES_ID__ : "classes";
export const graphqlId = typeof __GRAPHQL_ID__ === "string" ? __GRAPHQL_ID__ : "graphql";
export const baseUrl =
  typeof __BASE_URL__ === "string" ? __BASE_URL__ : typeof self !== "undefined" ? location.origin : "http://127.0.0.1";
export const graphqlEndpoint = typeof __GRAPHQL_ENDPOINT__ === "string" ? __GRAPHQL_ENDPOINT__ : baseUrl + "/graphql";
