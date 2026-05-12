/**
 * Card Component
 *
 * Container component for grouping related content with optional header, footer, and visual variants.
 *
 * @aiInstructions
 * Use Card to visually group related information. Cards are perfect for:
 * - Displaying agent status or metrics
 * - Showing tool results
 * - Creating dashboard panels
 * - Grouping form sections
 * - Displaying notifications or alerts
 *
 * Choose variant based on context:
 * - 'default' for general content
 * - 'info' for informational messages
 * - 'success' for positive outcomes
 * - 'warning' for caution messages
 * - 'error' for error states
 *
 * @aiExample
 * ```typescript
 * import { Card } from 'vscode-agent-ui/components';
 *
 * // Basic card with content
 * const card = Card.render({
 *   title: 'Agent Status',
 *   content: '<p>Agent is running...</p>'
 * });
 *
 * // Card with icon and footer
 * const statusCard = Card.render({
 *   title: 'Build Complete',
 *   icon: '✅',
 *   content: '<p>Build finished successfully in 2.3s</p>',
 *   footer: '<span>3 files changed</span>',
 *   variant: 'success'
 * });
 *
 * // Clickable card
 * const clickCard = Card.render({
 *   title: 'View Details',
 *   content: '<p>Click to see more information</p>',
 *   clickable: true,
 *   onclick: 'handleCardClick'
 * });
 *
 * // Error card
 * const errorCard = Card.render({
 *   title: 'Task Failed',
 *   icon: '❌',
 *   content: '<p>Error: Connection timeout</p>',
 *   variant: 'error'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't put interactive elements (buttons) in clickable cards - makes interaction confusing
 * - Always provide title OR content - empty cards are confusing
 * - Use appropriate variant - don't use 'error' for warnings
 * - Keep footer content short - it's meant for metadata
 *
 * @aiWhenToUse
 * Use Card when:
 * - Grouping related information
 * - Creating visual hierarchy
 * - Displaying status or metrics
 * - Need clear content boundaries
 *
 * Don't use Card when:
 * - Content flows naturally (use regular HTML)
 * - Building complex layouts (use Panel or SplitView)
 * - Need collapsible sections (add custom collapse logic)
 *
 * @aiRelatedComponents
 * - Panel (for full webview panels)
 * - Badge (for status indicators)
 * - Progress (for showing progress)
 * - Table (for tabular data)
 *
 * @aiAccessibility
 * - Cards use semantic HTML
 * - Clickable cards have proper role and keyboard support
 * - Color variants also use border indicators (not just color)
 *
 * @aiPerformance
 * Cards are lightweight. You can render dozens without performance issues.
 */

import { escapeHtml } from '../utils/html';

export type CardVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface CardAction {
    /** Action icon (emoji or HTML) */
    icon: string;

    /** Action label (for tooltip) */
    label: string;

    /** Click handler function name */
    onclick: string;

    /** Visual variant */
    variant?: 'default' | 'danger' | 'primary';
}

/**
 * Card component properties
 */
export interface CardProps {
    /** Card title */
    title?: string;

    /** Title icon (emoji or HTML) */
    icon?: string;

    /** Card content (HTML) */
    content: string;

    /** Card footer (HTML) */
    footer?: string;

    /** Action buttons (shown in footer) */
    actions?: CardAction[];

    /** Visual variant */
    variant?: CardVariant;

    /** Enable hover effect */
    hoverable?: boolean;

    /** Make card clickable */
    clickable?: boolean;

    /** Click handler function name */
    onclick?: string;

    /** Show border */
    bordered?: boolean;

    /** Show shadow */
    shadow?: boolean;

    /** Additional CSS classes */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;

    /** Data attributes */
    data?: Record<string, string>;
}

/**
 * Card Component - Pure function renderer
 */
