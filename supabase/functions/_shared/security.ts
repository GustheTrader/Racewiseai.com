// ============================================================================
// SHARED SECURITY UTILITIES FOR EDGE FUNCTIONS
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// SECURITY FIX: Allowed origins for CORS
export const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://racewiseai.com",
  "https://www.racewiseai.com",
  "https://app.racewiseai.com",
];

/**
 * SECURITY FIX: Get CORS headers with origin validation
 */
export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

/**
 * SECURITY FIX: Verify JWT token with Supabase
 */
export async function verifyAuth(req: Request): Promise<{
  authenticated: boolean;
  userId?: string;
  error?: string;
}> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }

  try {
    const token = authHeader.substring(7);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Proper JWT verification using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, error: "Invalid or expired token" };
    }

    return { authenticated: true, userId: user.id };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authenticated: false, error: "Authentication failed" };
  }
}

/**
 * SECURITY FIX: Check user role with proper validation
 */
export async function checkUserRole(
  userId: string,
  requiredRole: "admin" | "moderator" | "user"
): Promise<boolean> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Admin can access everything
    if (data.role === "admin") return true;

    // Moderator can access moderator and user
    if (requiredRole === "moderator" && data.role === "moderator") return true;

    // Regular user access
    if (requiredRole === "user") return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * SECURITY FIX: Rate limiting check
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests = 100,
  windowMinutes = 60
): Promise<{ allowed: boolean; remaining?: number }> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Call the rate limit check function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      user_uuid: userId,
      endpoint_name: endpoint,
      max_requests: maxRequests,
      window_minutes: windowMinutes,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true }; // Fail open to avoid blocking users
    }

    return { allowed: data as boolean };
  } catch (error) {
    console.error("Rate limit error:", error);
    return { allowed: true }; // Fail open
  }
}

/**
 * SECURITY FIX: Sanitize user input to prevent injection
 */
export function sanitizeInput(input: string, maxLength = 200): string {
  // Remove potentially dangerous characters
  const sanitized = input
    .replace(/[<>\"'`]/g, "") // Remove HTML/script chars
    .replace(/[^\w\s\-.,@]/g, "") // Allow only alphanumeric, spaces, and common punctuation
    .trim()
    .substring(0, maxLength);

  return sanitized;
}

/**
 * SECURITY FIX: Validate track name
 */
export function validateTrackName(trackName: string): boolean {
  const sanitized = trackName.trim();
  return (
    sanitized.length > 0 &&
    sanitized.length <= 100 &&
    /^[a-zA-Z0-9\s\-']+$/.test(sanitized)
  );
}

/**
 * SECURITY FIX: Validate race number
 */
export function validateRaceNumber(raceNumber: number): boolean {
  return Number.isInteger(raceNumber) && raceNumber >= 1 && raceNumber <= 50;
}

/**
 * SECURITY FIX: Sanitize error messages (don't leak sensitive info)
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const isDev = SUPABASE_URL.includes("localhost") || SUPABASE_URL.includes("127.0.0.1");
    return isDev ? error.message : "An error occurred";
  }
  return "An error occurred";
}

/**
 * SECURITY FIX: Create standard error response
 */
export function errorResponse(
  message: string,
  status = 500,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * SECURITY FIX: Create standard success response
 */
export function successResponse(
  data: unknown,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * SECURITY FIX: Log security events
 */
export async function logSecurityEvent(
  eventType: string,
  userId: string | undefined,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    await supabase.from("security_audit_log").insert({
      event_type: eventType,
      user_id: userId,
      details,
      ip_address: details.ip_address || "unknown",
      user_agent: details.user_agent || "unknown",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
    // Don't throw - logging failure shouldn't break the request
  }
}
