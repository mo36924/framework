export const typeMap = Object.assign(Object.create(null), {
  Int: "number",
  Float: "number",
  String: "string",
  Boolean: "boolean",
  ID: "string",
  Date: "Date",
});

export function getType(type: string) {
  return typeMap[type] || "unknown";
}
