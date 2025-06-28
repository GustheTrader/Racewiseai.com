/// <reference types="deno" />

// Add Deno types
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }

  export interface SignalListener {
    (signal: string): void;
  }

  export interface Console {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
  }
}

// Add Response type
interface Response {
  status: number;
  headers: Headers;
}

// Add Headers type
interface Headers {
  get(name: string): string | null;
  set(name: string, value: string): void;
  delete(name: string): void;
}

// Add fetch type
declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

// Add Supabase types
interface SupabaseClient {
  from(table: string): SupabaseTable;
}

interface SupabaseTable {
  upsert(data: any, options?: any): Promise<any>;
}
