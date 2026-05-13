/**
 * Security Utilities
 *
 * Security-related utilities for CSP (Content Security Policy) compliance
 * and secure random value generation.
 *
 * @aiInstruction
 * Use these utilities when working with VS Code webviews:
 * - generateNonce(): Create CSP nonces for inline scripts/styles
 * - generateSecureRandom(): Generate cryptographically secure random values
 *
 * VS Code webviews have strict CSP policies. All inline scripts and styles
 * must include a nonce attribute matching the CSP header.
 *
 * @aiExample
 * ```typescript
 * import { generateNonce } from 'vscode-agent-ui/utils/security';
 *
 * // Generate nonce for CSP
 * const nonce = generateNonce();
 *
 * // Use in HTML
 * const html = `
 *   <html>
 *     <head>
 *       <meta http-equiv="Content-Security-Policy"
 *             content="default-src 'none'; script-src 'nonce-${nonce}';">
 *       <script nonce="${nonce}">
 *         console.log('This script is allowed by CSP');
 *       </script>
 *     </head>
 *   </html>
 * `;
 * ```
 */

import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure nonce for CSP
 *
 * Creates a base64-encoded random string suitable for use as a
 * Content Security Policy nonce.
 *
 * @param length - Length of random bytes (default: 32)
 * @returns Base64-encoded nonce string
 *
 * @aiInstruction
 * Use this to generate nonces for inline scripts and styles in VS Code webviews.
 * The nonce must be included in both the CSP meta tag and the script/style tag.
 *
 * @aiExample
 * ```typescript
 * const nonce = generateNonce();
 * // nonce = 'a7f8d9e6b5c4a3b2...' (base64 string)
 *
 * // Add to CSP
 * const csp = `script-src 'nonce-${nonce}';`;
 *
 * // Add to script tag
 * const script = `<script nonce="${nonce}">...</script>`;
 * ```
 */
export function generateNonce(length = 32): string {
  return randomBytes(length).toString('base64');
}

/**
 * Generate cryptographically secure random hex string
 *
 * @param length - Length of random bytes (default: 16)
 * @returns Hexadecimal random string
 *
 * @aiInstruction
 * Use this for generating secure IDs, tokens, or random values.
 * Never use Math.random() for security-sensitive operations.
 *
 * @aiExample
 * ```typescript
 * const sessionId = generateSecureRandom();
 * const token = generateSecureRandom(32); // Longer token
 * ```
 */
export function generateSecureRandom(length = 16): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a secure random ID suitable for HTML element IDs
 *
 * @returns Random ID string (lowercase letters and numbers)
 *
 * @aiInstruction
 * Use this to generate unique IDs for HTML elements when you need
 * cryptographically secure randomness (e.g., for security-sensitive forms).
 *
 * For non-security-sensitive IDs, a simple timestamp-based ID is sufficient.
 */
export function generateSecureId(): string {
  return generateSecureRandom(8);
}
