export const objectMap = <T, K>(obj: { [P in keyof T]: T[P] }, fn: (value: T[keyof T]) => K): { [key in keyof T]: K } =>
  Object.fromEntries(Object.entries<any>(obj).map(([key, value]) => [key, fn(value)])) as any;
