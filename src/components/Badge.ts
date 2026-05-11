/**
 * Badge Component
 *
 * Small status indicator for displaying tags, counts, or status information.
 *
 * @aiInstructions
 * Use Badge for showing:
 * - Status indicators (Active, Idle, Error)
 * - Counts and numbers (3 items, 12 notifications)
 * - Tags and labels (Beta, New, Pro)
 * - Priority levels (High, Medium, Low)
 *
 * Choose variant based on semantic meaning:
 * - 'default' for neutral information
 * - 'primary' for important info
 * - 'success' for positive status
 * - 'warning' for caution
 * - 'error' for errors or critical status
 * - 'info' for informational content
 *
 * @aiExample
 * ```typescript
 * import { Badge } from 'vscode-agent-ui/components';
 *
 * // Status badge
 * const status = Badge.render({
 *   text: 'Running',
 *   variant: 'success'
 * });
 *
 * // Count badge
 * const count = Badge.render({
 *   text: '12',
 *   variant: 'primary',
 *   size: 'small'
 * });
 *
 * // Badge with icon
 * const iconBadge = Badge.render({
 *   icon: '⚠️',
 *   text: 'Warning',
 *   variant: 'warning'
 * });
 *
 * // Dot badge (for minimal indicators)
 * const dot = Badge.render({
 *   text: 'Active',
 *   variant: 'success',
 *   dot: true
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't use badges for long text - keep it short (1-15 characters)
 * - Don't make badges clickable - use Button instead
 * - Match variant to semantic meaning, not visual preference
 *
 * @aiWhenToUse
 * Use Badge when:
 * - Showing status or state
 * - Displaying counts or metrics
 * - Adding tags or labels
 * - Need compact indicators
 *
 * Don't use Badge when:
 * - Text is more than a few words (use Card or regular text)
 * - Need interaction (use Button)
 * - Showing progress (use Progress)
 *
 * @aiRelatedComponents
 * - Button (for interactive elements)
 * - Card (for grouped content)
 * - Progress (for showing progress)
 *
 * @aiAccessibility
 * Badges are decorative by default. For screen readers, ensure surrounding context explains meaning.
 */

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * Badge component properties
 */
export interface BadgeProps {
    /** Badge text */
    text: string;

    /** Badge icon (emoji or HTML) */
    icon?: string;

    /** Visual variant */
    variant?: BadgeVariant;

    /** Badge size */
    size?: BadgeSize;

    /** Show dot indicator */
    dot?: boolean;

    /** Pill shape (fully rounded) */
    pill?: boolean;

    /** Additional CSS classes */
    className?: string;
}

/**
 * Badge Component - Pure function renderer
 */
export class Badge {
    /**
     * Render a badge to HTML string
     */
    static render(props: BadgeProps): string {
        const {
            text,
            icon,
            variant = 'default',
            size = 'medium',
            dot = false,
            pill = false,
            className = ''
        } = props;

        // Build classes
        const classes = [
            'vscode-badge',
            `variant-${variant}`,
            `size-${size}`,
            dot && 'with-dot',
            pill && 'pill',
            className
        ].filter(Boolean).join(' ');

        return `
            <span class="${classes}">
                ${dot ? '<span class="badge-dot"></span>' : ''}
                ${icon ? `<span class="badge-icon">${icon}</span>` : ''}
                <span class="badge-text">${Badge.escapeHtml(text)}</span>
            </span>
        `;
    }

    /**
     * Get CSS styles for badges
     */
    static getStyles(): string {
        return `
            /* Badge Base */
            .vscode-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 600;
                font-family: var(--vscode-font-family);
                line-height: 1.4;
                white-space: nowrap;
            }

            /* Sizes */
            .vscode-badge.size-small {
                padding: 1px 6px;
                font-size: 10px;
                gap: 3px;
            }

            .vscode-badge.size-large {
                padding: 4px 10px;
                font-size: 12px;
                gap: 5px;
            }

            /* Pill shape */
            .vscode-badge.pill {
                border-radius: 999px;
            }

            /* Variants */
            .vscode-badge.variant-default {
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
            }

            .vscode-badge.variant-primary {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }

            .vscode-badge.variant-success {
                background: var(--vscode-terminal-ansiGreen);
                color: var(--vscode-editor-background);
            }

            .vscode-badge.variant-warning {
                background: var(--vscode-editorWarning-foreground);
                color: var(--vscode-editor-background);
            }

            .vscode-badge.variant-error {
                background: var(--vscode-errorForeground);
                color: var(--vscode-editor-background);
            }

            .vscode-badge.variant-info {
                background: var(--vscode-editorInfo-foreground);
                color: var(--vscode-editor-background);
            }

            /* Badge Icon */
            .badge-icon {
                font-size: 1.1em;
                line-height: 1;
                display: inline-flex;
                align-items: center;
            }

            /* Badge Text */
            .badge-text {
                line-height: 1;
            }

            /* Dot Indicator */
            .vscode-badge.with-dot {
                padding-left: 6px;
            }

            .badge-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: currentColor;
                animation: badge-pulse 2s ease-in-out infinite;
            }

            @keyframes badge-pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
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
