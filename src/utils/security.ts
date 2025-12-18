/**
 * Security utilities for protecting against common web vulnerabilities
 */

// Rate limiting implementation using in-memory store
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (e.g., IP address, user ID)
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    // Reset the record
    rateLimitStore[identifier] = { count: 1, resetTime: now + windowMs };
    return true; // Allow request
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true; // Allow request
}

/**
 * Generate a CSRF token for form submissions
 */
export function generateCSRFToken(): string {
  // Generate a random token (in production, use crypto-secure random)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // Compare tokens (should be done in secure session storage)
  return token === sessionToken;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input; // Using textContent prevents HTML parsing
  return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function isValidAndSafeUrl(
  url: string,
  allowedDomains: string[] = []
): boolean {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;

    // Only allow http and https
    if (!['http:', 'https:'].includes(protocol)) {
      return false;
    }

    // Prevent access to private/internal IPs
    const hostname = urlObj.hostname;
    const privateIpRanges = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^fc00:/i, // IPv6 private
      /^fe80:/i, // IPv6 link-local
    ];

    for (const pattern of privateIpRanges) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    // Check allowed domains if specified
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );
      if (!isAllowed) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get security headers for HTTP responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://bqvavkzgmznjfirgfyhd.supabase.co;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}
