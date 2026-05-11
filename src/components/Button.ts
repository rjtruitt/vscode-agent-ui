/**
 * Button Component
 *
 * A clickable button component with multiple visual variants for different action types.
 *
 * @aiInstructions
 * Use this component when you need user interaction. Choose variant based on action importance:
 * - 'primary' for main actions (Submit, Save, Create, Start)
 * - 'secondary' for supporting actions (Cancel, Back, Skip)
 * - 'danger' for destructive actions (Delete, Remove, Clear)
 * - 'ghost' for subtle actions (Hide, Dismiss, More Info)
 *
 * @aiExample
 * ```typescript
 * import { Button } from 'vscode-agent-ui/components';
 *
 * // Create a primary action button
 * const html = Button.render({
 *   text: 'Create Agent',
 *   variant: 'primary',
 *   onclick: 'handleCreate',
 *   disabled: false
 * });
 *
 * // Button with icon
 * const deleteBtn = Button.render({
 *   text: 'Delete',
 *   icon: '🗑️',
 *   variant: 'danger',
 *   onclick: 'handleDelete'
 * });
 *
 * // Icon-only button
 * const iconBtn = Button.render({
 *   icon: '⚙️',
 *   variant: 'ghost',
 *   onclick: 'openSettings',
 *   ariaLabel: 'Open Settings'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't use 'primary' for destructive actions - use 'danger' instead
 * - Always provide onclick handler or set disabled state
 * - For icon-only buttons, always include ariaLabel for accessibility
 * - Don't nest buttons inside other buttons
 *
 * @aiWhenToUse
 * Use Button for discrete actions that happen immediately.
 * - For toggle states (on/off), use Toggle component instead
 * - For multiple related actions, wrap in ButtonGroup
 * - For form submission, set type='submit'
 *
 * @aiRelatedComponents
 * - ButtonGroup (for grouping related buttons)
 * - Toggle (for on/off states)
 * - Select (for choosing from options)
 *
 * @aiPerformance
 * Buttons are lightweight and can be rendered in large quantities without performance issues.
 *
 * @aiAccessibility
 * - Always provide text or ariaLabel
 * - Use semantic button element (not div)
 * - Supports keyboard navigation automatically
 * - Focus states are built-in
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Button component properties
 */
export interface ButtonProps {
    /** Button text label */
    text?: string;

    /** Button icon (emoji or HTML) */
    icon?: string;

    /** Visual variant */
    variant?: ButtonVariant;

    /** Button size */
    size?: ButtonSize;

    /** Button type for forms */
    type?: ButtonType;

    /** Disabled state */
    disabled?: boolean;

    /** Loading state (shows spinner) */
    loading?: boolean;

    /** Click handler function name */
    onclick?: string;

    /** Tooltip text */
    tooltip?: string;

    /** ARIA label for accessibility */
    ariaLabel?: string;

    /** Additional CSS classes */
    className?: string;

    /** Data attributes for custom handling */
    data?: Record<string, string>;

    /** Full width button */
    fullWidth?: boolean;
}

/**
 * Button Component - Pure function renderer
 */
export class Button {
    /**
     * Render a button to HTML string
     */
    static render(props: ButtonProps): string {
        const {
            text,
            icon,
            variant = 'secondary',
            size = 'medium',
            type = 'button',
            disabled = false,
            loading = false,
            onclick,
            tooltip,
            ariaLabel,
            className = '',
            data = {},
            fullWidth = false
        } = props;

        // Build classes
        const classes = [
            'vscode-button',
            `variant-${variant}`,
            `size-${size}`,
            disabled && 'disabled',
            loading && 'loading',
            fullWidth && 'full-width',
            className
        ].filter(Boolean).join(' ');

        // Build data attributes
        const dataAttrs = Object.entries(data)
            .map(([key, value]) => `data-${key}="${Button.escapeHtml(value)}"`)
            .join(' ');

        // Build attributes
        const attrs = [
            `type="${type}"`,
            disabled && 'disabled',
            onclick && `onclick="${onclick}(event)"`,
            tooltip && `title="${Button.escapeHtml(tooltip)}"`,
            ariaLabel && `aria-label="${Button.escapeHtml(ariaLabel)}"`,
            dataAttrs
        ].filter(Boolean).join(' ');

        // Render content
        let content = '';
        if (loading) {
            content = '<span class="button-spinner"></span>';
        } else {
            if (icon) {
                content += `<span class="button-icon">${icon}</span>`;
            }
            if (text) {
                content += `<span class="button-text">${Button.escapeHtml(text)}</span>`;
            }
        }

        return `<button class="${classes}" ${attrs}>${content}</button>`;
    }

