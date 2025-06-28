/// <reference types="deno" />

// Declare Deno environment types
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }

  export interface SignalListener {
    (signal: string): void;
  }

  export const env: Env;
  export function addSignalListener(signal: string, listener: SignalListener): void;
  export function exit(code: number): never;
}

// Declare global types
declare global {
  const Deno: {
    env: Env;
    addSignalListener: (signal: string, listener: SignalListener) => void;
    exit: (code: number) => never;
  };
}

// Add type declarations for Deno standard library modules
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): Promise<void>;
  export interface Response {
    status: number;
    headers: Headers;
  }
  export interface Headers {
    get(name: string): string | null;
    set(name: string, value: string): void;
    delete(name: string): void;
  }
}

declare module "https://deno.land/std@0.177.0/http/file_server.ts" {
  export function serveStatic(
    handler: (req: Request) => Promise<Response>,
    options?: {
      root?: string;
      index?: string;
    }
  ): Promise<void>;
}

declare module "https://deno.land/std@0.177.0/log/mod.ts" {
  export class Console {
    constructor(options?: { name?: string });
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
  }
  export function setup(options?: { handlers?: any }): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.31.0" {
  export interface SupabaseClient {
    from(table: string): SupabaseTable;
  }

  export interface SupabaseTable {
    upsert(data: any, options?: any): Promise<any>;
    select(): Promise<any>;
    insert(data: any, options?: any): Promise<any>;
    update(data: any, options?: any): Promise<any>;
    delete(options?: any): Promise<any>;
  }

  export function createClient(
    url: string,
    key: string,
    options?: any
  ): SupabaseClient;
}
