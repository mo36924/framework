import prepass from "@mo36924/preact-ssr-prepass";
import { IncomingMessage, Server as HttpServer, ServerOptions, ServerResponse } from "http";
import createError, { isHttpError } from "http-errors";
import renderToString from "preact-render-to-string";
import { promisify } from "util";
import { defaultContextValue, Provider } from "~/context";
import type { JSX } from "~/preact-lock";
import { parse as parseQuery } from "querystring";
import { parse as parseUrl, UrlWithStringQuery } from "url";

export class Request extends IncomingMessage {
  get protocol() {
    return this.headers["x-forwarded-proto"] === "https" ? "https:" : "http:";
  }
  get hostname() {
    return this.headers.host ?? "localhost";
  }
  get port() {
    return "";
  }
  get host() {
    return this.port === "" ? this.hostname : `${this.hostname}:${this.port}`;
  }
  get path() {
    return this.url ?? "/";
  }
  get href() {
    return `${this.protocol}//${this.host}${this.path}`;
  }
  private __url?: UrlWithStringQuery = undefined;
  private get _url() {
    return this.__url || (this.__url = parseUrl(this.path));
  }
  get pathname() {
    return this._url.pathname ?? "/";
  }
  get query() {
    return this._url.query ?? "";
  }
  get search() {
    return this._url.search ?? "";
  }
  get params() {
    return parseQuery(this.query);
  }
  get searchParams() {
    return new URLSearchParams(this.query);
  }
  // private $$path?: ReturnType<typeof parsePath>;
  // get $path() {
  //   if (this.$$path === undefined) {
  //     this.$$path = parsePath(this.pathname);
  //   }

  //   return this.$$path;
  // }
  // get dir() {
  //   return this.$path.dir;
  // }
  // get base() {
  //   return this.$path.base;
  // }
  // get name() {
  //   return this.$path.name;
  // }
  // get ext() {
  //   return this.$path.ext;
  // }
  // get userAgent() {
  //   return this.headers["user-agent"];
  // }
  // get modern() {
  //   return matchesUA(this.userAgent ?? "", { browsers: browserslist.modern, allowHigherVersions: true });
  // }
  // get module() {
  //   return matchesUA(this.userAgent ?? "", { browsers: browserslist.module, allowHigherVersions: true });
  // }
  // get nomodule() {
  //   return !this.module;
  // }
  // get contentType() {
  //   return this.headers["content-type"];
  // }
  // private __contentType?: ParsedMediaType;
  // get _contentType() {
  //   if (this.__contentType === undefined) {
  //     this.__contentType = parseContentType(
  //       mime.contentType(this.contentType || this.ext) || "text/plain; charset=utf-8"
  //     );
  //   }

  //   return this.__contentType;
  // }
  // get type() {
  //   return this._contentType.type;
  // }
  // get charset() {
  //   return this._contentType.parameters.charset;
  // }
  // acceptEncoding(encoding: "gzip" | "br") {
  //   return this.headers["accept-encoding"]?.includes(encoding);
  // }
  // _cookie?: Cookie;
  // get cookie(): Cookie {
  //   return this._cookie || (this._cookie = this.headers.cookie ? parse(this.headers.cookie) : {});
  // }
  // private _session?: Promise<Session | undefined>;
  // private async __session() {
  //   if (!this.cookie.sid) {
  //     return;
  //   }

  //   const data = await cluster.get(this.cookie.sid);
  //   const session = data ? (JSON.parse(data) as Session) : undefined;
  //   return session;
  // }
  // session() {
  //   return this._session || (this._session = this.__session());
  // }
  // private _accepts?: Accepts;
  // get accepts() {
  //   return this._accepts || (this._accepts = accepts(this));
  // }
}
export class Response extends ServerResponse {
  constructor(public request: Request) {
    super(request);
  }
  async render(vnode: JSX.Element) {
    const app = <Provider value={defaultContextValue()}>{vnode}</Provider>;
    await prepass(app);
    const html = "<!DOCTYPE html>" + renderToString(app);
    this.end(html);
  }
}
type PromiseOrValue<T> = T | Promise<T>;

export type Plugin<T = any> = (options: T) => MiddlewareFactory;
export type MiddlewareFactory = (server: Server) => PromiseOrValue<void | Middleware>;
export type Middleware = (request: Request, response: Response) => PromiseOrValue<void | false>;

export class Server extends HttpServer {
  constructor(options?: ServerOptions) {
    super({ ...options, IncomingMessage: Request, ServerResponse: Response });
    this.on("request", this.requestListener);
  }
  middlewareFactories: MiddlewareFactory[] = [];
  middleware: Middleware[] = [];
  use = (middlewareFactory: MiddlewareFactory) => {
    this.middlewareFactories.push(middlewareFactory);
  };
  errors: Middleware[] = [];
  errorLength = 0;
  onError = (middleware: Middleware) => {
    this.errors.push(middleware);
  };
  requestListener = async (request: Request, response: Response) => {
    try {
      for (const middleware of this.middleware) {
        let result = middleware(request, response);

        if (result && typeof result.then === "function") {
          result = await result;
        }

        if (result === false || response.writableEnded) {
          return;
        }
      }
    } catch (err) {
      const httpError = isHttpError(err) ? err : createError();

      try {
        for (const error of this.errors) {
          let result = error(request, response);

          if (result && typeof result.then === "function") {
            result = await result;
          }

          if (result === false || response.writableEnded) {
            return;
          }
        }
      } catch {}

      if (!response.headersSent) {
        response.writeHead(httpError.statusCode, httpError.message, httpError.headers);
      }

      if (!response.writableEnded) {
        response.end(httpError.body);
      }

      return;
    }

    if (!response.headersSent) {
      response.statusCode = 404;
    }

    if (!response.writableEnded) {
      response.end();
    }
  };
  start = async (port = parseInt(process.env.PORT as any, 10) || 8080) => {
    const middleware = await Promise.all(this.middlewareFactories.map((middlewareFactory) => middlewareFactory(this)));
    this.middleware = middleware.filter((middleware): middleware is Middleware => !!middleware);
    await promisify(this.listen.bind(this, port))();
  };
  end = async () => {
    return promisify(this.close.bind(this))();
  };
}
