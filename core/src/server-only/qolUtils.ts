import express, { RequestHandler } from "express";
import { check } from "tcp-port-used";

// Request a port, if it is already in use, try the next one
// If no port is available after 50 tries, throw an error
export const requestPort = async (
  port: number,
  tries: number = 50
): Promise<number> => {
  const isUsed = await check(port);
  if (isUsed && tries == 1) {
    throw new Error(`No port available after 50 tries`);
  } else if (isUsed) {
    console.log(`Port ${port} is already in use, trying next one`);
    return requestPort(port + 1, tries - 1);
  }
  return port;
};

type RouterWrapperFunction = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;
type ErrorHandlerFunction = (
  err: unknown,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void;

export async function routerWrapper(
  func: RouterWrapperFunction,
  errorHandler?: ErrorHandlerFunction
): Promise<RequestHandler> {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await func(req, res, next);
    } catch (err) {
      if (!errorHandler) {
        return next(err);
      } else {
        return errorHandler(err, req, res, next);
      }
    }
  };
}

/**
 * Create a query string from an object
 * @param params Object containing the query parameters
 * @returns The query string
 * @example
 * createQueryString({ appCode: "BND", startDate: new Date() });
 * Returns "?appCode=BND&startDate=2021-09-01T00%3A00%3A00.000Z"
 */
export function createQueryString<T>(params: { [key: string]: T }): string {
  const queryString = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${key}=${encodeURIComponent(`${params[key]}`)}`)
    .join("&");
  if (queryString.length > 0) {
    return `?${queryString}`;
  }
  return queryString;
}
