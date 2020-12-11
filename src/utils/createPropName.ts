const basePrefix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const basePrefixLength = basePrefix.length;
const baseName = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
const baseNameLength = baseName.length;

export const createPropName = (i: number) => {
  let result = basePrefix[i % basePrefixLength];
  i = Math.floor(i / basePrefixLength);

  while (i > 0) {
    result += baseName[i % baseNameLength];
    i = Math.floor(i / baseNameLength);
  }

  return result;
};
