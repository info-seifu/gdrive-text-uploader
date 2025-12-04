/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'express' {
  export type Request = {
    body?: any;
    session?: any;
    file?: any;
    query?: any;
  } & Record<string, any>;
  export type Response = {
    json: (body: any) => Response;
    status: (code: number) => Response;
    redirect: (status: number | string, url?: string) => void;
  } & Record<string, any>;
  export type NextFunction = (err?: unknown) => void;
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;
  export interface Router {
    get: (...args: any[]) => Router;
    post: (...args: any[]) => Router;
    use: (...args: any[]) => Router;
  }
  interface ExpressConstructor {
    (): any;
    Router(): Router;
    json(): RequestHandler;
  }
  const exp: ExpressConstructor;
  export default exp;
}

declare module 'express-session' {
  import type { RequestHandler } from 'express';
  export interface SessionData {
    userEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
    [key: string]: any;
  }
  export type Session = SessionData & {
    destroy(callback: (err?: unknown) => void): void;
  };
  export interface SessionOptions {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie?: any;
  }
  const session: (options: SessionOptions) => RequestHandler;
  export default session;
}

declare module 'cors' {
  import type { RequestHandler } from 'express';
  const cors: (options?: Record<string, any>) => RequestHandler;
  export default cors;
}

declare module 'dotenv' {
  export function config(options?: { path?: string }): void;
}

declare module 'fs' {
  export const existsSync: (path: string) => boolean;
  export const mkdirSync: (path: string, options?: Record<string, any>) => void;
}

declare module 'path' {
  export const resolve: (...args: string[]) => string;
  export const join: (...args: string[]) => string;
  const path: { resolve: typeof resolve; join: typeof join };
  export default path;
}

interface URLSearchParams {
  append(name: string, value: string): void;
  toString(): string;
}

declare class URL {
  constructor(input: string, base?: string);
  searchParams: URLSearchParams;
  toString(): string;
}

interface FetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare function fetch(input: string | URL, init?: Record<string, any>): Promise<FetchResponse>;

declare class Blob {
  constructor(parts?: any[], options?: Record<string, any>);
}

declare class FormData {
  append(name: string, value: any, fileName?: string): void;
}

declare type Buffer = any;

declare module 'multer' {
  import type { RequestHandler } from 'express';
  type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

  interface StorageEngine {}

  interface DiskStorageOptions {
    destination?: (req: any, file: any, cb: (error: Error | null, destination: string) => void) => void;
    filename?: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => void;
  }

  interface MulterOptions {
    storage?: StorageEngine;
    fileFilter?: (req: any, file: any, cb: FileFilterCallback) => void;
    limits?: { fileSize?: number };
  }

  interface Multer {
    single(field: string): RequestHandler;
  }

  function multer(options?: MulterOptions): Multer;
  namespace multer {
    function diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  export = multer;
}

declare const process: {
  env: Record<string, string | undefined>;
};
