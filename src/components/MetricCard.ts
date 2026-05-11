/**
 * MetricCard Component
 *
 * Display a single metric value with label - perfect for dashboards and status displays.
 *
 * @aiInstructions
 * Use MetricCard to highlight key metrics:
 * - Agent counts
 * - Token usage
 * - Success rates
 * - Performance metrics
 * - Status numbers
 *
 * MetricCard is optimized for displaying a single number with context.
 * For multiple related metrics, use a grid of MetricCards.
 *
 * @aiExample
 * ```typescript
 * import { MetricCard } from 'vscode-agent-ui/components';
 *
 * const card = MetricCard.render({
 *   value: '42',
 *   label: 'Active Agents',
 *   variant: 'success'
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // With icon and trend
 * const tpmCard = MetricCard.render({
 *   value: '15,234',
 *   label: 'Tokens Per Minute',
 *   icon: '⚡',
 *   trend: 'up',
 *   variant: 'info'
 * });
 * ```
 */

export type MetricVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';
export type MetricTrend = 'up' | 'down' | 'flat';

export interface MetricCardProps {
    /** Metric value (number or formatted string) */
    value: string | number;

    /** Metric label/description */
    label: string;

    /** Optional icon (emoji or HTML) */
    icon?: string;

    /** Trend indicator */
    trend?: MetricTrend;

    /** Visual variant */
    variant?: MetricVariant;

    /** Compact mode (smaller padding, no icon by default) */
    compact?: boolean;

    /** Border radius */
    borderRadius?: string;

    /** Custom background */
    background?: string;

    /** Show icon */
    showIcon?: boolean;

    /** Custom value font size */
    valueFontSize?: string;

    /** Custom label font size */
    labelFontSize?: string;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;

    /** Make clickable */
    onclick?: string;
}

export class MetricCard {
    static render(props: MetricCardProps): string {
        const {
            value,
            label,
            icon,
            trend,
            variant = 'default',
            className = '',
            style = {},
            onclick
        } = props;

        const classes = [
            'metric-card',
            `variant-${variant}`,
            onclick && 'clickable',
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : trend === 'flat' ? '→' : '';
        const trendClass = trend ? `trend-${trend}` : '';

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''} ${onclick ? `onclick="${onclick}()"` : ''}>
                ${icon ? `<div class="metric-icon">${icon}</div>` : ''}
                <div class="metric-value ${trendClass}">
                    ${typeof value === 'number' ? value.toLocaleString() : value}
                    ${trendIcon ? `<span class="trend-indicator">${trendIcon}</span>` : ''}
                </div>
                <div class="metric-label">${this.escapeHtml(label)}</div>
            </div>
        `;
    }

    static getStyles(): string {
        return `
            .metric-card {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 12px;
                text-align: center;
                transition: all 0.2s ease;
            }

            .metric-card.clickable {
                cursor: pointer;
            }

            .metric-card.clickable:hover {
                transform: translateY(-2px);
                border-color: rgba(100, 180, 255, 0.4);
            }

            .metric-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }

            .metric-value {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .metric-card.variant-default .metric-value {
                color: rgba(100, 180, 255, 0.9);
            }

            .metric-card.variant-info .metric-value {
                color: rgba(100, 180, 255, 0.9);
            }

            .metric-card.variant-success .metric-value {
                color: rgba(100, 255, 150, 0.95);
            }

            .metric-card.variant-warning .metric-value {
                color: rgba(255, 200, 80, 0.9);
            }

            .metric-card.variant-danger .metric-value {
                color: rgba(255, 100, 100, 0.9);
            }

            .metric-label {
                font-size: 11px;
                opacity: 0.7;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .trend-indicator {
                font-size: 20px;
            }

            .metric-value.trend-up .trend-indicator {
                color: #4caf50;
            }

            .metric-value.trend-down .trend-indicator {
                color: #f44336;
            }

            .metric-value.trend-flat .trend-indicator {
                color: #ff9800;
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
