// Deno types for edge functions compatibility
// This file provides minimal Deno types for TypeScript compilation

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Deno standard library module declarations
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {
  // XHR polyfill for Deno
}

// Supabase client module declaration
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}