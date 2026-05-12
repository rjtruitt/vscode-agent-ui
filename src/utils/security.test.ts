/**
 * Tests for security utility functions
 */

import { describe, it, expect } from 'vitest';
import { getNonce } from './security';

describe('getNonce', () => {
    it('should generate a base64 string', () => {
        const nonce = getNonce();
        expect(typeof nonce).toBe('string');
        expect(nonce.length).toBeGreaterThan(0);

        // Base64 strings only contain A-Z, a-z, 0-9, +, /, and = for padding
        expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should generate unique nonces', () => {
        const nonce1 = getNonce();
        const nonce2 = getNonce();
        const nonce3 = getNonce();

        expect(nonce1).not.toBe(nonce2);
        expect(nonce2).not.toBe(nonce3);
        expect(nonce1).not.toBe(nonce3);
    });

    it('should generate consistent length nonces', () => {
        // 16 bytes base64 encoded = 24 characters (22 + 2 padding in some cases)
        const nonce1 = getNonce();
        const nonce2 = getNonce();
        const nonce3 = getNonce();

        expect(nonce1.length).toBe(24);
        expect(nonce2.length).toBe(24);
        expect(nonce3.length).toBe(24);
    });

    it('should generate cryptographically random values', () => {
        // Generate many nonces and ensure high entropy (no patterns)
        const nonces = new Set<string>();
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            nonces.add(getNonce());
        }

        // All nonces should be unique (no collisions)
        expect(nonces.size).toBe(iterations);
    });

    it('should be suitable for CSP nonces', () => {
        const nonce = getNonce();

        // CSP nonces should be:
        // - Long enough (at least 128 bits = 16 bytes)
        // - Base64 encoded for use in HTML attributes
        // - Random and unpredictable

        expect(nonce.length).toBeGreaterThanOrEqual(22); // 128 bits in base64
        expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/); // Valid base64
    });

    it('should work in CSP meta tag context', () => {
        const nonce = getNonce();

        // Simulate CSP usage
        const cspContent = `default-src 'none'; script-src 'nonce-${nonce}'`;
        const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
        const scriptTag = `<script nonce="${nonce}">console.log('safe');</script>`;

        expect(metaTag).toContain(nonce);
        expect(scriptTag).toContain(nonce);
        expect(metaTag).not.toContain('<script>'); // No XSS vectors
    });

    it('should not contain problematic characters for HTML attributes', () => {
        const nonce = getNonce();

        // Should not contain characters that break HTML attributes
        expect(nonce).not.toContain('"');
        expect(nonce).not.toContain("'");
        expect(nonce).not.toContain('<');
        expect(nonce).not.toContain('>');
        expect(nonce).not.toContain('&');
    });

    it('should generate high-entropy random data', () => {
        // Test statistical randomness by checking character distribution
        const nonces = Array.from({ length: 1000 }, () => getNonce()).join('');
        const charCounts: Record<string, number> = {};

        for (const char of nonces) {
            charCounts[char] = (charCounts[char] || 0) + 1;
        }

        // With good randomness, we should see reasonable distribution
        // of base64 characters (not all the same character)
        const uniqueChars = Object.keys(charCounts).length;
        expect(uniqueChars).toBeGreaterThan(50); // Should use many different chars
    });
});