export class Card {
    /**
     * Render a card to HTML string
     */
    static render(props: CardProps): string {
        const {
            title,
            icon,
            content,
            footer,
            actions = [],
            variant = 'default',
            hoverable = false,
            clickable = false,
            onclick,
            bordered = true,
            shadow = true,
            className = '',
            style = {},
            data = {}
        } = props;

        // Build classes
        const classes = [
            'vscode-card',
            `variant-${variant}`,
            hoverable && 'hoverable',
            clickable && 'clickable',
            bordered && 'bordered',
            shadow && 'shadow',
            className
        ].filter(Boolean).join(' ');

        // Build inline styles
        const styleStr = Object.entries(style)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

        // Build data attributes
        const dataAttrs = Object.entries(data)
            .map(([key, value]) => `data-${key}="${escapeHtml(value)}"`)
            .join(' ');

        // Build attributes
        const attrs = [
            clickable && 'role="button"',
            clickable && 'tabindex="0"',
            onclick && `onclick="${onclick}(event)"`,
            styleStr && `style="${styleStr}"`,
            dataAttrs
        ].filter(Boolean).join(' ');

        return `
            <div class="${classes}" ${attrs}>
                ${title || icon ? `
                    <div class="card-header">
                        ${icon ? `<span class="card-icon">${icon}</span>` : ''}
                        ${title ? `<h3 class="card-title">${escapeHtml(title)}</h3>` : ''}
                    </div>
                ` : ''}
                <div class="card-content">
                    ${content}
                </div>
                ${footer || actions.length > 0 ? `
                    <div class="card-footer">
                        <div class="card-footer-content">${footer || ''}</div>
                        ${actions.length > 0 ? `
                            <div class="card-actions">
                                ${actions.map(action => `
                                    <button
                                        class="card-action ${action.variant ? `variant-${action.variant}` : ''}"
                                        onclick="${action.onclick}(event)"
                                        title="${escapeHtml(action.label)}"
                                        aria-label="${escapeHtml(action.label)}">
                                        ${action.icon}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get CSS styles for cards
     */
    static getStyles(): string {
        return `
            /* Card Base */
            .vscode-card {
                background: var(--vscode-editor-background);
                border-radius: 6px;
                overflow: hidden;
                transition: all 0.2s ease;
            }

            .vscode-card.bordered {
                border: 1px solid var(--vscode-panel-border);
            }

            .vscode-card.shadow {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .vscode-card.hoverable:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .vscode-card.clickable {
                cursor: pointer;
            }

            .vscode-card.clickable:active {
                transform: translateY(0);
            }

            .vscode-card.clickable:focus {
                outline: 2px solid var(--vscode-focusBorder);
                outline-offset: 2px;
            }

            /* Variants */
            .vscode-card.variant-info {
                border-left: 4px solid var(--vscode-editorInfo-foreground);
            }

            .vscode-card.variant-success {
                border-left: 4px solid var(--vscode-terminal-ansiGreen);
            }

            .vscode-card.variant-warning {
                border-left: 4px solid var(--vscode-editorWarning-foreground);
            }

            .vscode-card.variant-error {
                border-left: 4px solid var(--vscode-errorForeground);
            }

            /* Card Header */
            .card-header {
                padding: 16px;
                border-bottom: 1px solid var(--vscode-panel-border);
                display: flex;
                align-items: center;
                gap: 10px;
                background: var(--vscode-sideBar-background);
            }

            .card-icon {
                font-size: 20px;
                line-height: 1;
                display: inline-flex;
                align-items: center;
            }

            .card-title {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: var(--vscode-foreground);
                flex: 1;
            }

            /* Card Content */
            .card-content {
                padding: 16px;
                font-size: 13px;
                line-height: 1.6;
                color: var(--vscode-foreground);
            }

            .card-content > *:first-child {
                margin-top: 0;
            }

            .card-content > *:last-child {
                margin-bottom: 0;
            }

            /* Card Footer */
            .card-footer {
                padding: 12px 16px;
                border-top: 1px solid var(--vscode-panel-border);
                background: var(--vscode-sideBar-background);
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .card-footer-content {
                flex: 1;
            }

            .card-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .card-action {
                background: transparent;
                border: none;
                color: var(--vscode-foreground);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 16px;
                line-height: 1;
                transition: background 0.15s ease;
                opacity: 0.7;
            }

            .card-action:hover {
                opacity: 1;
                background: var(--vscode-toolbar-hoverBackground);
            }

            .card-action:active {
                transform: scale(0.95);
            }

            .card-action.variant-primary {
                color: var(--vscode-button-foreground);
                background: var(--vscode-button-background);
                opacity: 1;
            }

            .card-action.variant-primary:hover {
                background: var(--vscode-button-hoverBackground);
            }

            .card-action.variant-danger {
                color: var(--vscode-errorForeground);
            }

            .card-action.variant-danger:hover {
                background: rgba(255, 0, 0, 0.15);
            }
        `;
    }
}

