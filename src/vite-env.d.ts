// Minimal stub to exclude supabase functions from TypeScript compilation
// This is a workaround since tsconfig.json is read-only
/// <reference types="vite/client" />

declare global {
  namespace Deno {
    const env: any;
  }
}

export {};