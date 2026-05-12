/**
 * HTML Utility Functions
 *
 * Secure HTML utilities for rendering user content safely.
 *
 * @aiInstructions
 * ALWAYS use escapeHtml() when inserting user-provided or dynamic content into HTML strings.
 * This prevents XSS attacks by escaping special HTML characters.
 * Use for: user input, filenames, error messages, any untrusted data in HTML.
 *
 * @aiExample
 * ```typescript
 * import { escapeHtml } from 'vscode-agent-ui/utils/html';
 *
 * // Escape user input
 * const username = '<script>alert("xss")</script>';
 * const html = `<div>Hello, ${escapeHtml(username)}!</div>`;
 * // Result: <div>Hello, &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;!</div>
 *
 * // Escape dynamic content
 * const filename = 'file<test>.txt';
 * const html = `<span>${escapeHtml(filename)}</span>`;
 * // Result: <span>file&lt;test&gt;.txt</span>
 * ```
 *
 * @aiSecurity
 * CRITICAL: Always escape user content before inserting into HTML.
 * Never trust user input - always escape it.
 * Escapes: & < > " '
 */

/**
 * Escape HTML entities to prevent XSS attacks
 *
 * Converts special HTML characters to their entity equivalents to safely
 * display user-provided content without executing scripts or breaking HTML structure.
 *
 * @param text - The text to escape
 * @returns HTML-safe string with special characters escaped
 *
 * @aiInstruction Use whenever inserting dynamic/user content into HTML strings
 * @aiExample
 * const safe = escapeHtml('<script>alert("xss")</script>');
 * console.log(safe); // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
    if (text === undefined || text === null) {
        return '';
    }
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
