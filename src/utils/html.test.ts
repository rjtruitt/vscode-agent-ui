/**
 * Tests for HTML utility functions
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml } from './html';

describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
        const input = '<div>Hello & "goodbye"</div>';
        const expected = '&lt;div&gt;Hello &amp; &quot;goodbye&quot;&lt;/div&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    it('should escape ampersands', () => {
        expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
        expect(escapeHtml('&&&')).toBe('&amp;&amp;&amp;');
    });

    it('should escape less-than signs', () => {
        expect(escapeHtml('a < b')).toBe('a &lt; b');
        expect(escapeHtml('<')).toBe('&lt;');
    });

    it('should escape greater-than signs', () => {
        expect(escapeHtml('a > b')).toBe('a &gt; b');
        expect(escapeHtml('>')).toBe('&gt;');
    });

    it('should escape double quotes', () => {
        expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
        expect(escapeHtml('"')).toBe('&quot;');
    });

    it('should escape single quotes', () => {
        expect(escapeHtml("It's mine")).toBe('It&#039;s mine');
        expect(escapeHtml("'")).toBe('&#039;');
    });

    it('should handle XSS attack attempts', () => {
        const xssAttempts = [
            '<script>alert("xss")</script>',
            '<img src=x onerror=alert("xss")>',
            '<iframe src="javascript:alert(\'xss\')">',
            '"><script>alert(String.fromCharCode(88,83,83))</script>',
        ];

        xssAttempts.forEach(attempt => {
            const escaped = escapeHtml(attempt);
            expect(escaped).not.toContain('<script');
            expect(escaped).not.toContain('<img');
            expect(escaped).not.toContain('<iframe');
            expect(escaped).toContain('&lt;');
        });
    });

    it('should handle empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('should handle strings with no special characters', () => {
        const plain = 'Hello World 123';
        expect(escapeHtml(plain)).toBe(plain);
    });

    it('should handle null and undefined', () => {
        // @ts-expect-error - testing runtime behavior
        expect(escapeHtml(null)).toBe('');
        // @ts-expect-error - testing runtime behavior
        expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle numbers by converting to string', () => {
        // @ts-expect-error - testing runtime behavior
        expect(escapeHtml(123)).toBe('123');
        // @ts-expect-error - testing runtime behavior
        expect(escapeHtml(0)).toBe('0');
    });

    it('should handle all special characters together', () => {
        const input = `&<>"'`;
        const expected = '&amp;&lt;&gt;&quot;&#039;';
        expect(escapeHtml(input)).toBe(expected);
    });

    it('should escape characters in correct order (ampersand first)', () => {
        // Ampersand must be escaped first to avoid double-escaping
        const input = '&lt;'; // Already escaped &lt;
        const expected = '&amp;lt;'; // Should become &amp;lt; not &amp;amp;lt;
        expect(escapeHtml(input)).toBe(expected);
    });

    it('should handle unicode characters', () => {
        const unicode = '你好 <世界>';
        const expected = '你好 &lt;世界&gt;';
        expect(escapeHtml(unicode)).toBe(expected);
    });

    it('should handle multiline strings', () => {
        const multiline = `<div>
            Line 1 & 2
            <script>alert('xss')</script>
        </div>`;

        const escaped = escapeHtml(multiline);
        expect(escaped).toContain('&lt;div&gt;');
        expect(escaped).toContain('&amp;');
        expect(escaped).toContain('&lt;script&gt;');
        expect(escaped).not.toContain('<div>');
        expect(escaped).not.toContain('<script>');
    });
});
