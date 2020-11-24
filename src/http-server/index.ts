import { IncomingMessage, RequestListener, Server as HttpServer, ServerOptions, ServerResponse } from "http";
import createError, { isHttpError } from "http-errors";
import { promisify } from "util";

export class Request extends IncomingMessage {}
export class Response extends ServerResponse {}
type PromiseOrValue<T> = T | Promise<T>;

export type Plugin<T = any> = (options: T) => MiddlewareFactory;
export type MiddlewareFactory = (server: Server) => PromiseOrValue<void | Middleware>;
export type Middleware = (request: Request, response: Response) => PromiseOrValue<void | false>;

export class Server extends HttpServer {
  constructor(options?: RequestListener | ServerOptions, requestListener?: RequestListener) {
    super(
      typeof options === "function"
        ? { IncomingMessage: Request, ServerResponse: Response }
        : { ...options, IncomingMessage: Request, ServerResponse: Response },
      typeof options === "function" ? options : requestListener
    );
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
    await promisify(this.listen).call(this, port);
  };
  end = async () => {
    return promisify(this.close).call(this);
  };
}
