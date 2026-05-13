/**
 * HTML Utilities
 *
 * Safe HTML escaping and sanitization utilities to prevent XSS attacks.
 *
 * @aiInstruction
 * ALWAYS use escapeHtml when inserting user-provided content into HTML:
 * - User input (form values, search queries)
 * - Data from external APIs
 * - Any untrusted string data
 *
 * Never insert raw strings directly into HTML without escaping.
 *
 * @aiExample
 * ```typescript
 * import { escapeHtml } from 'vscode-agent-ui/utils/html';
 *
 * // Safe: Escapes HTML entities
 * const userName = '<script>alert("xss")</script>';
 * const html = `<div>Welcome, ${escapeHtml(userName)}</div>`;
 * // Result: <div>Welcome, &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>
 *
 * // Unsafe: DON'T DO THIS
 * const unsafeHtml = `<div>Welcome, ${userName}</div>`;
 * ```
 */

/**
 * Escape HTML special characters to prevent XSS
 *
 * Converts HTML special characters to their entity equivalents:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#039;
 *
 * @param text - Text to escape
 * @returns HTML-safe escaped text
 *
 * @aiInstruction
 * Use this function EVERY TIME you insert user-provided data into HTML.
 * This prevents XSS (Cross-Site Scripting) attacks.
 *
 * @aiExample
 * ```typescript
 * // Escape user input
 * const userInput = '<img src=x onerror=alert(1)>';
 * const safe = escapeHtml(userInput);
 * // safe = '&lt;img src=x onerror=alert(1)&gt;'
 *
 * // Use in HTML
 * const html = `<div>${escapeHtml(userInput)}</div>`;
 * ```
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape HTML attribute values
 *
 * Similar to escapeHtml but optimized for attribute context.
 *
 * @param value - Attribute value to escape
 * @returns Safely escaped attribute value
 *
 * @aiInstruction
 * Use this when setting HTML attribute values dynamically.
 */
export function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

/**
 * Build HTML attributes from object
 *
 * Creates a space-separated string of HTML attributes with proper escaping.
 *
 * @param attrs - Object of attribute key-value pairs
 * @returns Space-separated attribute string
 *
 * @aiExample
 * ```typescript
 * const attrs = buildAttributes({
 *   id: 'my-id',
 *   class: 'btn btn-primary',
 *   'data-value': '<script>',
 *   disabled: true
 * });
 * // Result: 'id="my-id" class="btn btn-primary" data-value="&lt;script&gt;" disabled'
 * ```
 */
export function buildAttributes(attrs: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(attrs)
    .filter(([_, value]) => value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key; // Boolean attribute
      }
      return `${key}="${escapeAttribute(String(value))}"`;
    })
    .join(' ');
}
