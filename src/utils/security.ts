/**
 * Security Utility Functions
 *
 * Cryptographically secure utilities for VS Code webviews.
 *
 * @aiInstructions
 * Use these utilities for security-sensitive operations:
 * - getNonce() for Content Security Policy nonces
 * - Always use cryptographically secure random generation
 * - Never use Math.random() for security purposes
 *
 * @aiExample
 * ```typescript
 * import { getNonce } from 'vscode-agent-ui/utils/security';
 *
 * // Generate CSP nonce for webview
 * const nonce = getNonce();
 * const html = `
 *   <html>
 *     <head>
 *       <meta http-equiv="Content-Security-Policy"
 *             content="default-src 'none'; script-src 'nonce-${nonce}';">
 *     </head>
 *     <body>
 *       <script nonce="${nonce}">
 *         // Safe inline script
 *       </script>
 *     </body>
 *   </html>
 * `;
 * ```
 *
 * @aiSecurity
 * - Uses Node.js crypto.randomBytes for cryptographic security
 * - Generates 128-bit (16 bytes) random values
 * - Base64 encoded for use in HTML attributes
 */

import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random nonce for CSP
 *
 * Uses Node.js crypto.randomBytes for true random generation,
 * suitable for security-sensitive contexts like Content Security Policy.
 *
 * @returns A base64-encoded random string (22 characters)
 */
export function getNonce(): string {
    return randomBytes(16).toString('base64');
}