    /**
     * Get CSS styles for buttons
     */
    static getStyles(): string {
        return `
            /* Button Base */
            .vscode-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 8px 16px;
                border: 1px solid transparent;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                font-family: var(--vscode-font-family);
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                outline: none;
            }

            .vscode-button:focus {
                outline: 2px solid var(--vscode-focusBorder);
                outline-offset: 2px;
            }

            .vscode-button.disabled,
            .vscode-button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                pointer-events: none;
            }

            .vscode-button.loading {
                opacity: 0.7;
                pointer-events: none;
            }

            .vscode-button.full-width {
                width: 100%;
            }

            /* Sizes */
            .vscode-button.size-small {
                padding: 4px 12px;
                font-size: 11px;
                gap: 4px;
            }

            .vscode-button.size-large {
                padding: 12px 20px;
                font-size: 14px;
                gap: 8px;
            }

            /* Variants */
            .vscode-button.variant-primary {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border-color: var(--vscode-button-background);
            }

            .vscode-button.variant-primary:hover:not(.disabled):not(:disabled) {
                background: var(--vscode-button-hoverBackground);
                border-color: var(--vscode-button-hoverBackground);
            }

            .vscode-button.variant-primary:active:not(.disabled):not(:disabled) {
                transform: scale(0.98);
            }

            .vscode-button.variant-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border-color: var(--vscode-button-secondaryBackground);
            }

            .vscode-button.variant-secondary:hover:not(.disabled):not(:disabled) {
                background: var(--vscode-button-secondaryHoverBackground);
                border-color: var(--vscode-button-secondaryHoverBackground);
            }

            .vscode-button.variant-secondary:active:not(.disabled):not(:disabled) {
                transform: scale(0.98);
            }

            .vscode-button.variant-danger {
                background: var(--vscode-errorForeground, #f44336);
                color: white;
                border-color: var(--vscode-errorForeground, #f44336);
            }

            .vscode-button.variant-danger:hover:not(.disabled):not(:disabled) {
                opacity: 0.9;
            }

            .vscode-button.variant-danger:active:not(.disabled):not(:disabled) {
                transform: scale(0.98);
            }

            .vscode-button.variant-ghost {
                background: transparent;
                color: var(--vscode-foreground);
                border-color: transparent;
            }

            .vscode-button.variant-ghost:hover:not(.disabled):not(:disabled) {
                background: var(--vscode-toolbar-hoverBackground);
            }

            .vscode-button.variant-ghost:active:not(.disabled):not(:disabled) {
                transform: scale(0.98);
            }

            /* Button Icon */
            .button-icon {
                font-size: 1.2em;
                line-height: 1;
                display: inline-flex;
                align-items: center;
            }

            /* Button Text */
            .button-text {
                line-height: 1;
            }

            /* Loading Spinner */
            .button-spinner {
                display: inline-block;
                width: 14px;
                height: 14px;
                border: 2px solid currentColor;
                border-top-color: transparent;
                border-radius: 50%;
                animation: button-spin 0.6s linear infinite;
            }

            @keyframes button-spin {
                to { transform: rotate(360deg); }
            }
        `;
    }

    /**
     * Escape HTML entities to prevent XSS
     */
    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
