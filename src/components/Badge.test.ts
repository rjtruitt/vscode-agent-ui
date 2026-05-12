/**
 * Tests for Badge component
 */

import { describe, it, expect } from 'vitest';
import { Badge, BadgeProps } from './Badge';
import { ValidationError } from '../utils/errors';

describe('Badge component', () => {
    describe('render', () => {
        it('should render basic badge', () => {
            const html = Badge.render({ text: 'Beta' });

            expect(html).toContain('vscode-badge');
            expect(html).toContain('Beta');
            expect(html).toContain('variant-default');
            expect(html).toContain('size-medium');
        });

        it('should render with different variants', () => {
            const variants: Array<BadgeProps['variant']> = ['default', 'primary', 'success', 'warning', 'error', 'info'];

            variants.forEach(variant => {
                const html = Badge.render({ text: 'Test', variant });
                expect(html).toContain(`variant-${variant}`);
            });
        });

        it('should render with different sizes', () => {
            const sizes: Array<BadgeProps['size']> = ['small', 'medium', 'large'];

            sizes.forEach(size => {
                const html = Badge.render({ text: 'Test', size });
                expect(html).toContain(`size-${size}`);
            });
        });

        it('should escape HTML in text', () => {
            const html = Badge.render({ text: '<script>alert("xss")</script>' });

            expect(html).not.toContain('<script>');
            expect(html).toContain('&lt;script&gt;');
        });

        it('should render with icon', () => {
            const html = Badge.render({
                text: 'Status',
                icon: '✓',
            });

            expect(html).toContain('badge-icon');
            expect(html).toContain('✓');
        });

        it('should render with dot indicator', () => {
            const html = Badge.render({
                text: 'Active',
                dot: true,
            });

            expect(html).toContain('with-dot');
            expect(html).toContain('badge-dot');
        });

        it('should render with pill shape', () => {
            const html = Badge.render({
                text: 'Pill',
                pill: true,
            });

            expect(html).toContain('pill');
        });

        it('should include custom className', () => {
            const html = Badge.render({
                text: 'Custom',
                className: 'my-custom-class',
            });

            expect(html).toContain('my-custom-class');
        });

        it('should render with all options combined', () => {
            const html = Badge.render({
                text: 'Pro',
                icon: '⭐',
                variant: 'primary',
                size: 'large',
                dot: true,
                pill: true,
                className: 'custom',
            });

            expect(html).toContain('Pro');
            expect(html).toContain('⭐');
            expect(html).toContain('variant-primary');
            expect(html).toContain('size-large');
            expect(html).toContain('with-dot');
            expect(html).toContain('pill');
            expect(html).toContain('custom');
        });
    });

    describe('validation', () => {
        it('should throw ValidationError if text is missing', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({});
            }).toThrow(ValidationError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: undefined });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if text is empty string', () => {
            expect(() => {
                Badge.render({ text: '' });
            }).toThrow(ValidationError);

            expect(() => {
                Badge.render({ text: '   ' }); // Only whitespace
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if text is not a string', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: 123 });
            }).toThrow(ValidationError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: null });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError for invalid variant', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: 'Test', variant: 'invalid' });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: 'Test', variant: 'invalid' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('variant');
                    expect(error.context?.received).toBe('invalid');
                }
            }
        });

        it('should throw ValidationError for invalid size', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: 'Test', size: 'huge' });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Badge.render({ text: 'Test', size: 'huge' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('size');
                    expect(error.context?.received).toBe('huge');
                }
            }
        });

        it('should include validation context in error', () => {
            try {
                Badge.render({ text: '' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('text');
                    expect(error.message).toContain('required');
                }
            }
        });
    });

    describe('getStyles', () => {
        it('should return CSS string', () => {
            const styles = Badge.getStyles();

            expect(typeof styles).toBe('string');
            expect(styles.length).toBeGreaterThan(0);
        });

        it('should include base badge styles', () => {
            const styles = Badge.getStyles();

            expect(styles).toContain('.vscode-badge');
            expect(styles).toContain('display:');
        });

        it('should include variant styles', () => {
            const styles = Badge.getStyles();

            expect(styles).toContain('.variant-default');
            expect(styles).toContain('.variant-primary');
            expect(styles).toContain('.variant-success');
            expect(styles).toContain('.variant-warning');
            expect(styles).toContain('.variant-error');
            expect(styles).toContain('.variant-info');
        });

        it('should include size styles', () => {
            const styles = Badge.getStyles();

            expect(styles).toContain('.size-small');
            expect(styles).toContain('.size-large');
        });

        it('should include pill and dot styles', () => {
            const styles = Badge.getStyles();

            expect(styles).toContain('.pill');
            expect(styles).toContain('.badge-dot');
            expect(styles).toContain('.with-dot');
        });
    });

    describe('real-world usage', () => {
        it('should render status badge', () => {
            const html = Badge.render({
                text: 'Running',
                variant: 'success',
                dot: true,
            });

            expect(html).toContain('Running');
            expect(html).toContain('variant-success');
            expect(html).toContain('badge-dot');
        });

        it('should render count badge', () => {
            const html = Badge.render({
                text: '12',
                variant: 'primary',
                size: 'small',
                pill: true,
            });

            expect(html).toContain('12');
            expect(html).toContain('variant-primary');
            expect(html).toContain('size-small');
            expect(html).toContain('pill');
        });

        it('should render error badge', () => {
            const html = Badge.render({
                text: 'Failed',
                icon: '✗',
                variant: 'error',
            });

            expect(html).toContain('Failed');
            expect(html).toContain('✗');
            expect(html).toContain('variant-error');
        });

        it('should handle long text gracefully', () => {
            const longText = 'This is a very long badge text that should still render';
            const html = Badge.render({ text: longText });

            expect(html).toContain(longText);
        });

        it('should handle special characters', () => {
            const html = Badge.render({
                text: 'v1.0.0-beta.1',
                variant: 'info',
            });

            expect(html).toContain('v1.0.0-beta.1');
        });

        it('should handle unicode text', () => {
            const html = Badge.render({
                text: '进行中',
                icon: '🚀',
                variant: 'primary',
            });

            expect(html).toContain('进行中');
            expect(html).toContain('🚀');
        });
    });

    describe('edge cases', () => {
        it('should handle minimal props', () => {
            const html = Badge.render({ text: 'A' });
            expect(html).toContain('A');
        });

        it('should handle numeric text (as string)', () => {
            const html = Badge.render({ text: '0' });
            expect(html).toContain('0');
        });

        it('should not render empty icon if not provided', () => {
            const html = Badge.render({ text: 'Test' });
            expect(html).not.toContain('badge-icon');
        });

        it('should handle whitespace in text', () => {
            const html = Badge.render({ text: 'Has  Spaces' });
            expect(html).toContain('Has  Spaces');
        });

        it('should handle default values properly', () => {
            const html = Badge.render({ text: 'Default' });

            expect(html).toContain('variant-default');
            expect(html).toContain('size-medium');
            expect(html).not.toContain('with-dot');
            expect(html).not.toContain('pill');
        });
    });
});
