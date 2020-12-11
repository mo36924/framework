import { stripIgnoredCharacters } from "graphql";

let cache: { [query: string]: string | undefined } = Object.create(null);
let count = 0;

export const minify = (query: string) => {
  if (query in cache) {
    return cache[query];
  }

  if (count > 1000) {
    cache = Object.create(null);
    count = 0;
  }

  let minifyQuery: string | undefined;
  try {
    minifyQuery = stripIgnoredCharacters(query);
  } catch {}

  cache[query] = minifyQuery;
  count++;

  return minifyQuery;
};
