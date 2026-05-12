/**
 * Tests for Toggle component
 */

import { describe, it, expect } from 'vitest';
import { Toggle, ToggleProps } from './Toggle';
import { ValidationError } from '../utils/errors';

describe('Toggle component', () => {
    describe('render', () => {
        it('should render basic toggle', () => {
            const html = Toggle.render({
                label: 'Dark Mode',
                checked: true,
            });

            expect(html).toContain('vscode-toggle-wrapper');
            expect(html).toContain('Dark Mode');
            expect(html).toContain('checked');
            expect(html).toContain('role="switch"');
            expect(html).toContain('aria-checked="true"');
        });

        it('should render unchecked toggle', () => {
            const html = Toggle.render({
                label: 'Feature',
                checked: false,
            });

            expect(html).not.toContain(' checked');
            expect(html).toContain('aria-checked="false"');
        });

        it('should render with different sizes', () => {
            const sizes: Array<ToggleProps['size']> = ['small', 'medium', 'large'];

            sizes.forEach(size => {
                const html = Toggle.render({
                    label: 'Test',
                    checked: false,
                    size,
                });
                expect(html).toContain(`size-${size}`);
            });
        });

        it('should escape HTML in label', () => {
            const html = Toggle.render({
                label: '<script>alert("xss")</script>',
                checked: false,
            });

            expect(html).not.toContain('<script>');
            expect(html).toContain('&lt;script&gt;');
        });

        it('should render with description', () => {
            const html = Toggle.render({
                label: 'Auto Save',
                description: 'Saves changes automatically',
                checked: true,
            });

            expect(html).toContain('toggle-description');
            expect(html).toContain('Saves changes automatically');
            expect(html).toContain('aria-describedby');
        });

        it('should escape HTML in description', () => {
            const html = Toggle.render({
                label: 'Test',
                description: '<b>bold</b>',
                checked: false,
            });

            expect(html).not.toContain('<b>');
            expect(html).toContain('&lt;b&gt;');
        });

        it('should render disabled toggle', () => {
            const html = Toggle.render({
                label: 'Disabled',
                checked: false,
                disabled: true,
            });

            expect(html).toContain('disabled');
        });

        it('should render with onchange handler', () => {
            const html = Toggle.render({
                label: 'Feature',
                checked: false,
                onchange: 'handleToggle',
            });

            expect(html).toContain('onchange="handleToggle(event)"');
        });

        it('should render with custom className', () => {
            const html = Toggle.render({
                label: 'Custom',
                checked: false,
                className: 'my-toggle',
            });

            expect(html).toContain('my-toggle');
        });

        it('should render with name attribute', () => {
            const html = Toggle.render({
                label: 'Field',
                checked: false,
                name: 'fieldName',
            });

            expect(html).toContain('name="fieldName"');
        });

        it('should escape HTML in name attribute', () => {
            const html = Toggle.render({
                label: 'Test',
                checked: false,
                name: '<script>',
            });

            expect(html).not.toContain('name="<script>');
            expect(html).toContain('name="&lt;script&gt;"');
        });

        it('should render with custom id', () => {
            const html = Toggle.render({
                label: 'Feature',
                checked: false,
                id: 'custom-id',
            });

            expect(html).toContain('id="custom-id"');
            expect(html).toContain('for="custom-id"');
        });

        it('should generate random id if not provided', () => {
            const html1 = Toggle.render({ label: 'Test1', checked: false });
            const html2 = Toggle.render({ label: 'Test2', checked: false });

            // Extract IDs (they should be different)
            const id1Match = html1.match(/id="(toggle-[^"]+)"/);
            const id2Match = html2.match(/id="(toggle-[^"]+)"/);

            expect(id1Match).toBeTruthy();
            expect(id2Match).toBeTruthy();
            expect(id1Match![1]).not.toBe(id2Match![1]);
        });

        it('should render with all options combined', () => {
            const html = Toggle.render({
                label: 'Premium Feature',
                description: 'Upgrade to access',
                checked: true,
                disabled: true,
                size: 'large',
                onchange: 'handleChange',
                className: 'premium-toggle',
                name: 'premium',
                id: 'toggle-premium',
            });

            expect(html).toContain('Premium Feature');
            expect(html).toContain('Upgrade to access');
            expect(html).toContain('checked');
            expect(html).toContain('disabled');
            expect(html).toContain('size-large');
            expect(html).toContain('onchange="handleChange(event)"');
            expect(html).toContain('premium-toggle');
            expect(html).toContain('name="premium"');
            expect(html).toContain('id="toggle-premium"');
        });

        it('should not render description if not provided', () => {
            const html = Toggle.render({
                label: 'Simple',
                checked: false,
            });

            expect(html).not.toContain('toggle-description');
            expect(html).not.toContain('aria-describedby');
        });
    });

    describe('validation', () => {
        it('should throw ValidationError if label is missing', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ checked: false });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if label is empty string', () => {
            expect(() => {
                Toggle.render({ label: '', checked: false });
            }).toThrow(ValidationError);

            expect(() => {
                Toggle.render({ label: '   ', checked: false });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if label is not a string', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 123, checked: false });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: null, checked: false });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('label');
                }
            }
        });

        it('should throw ValidationError if checked is missing', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test' });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if checked is not boolean', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test', checked: 'true' });
            }).toThrow(ValidationError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test', checked: 1 });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test', checked: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('checked');
                    expect(error.context?.expected).toBe('boolean');
                }
            }
        });

        it('should throw ValidationError for invalid size', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test', checked: false, size: 'huge' });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Toggle.render({ label: 'Test', checked: false, size: 'invalid' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('size');
                    expect(error.context?.received).toBe('invalid');
                }
            }
        });

        it('should accept valid boolean values', () => {
            // Should not throw
            Toggle.render({ label: 'Test', checked: true });
            Toggle.render({ label: 'Test', checked: false });
        });
    });

    describe('getStyles', () => {
        it('should return CSS string', () => {
            const styles = Toggle.getStyles();

            expect(typeof styles).toBe('string');
            expect(styles.length).toBeGreaterThan(0);
        });

        it('should include base toggle styles', () => {
            const styles = Toggle.getStyles();

            expect(styles).toContain('.vscode-toggle-wrapper');
            expect(styles).toContain('.toggle-switch');
            expect(styles).toContain('.toggle-slider');
        });

        it('should include size styles', () => {
            const styles = Toggle.getStyles();

            expect(styles).toContain('.size-small');
            expect(styles).toContain('.size-large');
        });

        it('should include state styles', () => {
            const styles = Toggle.getStyles();

            expect(styles).toContain(':checked');
            expect(styles).toContain(':disabled');
            expect(styles).toContain(':focus');
        });

        it('should include accessibility styles', () => {
            const styles = Toggle.getStyles();

            expect(styles).toContain('outline');
            expect(styles).toContain('cursor');
        });
    });

    describe('real-world usage', () => {
        it('should render settings toggle', () => {
            const html = Toggle.render({
                label: 'Dark Mode',
                description: 'Use dark theme',
                checked: true,
                onchange: 'handleDarkModeToggle',
            });

            expect(html).toContain('Dark Mode');
            expect(html).toContain('Use dark theme');
            expect(html).toContain('checked');
        });

        it('should render feature flag toggle', () => {
            const html = Toggle.render({
                label: 'Beta Features',
                description: 'Enable experimental features',
                checked: false,
                onchange: 'handleBetaToggle',
            });

            expect(html).toContain('Beta Features');
            expect(html).not.toContain(' checked');
        });

        it('should render disabled premium feature', () => {
            const html = Toggle.render({
                label: 'Advanced Analytics',
                description: 'Requires premium subscription',
                checked: false,
                disabled: true,
            });

            expect(html).toContain('Advanced Analytics');
            expect(html).toContain('disabled');
        });

        it('should render small notification toggle', () => {
            const html = Toggle.render({
                label: 'Notifications',
                checked: true,
                size: 'small',
            });

            expect(html).toContain('Notifications');
            expect(html).toContain('size-small');
        });
    });

    describe('accessibility', () => {
        it('should include role="switch"', () => {
            const html = Toggle.render({
                label: 'Test',
                checked: false,
            });

            expect(html).toContain('role="switch"');
        });

        it('should include aria-checked attribute', () => {
            const checkedHtml = Toggle.render({
                label: 'Test',
                checked: true,
            });
            expect(checkedHtml).toContain('aria-checked="true"');

            const uncheckedHtml = Toggle.render({
                label: 'Test',
                checked: false,
            });
            expect(uncheckedHtml).toContain('aria-checked="false"');
        });

        it('should link description with aria-describedby', () => {
            const html = Toggle.render({
                label: 'Feature',
                description: 'This is a description',
                checked: false,
                id: 'test-toggle',
            });

            expect(html).toContain('aria-describedby="test-toggle-desc"');
            expect(html).toContain('id="test-toggle-desc"');
        });

        it('should associate label with input using for/id', () => {
            const html = Toggle.render({
                label: 'Test',
                checked: false,
                id: 'test-id',
            });

            expect(html).toContain('for="test-id"');
            expect(html).toContain('id="test-id"');
        });

        it('should support keyboard interaction via input type', () => {
            const html = Toggle.render({
                label: 'Test',
                checked: false,
            });

            expect(html).toContain('type="checkbox"');
        });
    });

    describe('edge cases', () => {
        it('should handle single character label', () => {
            const html = Toggle.render({ label: 'A', checked: false });
            expect(html).toContain('A');
        });

        it('should handle very long label', () => {
            const longLabel = 'This is a very long label that should still render correctly';
            const html = Toggle.render({ label: longLabel, checked: false });
            expect(html).toContain(longLabel);
        });

        it('should handle unicode in label', () => {
            const html = Toggle.render({
                label: '启用功能',
                checked: true,
            });

            expect(html).toContain('启用功能');
        });

        it('should handle special characters in label', () => {
            const html = Toggle.render({
                label: "Don't & Won't",
                checked: false,
            });

            expect(html).toContain('Don&#039;t &amp; Won&#039;t');
        });

        it('should handle whitespace in label', () => {
            const html = Toggle.render({
                label: '  Leading space',
                checked: false,
            });

            expect(html).toContain('Leading space');
        });

        it('should handle checked state changes', () => {
            const checked = Toggle.render({ label: 'Test', checked: true });
            const unchecked = Toggle.render({ label: 'Test', checked: false });

            expect(checked).toContain(' checked');
            expect(unchecked).not.toContain(' checked');
        });
    });
});
