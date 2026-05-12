/**
 * Tests for Button component
 */

import { describe, it, expect } from 'vitest';
import { Button, ButtonProps } from './Button';
import { ValidationError } from '../utils/errors';

describe('Button component', () => {
    describe('render', () => {
        it('should render basic button with text', () => {
            const html = Button.render({ text: 'Click me' });

            expect(html).toContain('<button');
            expect(html).toContain('vscode-button');
            expect(html).toContain('Click me');
            expect(html).toContain('variant-secondary'); // default
            expect(html).toContain('size-medium'); // default
            expect(html).toContain('type="button"'); // default
        });

        it('should render with different variants', () => {
            const variants: Array<ButtonProps['variant']> = ['primary', 'secondary', 'danger', 'ghost'];

            variants.forEach(variant => {
                const html = Button.render({ text: 'Test', variant });
                expect(html).toContain(`variant-${variant}`);
            });
        });

        it('should render with different sizes', () => {
            const sizes: Array<ButtonProps['size']> = ['small', 'medium', 'large'];

            sizes.forEach(size => {
                const html = Button.render({ text: 'Test', size });
                expect(html).toContain(`size-${size}`);
            });
        });

        it('should render with different types', () => {
            const types: Array<ButtonProps['type']> = ['button', 'submit', 'reset'];

            types.forEach(type => {
                const html = Button.render({ text: 'Test', type });
                expect(html).toContain(`type="${type}"`);
            });
        });

        it('should escape HTML in text', () => {
            const html = Button.render({ text: '<script>alert("xss")</script>' });

            expect(html).not.toContain('<script>');
            expect(html).toContain('&lt;script&gt;');
        });

        it('should render with icon', () => {
            const html = Button.render({
                text: 'Save',
                icon: '💾',
            });

            expect(html).toContain('button-icon');
            expect(html).toContain('💾');
        });

        it('should render icon-only button with ariaLabel', () => {
            const html = Button.render({
                icon: '⚙️',
                ariaLabel: 'Settings',
            });

            expect(html).toContain('button-icon');
            expect(html).toContain('⚙️');
            expect(html).toContain('aria-label="Settings"');
            expect(html).not.toContain('button-text');
        });

        it('should render disabled button', () => {
            const html = Button.render({
                text: 'Disabled',
                disabled: true,
            });

            expect(html).toContain('disabled');
            expect(html).toContain('class="vscode-button');
        });

        it('should render loading button', () => {
            const html = Button.render({
                text: 'Loading',
                loading: true,
            });

            expect(html).toContain('loading');
            expect(html).toContain('button-spinner');
            expect(html).not.toContain('Loading'); // Text hidden when loading
        });

        it('should render with onclick handler', () => {
            const html = Button.render({
                text: 'Click',
                onclick: 'handleClick',
            });

            expect(html).toContain('onclick="handleClick(event)"');
        });

        it('should render with tooltip', () => {
            const html = Button.render({
                text: 'Help',
                tooltip: 'Get help',
            });

            expect(html).toContain('title="Get help"');
        });

        it('should escape HTML in tooltip', () => {
            const html = Button.render({
                text: 'Test',
                tooltip: '<script>xss</script>',
            });

            expect(html).not.toContain('<script>');
            expect(html).toContain('title="&lt;script&gt;');
        });

        it('should render with custom className', () => {
            const html = Button.render({
                text: 'Custom',
                className: 'my-custom-class',
            });

            expect(html).toContain('my-custom-class');
        });

        it('should render with data attributes', () => {
            const html = Button.render({
                text: 'Data',
                data: {
                    id: '123',
                    action: 'save',
                },
            });

            expect(html).toContain('data-id="123"');
            expect(html).toContain('data-action="save"');
        });

        it('should escape HTML in data attributes', () => {
            const html = Button.render({
                text: 'Test',
                data: {
                    value: '<script>xss</script>',
                },
            });

            expect(html).not.toContain('data-value="<script>');
            expect(html).toContain('data-value="&lt;script&gt;');
        });

        it('should render full-width button', () => {
            const html = Button.render({
                text: 'Full Width',
                fullWidth: true,
            });

            expect(html).toContain('full-width');
        });

        it('should render with all options combined', () => {
            const html = Button.render({
                text: 'Submit',
                icon: '✓',
                variant: 'primary',
                size: 'large',
                type: 'submit',
                tooltip: 'Submit form',
                ariaLabel: 'Submit the form',
                className: 'submit-btn',
                data: { form: 'main' },
                fullWidth: true,
            });

            expect(html).toContain('Submit');
            expect(html).toContain('✓');
            expect(html).toContain('variant-primary');
            expect(html).toContain('size-large');
            expect(html).toContain('type="submit"');
            expect(html).toContain('title="Submit form"');
            expect(html).toContain('aria-label="Submit the form"');
            expect(html).toContain('submit-btn');
            expect(html).toContain('data-form="main"');
            expect(html).toContain('full-width');
        });

        it('should not show text when loading', () => {
            const html = Button.render({
                text: 'Save',
                icon: '💾',
                loading: true,
            });

            expect(html).toContain('button-spinner');
            expect(html).not.toContain('💾');
            expect(html).not.toContain('Save');
        });
    });

    describe('validation', () => {
        it('should throw ValidationError if no text, icon, or ariaLabel', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Button.render({});
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Button.render({});
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.message).toContain('text, icon, or ariaLabel');
                }
            }
        });

        it('should allow loading button without text/icon', () => {
            // Loading spinner provides visual feedback
            const html = Button.render({ loading: true, ariaLabel: 'Loading' });
            expect(html).toContain('button-spinner');
        });

        it('should throw ValidationError for icon-only button without ariaLabel', () => {
            expect(() => {
                Button.render({ icon: '⚙️' });
            }).toThrow(ValidationError);

            try {
                Button.render({ icon: '⚙️' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.message).toContain('ariaLabel');
                    expect(error.context?.hint).toBeDefined();
                }
            }
        });

        it('should allow icon-only button with ariaLabel', () => {
            const html = Button.render({
                icon: '⚙️',
                ariaLabel: 'Settings',
            });

            expect(html).toContain('⚙️');
            expect(html).toContain('aria-label="Settings"');
        });

        it('should allow text + icon without ariaLabel', () => {
            // Text provides the label
            const html = Button.render({
                text: 'Settings',
                icon: '⚙️',
            });

            expect(html).toContain('Settings');
            expect(html).toContain('⚙️');
        });

        it('should throw ValidationError for invalid variant', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Button.render({ text: 'Test', variant: 'invalid' });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Button.render({ text: 'Test', variant: 'invalid' });
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
                Button.render({ text: 'Test', size: 'huge' });
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError for invalid type', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                Button.render({ text: 'Test', type: 'invalid' });
            }).toThrow(ValidationError);

            try {
                // @ts-expect-error - testing runtime validation
                Button.render({ text: 'Test', type: 'invalid' });
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.context?.field).toBe('type');
                }
            }
        });
    });

    describe('getStyles', () => {
        it('should return CSS string', () => {
            const styles = Button.getStyles();

            expect(typeof styles).toBe('string');
            expect(styles.length).toBeGreaterThan(0);
        });

        it('should include base button styles', () => {
            const styles = Button.getStyles();

            expect(styles).toContain('.vscode-button');
            expect(styles).toContain('display:');
        });

        it('should include variant styles', () => {
            const styles = Button.getStyles();

            expect(styles).toContain('.variant-primary');
            expect(styles).toContain('.variant-secondary');
            expect(styles).toContain('.variant-danger');
            expect(styles).toContain('.variant-ghost');
        });

        it('should include size styles', () => {
            const styles = Button.getStyles();

            expect(styles).toContain('.size-small');
            expect(styles).toContain('.size-large');
        });

        it('should include state styles', () => {
            const styles = Button.getStyles();

            expect(styles).toContain('.disabled');
            expect(styles).toContain('.loading');
            expect(styles).toContain('button-spinner');
        });

        it('should include focus styles for accessibility', () => {
            const styles = Button.getStyles();

            expect(styles).toContain(':focus');
            expect(styles).toContain('outline');
        });
    });

    describe('real-world usage', () => {
        it('should render primary action button', () => {
            const html = Button.render({
                text: 'Create Agent',
                variant: 'primary',
                onclick: 'handleCreate',
            });

            expect(html).toContain('Create Agent');
            expect(html).toContain('variant-primary');
            expect(html).toContain('onclick="handleCreate(event)"');
        });

        it('should render danger button for destructive actions', () => {
            const html = Button.render({
                text: 'Delete',
                icon: '🗑️',
                variant: 'danger',
                onclick: 'handleDelete',
            });

            expect(html).toContain('Delete');
            expect(html).toContain('🗑️');
            expect(html).toContain('variant-danger');
        });

        it('should render ghost button for subtle actions', () => {
            const html = Button.render({
                text: 'Cancel',
                variant: 'ghost',
            });

            expect(html).toContain('Cancel');
            expect(html).toContain('variant-ghost');
        });

        it('should render loading state during async operations', () => {
            const html = Button.render({
                text: 'Saving...',
                loading: true,
                disabled: true,
            });

            expect(html).toContain('loading');
            expect(html).toContain('disabled');
            expect(html).toContain('button-spinner');
        });

        it('should render submit button for forms', () => {
            const html = Button.render({
                text: 'Submit',
                type: 'submit',
                variant: 'primary',
            });

            expect(html).toContain('type="submit"');
            expect(html).toContain('variant-primary');
        });

        it('should render icon button for toolbar', () => {
            const html = Button.render({
                icon: '⚙️',
                ariaLabel: 'Open Settings',
                variant: 'ghost',
                size: 'small',
            });

            expect(html).toContain('⚙️');
            expect(html).toContain('aria-label="Open Settings"');
            expect(html).toContain('variant-ghost');
            expect(html).toContain('size-small');
        });
    });

    describe('edge cases', () => {
        it('should handle empty data object', () => {
            const html = Button.render({
                text: 'Test',
                data: {},
            });

            expect(html).toContain('Test');
            expect(html).not.toContain('data-');
        });

        it('should handle special characters in text', () => {
            const html = Button.render({
                text: 'Save & Continue',
            });

            expect(html).toContain('Save &amp; Continue');
        });

        it('should handle unicode text', () => {
            const html = Button.render({
                text: '保存',
                icon: '💾',
            });

            expect(html).toContain('保存');
            expect(html).toContain('💾');
        });

        it('should handle very long text', () => {
            const longText = 'This is a very long button text that might wrap';
            const html = Button.render({ text: longText });

            expect(html).toContain(longText);
        });

        it('should handle buttons without onclick (for forms)', () => {
            const html = Button.render({
                text: 'Submit',
                type: 'submit',
            });

            expect(html).not.toContain('onclick');
            expect(html).toContain('type="submit"');
        });

        it('should handle both disabled and loading', () => {
            const html = Button.render({
                text: 'Processing',
                disabled: true,
                loading: true,
            });

            expect(html).toContain('disabled');
            expect(html).toContain('loading');
        });
    });

    describe('accessibility', () => {
        it('should require ariaLabel for icon-only buttons', () => {
            expect(() => {
                Button.render({ icon: '✓' });
            }).toThrow(/ariaLabel/);
        });

        it('should allow text-only buttons without ariaLabel', () => {
            const html = Button.render({ text: 'Click me' });
            expect(html).toContain('Click me');
        });

        it('should allow explicit ariaLabel to override text', () => {
            const html = Button.render({
                text: 'OK',
                ariaLabel: 'Confirm and proceed',
            });

            expect(html).toContain('OK');
            expect(html).toContain('aria-label="Confirm and proceed"');
        });

        it('should escape HTML in ariaLabel', () => {
            const html = Button.render({
                text: 'Test',
                ariaLabel: '<script>xss</script>',
            });

            expect(html).not.toContain('aria-label="<script>');
            expect(html).toContain('aria-label="&lt;script&gt;');
        });
    });
});
