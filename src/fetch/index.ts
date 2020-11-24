import { resolve } from "url";
import nodeFetch, { Headers as _Headers, Request as _Request, Response as _Response } from "node-fetch";
import { baseUrl } from "#variables";

export const Headers: typeof globalThis.Headers = _Headers as any;
export const Request: typeof globalThis.Request = _Request as any;
export const Response: typeof globalThis.Request = _Response as any;
export type RequestInfo = globalThis.RequestInfo;
export type RequestInit = globalThis.RequestInit;

export const fetch: typeof globalThis.fetch = (input: any, init?: any): any => {
  if (typeof input === "string") {
    input = resolve(baseUrl, input);
  } else if ("href" in input) {
    input = input.href;
  } else {
    input = new Request(resolve(baseUrl, input.url), input);
  }

  return nodeFetch(input as any, init);
};
