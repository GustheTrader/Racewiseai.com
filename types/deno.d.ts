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