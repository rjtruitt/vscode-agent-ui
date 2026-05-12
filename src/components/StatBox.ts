import { escapeHtml } from '../utils/html';
/**
 * StatBox Component
 *
 * Flexible container for displaying stats/metrics/values with labels.
 * Has sensible defaults but highly customizable via variants and style props.
 *
 * Use for: metrics, stats, counts, KPIs, summaries, dashboard cards
 */

export type StatBoxVariant = 'default' | 'compact' | 'hero' | 'minimal';
export type StatBoxColorScheme = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface StatBoxProps {
    /** The main value to display */
    value: string | number;

    /** Label/description */
    label?: string;

    /** Optional icon */
    icon?: string;

    /** Display variant (affects size/padding) */
    variant?: StatBoxVariant;

    /** Color scheme */
    colorScheme?: StatBoxColorScheme;

    /** Optional prefix before value (e.g., "$", "+") */
    prefix?: string;

    /** Optional suffix after value (e.g., "%", "ms") */
    suffix?: string;

    /** Optional subtitle/secondary text */
    subtitle?: string;

    /** Background (can use gradients, transparency, etc.) */
    background?: string;

    /** Border radius */
    borderRadius?: string;

    /** Padding */
    padding?: string;

    /** Text align */
    textAlign?: 'left' | 'center' | 'right';

    /** Clickable */
    onclick?: string;

    /** Additional CSS classes */
    className?: string;

    /** Override any styles */
    style?: Record<string, string>;
}

export class StatBox {
    static render(props: StatBoxProps): string {
        const {
            value,
            label,
            icon,
            variant = 'default',
            colorScheme = 'default',
            prefix = '',
            suffix = '',
            subtitle,
            background,
            borderRadius,
            padding,
            textAlign,
            onclick,
            className = '',
            style = {}
        } = props;

        const classes = [
            'statbox',
            `variant-${variant}`,
            `color-${colorScheme}`,
            onclick && 'clickable',
            className
        ].filter(Boolean).join(' ');

        // Build custom styles
        const customStyles: Record<string, string> = {
            ...style
        };

        if (background) customStyles.background = background;
        if (borderRadius) customStyles.borderRadius = borderRadius;
        if (padding) customStyles.padding = padding;
        if (textAlign) customStyles.textAlign = textAlign;

        const styleStr = Object.entries(customStyles)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''} ${onclick ? `onclick="${onclick}()"` : ''}>
                ${icon ? `<div class="statbox-icon">${icon}</div>` : ''}
                <div class="statbox-value">${prefix}${displayValue}${suffix}</div>
                ${label ? `<div class="statbox-label">${escapeHtml(label)}</div>` : ''}
                ${subtitle ? `<div class="statbox-subtitle">${escapeHtml(subtitle)}</div>` : ''}
            </div>
        `;
    }

    static getStyles(): string {
        return `
            /* StatBox - sensible defaults with variant customization */
            .statbox {
                display: flex;
                flex-direction: column;
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 12px;
                text-align: center;
                transition: all 0.2s ease;
            }

            .statbox.clickable {
                cursor: pointer;
            }

            .statbox.clickable:hover {
                transform: translateY(-1px);
                border-color: rgba(100, 180, 255, 0.4);
            }

            /* Variants */
            .statbox.variant-compact {
                padding: 6px 8px;
                border-radius: 3px;
            }

            .statbox.variant-hero {
                padding: 16px 20px;
                border-radius: 6px;
            }

            .statbox.variant-minimal {
                background: transparent;
                border: none;
                padding: 4px;
            }

            /* Parts */
            .statbox-icon {
                font-size: 20px;
                margin-bottom: 4px;
            }

            .statbox.variant-compact .statbox-icon {
                font-size: 14px;
                margin-bottom: 2px;
            }

            .statbox.variant-hero .statbox-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .statbox.variant-minimal .statbox-icon {
                display: none;
            }

            .statbox-value {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 2px;
            }

            .statbox.variant-compact .statbox-value {
                font-size: 16px;
            }

            .statbox.variant-hero .statbox-value {
                font-size: 32px;
            }

            .statbox-label {
                font-size: 11px;
                opacity: 0.7;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .statbox.variant-compact .statbox-label {
                font-size: 9px;
            }

            .statbox.variant-hero .statbox-label {
                font-size: 12px;
            }

            .statbox-subtitle {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 2px;
            }

            /* Color schemes */
            .statbox.color-primary .statbox-value {
                color: rgba(100, 180, 255, 0.95);
            }

            .statbox.color-success .statbox-value {
                color: rgba(100, 255, 150, 0.95);
            }

            .statbox.color-warning .statbox-value {
                color: rgba(255, 200, 80, 0.9);
            }

            .statbox.color-error .statbox-value {
                color: rgba(255, 100, 100, 0.9);
            }

            .statbox.color-info .statbox-value {
                color: rgba(100, 200, 255, 0.9);
            }
        `;
    }

    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
