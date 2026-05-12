import { registry } from '../base/Registry';
import { escapeHtml } from '../utils/html';
/**
 * ToolCard Component
 *
 * Display tool execution with collapsible request/response, status, and metadata.
 * Designed for AI agent tool calls with rich formatting options.
 *
 * @aiInstructions
 * Use ToolCard to display tool execution results:
 * - Tool name and description
 * - Request parameters (collapsible)
 * - Response data (collapsible)
 * - Execution status and timing
 * - Error messages
 *
 * ToolCard provides automatic collapsing, JSON formatting, and status-based styling.
 * Perfect for debugging agent behavior or showing tool usage history.
 *
 * @aiExample
 * ```typescript
 * import { ToolCard } from 'vscode-agent-ui/components';
 *
 * const card = ToolCard.render({
 *   toolName: 'read_file',
 *   status: 'success',
 *   request: { path: '/src/index.ts' },
 *   response: 'export function main() { ... }',
 *   duration: 45
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // With error
 * const errorCard = ToolCard.render({
 *   toolName: 'execute_command',
 *   status: 'error',
 *   request: { command: 'npm test' },
 *   error: 'Command not found: npm',
 *   duration: 12
 * });
 * ```
 */

export type ToolStatus = 'pending' | 'running' | 'success' | 'error';

export interface ToolCardProps {
    /** Tool name */
    toolName: string;

    /** Tool description */
    description?: string;

    /** Execution status */
    status: ToolStatus;

    /** Request parameters */
    request?: any;

    /** Response data */
    response?: any;

    /** Error message (if status='error') */
    error?: string;

    /** Execution duration in ms */
    duration?: number;

    /** Timestamp */
    timestamp?: number;

    /** Unique ID for collapse state */
    id?: string;

    /** Default collapsed state for request */
    requestCollapsed?: boolean;

    /** Default collapsed state for response */
    responseCollapsed?: boolean;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;
}

export class ToolCard {
    static render(props: ToolCardProps): string {
        const {
            toolName,
            description,
            status,
            request,
            response,
            error,
            duration,
            timestamp,
            id = `tool-${Date.now()}`,
            requestCollapsed = true,
            responseCollapsed = false,
            className = '',
            style = {}
        } = props;

        const classes = [
            'tool-card',
            `status-${status}`,
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        const statusIcon = status === 'success' ? '✓' :
                          status === 'error' ? '✗' :
                          status === 'running' ? '⟳' : '○';

        const statusColor = status === 'success' ? 'var(--vscode-testing-iconPassed, #50fa7b)' :
                           status === 'error' ? 'var(--vscode-testing-iconFailed, #ff5555)' :
                           status === 'running' ? 'var(--vscode-testing-iconQueued, #8be9fd)' : '#888';

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''}>
                <div class="tool-header">
                    <div class="tool-status" style="color: ${statusColor};">
                        <span class="status-icon ${status === 'running' ? 'spinning' : ''}">${statusIcon}</span>
                    </div>
                    <div class="tool-info">
                        <div class="tool-name">${escapeHtml(toolName)}</div>
                        ${description ? `<div class="tool-description">${escapeHtml(description)}</div>` : ''}
                    </div>
                    <div class="tool-meta">
                        ${duration !== undefined ? `<span class="tool-duration">${duration}ms</span>` : ''}
                        ${timestamp ? `<span class="tool-timestamp">${new Date(timestamp).toLocaleTimeString()}</span>` : ''}
                    </div>
                </div>

                ${request ? `
                <div class="tool-section" data-accordion="${id}-request">
                    <div class="section-header ${requestCollapsed ? '' : 'expanded'}" onclick="__toggleToolSection('${id}-request')">
                        <span class="expand-icon">▶</span>
                        <span class="section-title">Request</span>
                    </div>
                    <div class="section-content" style="display: ${requestCollapsed ? 'none' : 'block'}">
                        <pre class="tool-data">${this.formatData(request)}</pre>
                    </div>
                </div>
                ` : ''}

                ${response ? `
                <div class="tool-section" data-accordion="${id}-response">
                    <div class="section-header ${responseCollapsed ? '' : 'expanded'}" onclick="__toggleToolSection('${id}-response')">
                        <span class="expand-icon">▶</span>
                        <span class="section-title">Response</span>
                    </div>
                    <div class="section-content" style="display: ${responseCollapsed ? 'none' : 'block'}">
                        <pre class="tool-data">${this.formatData(response)}</pre>
                    </div>
                </div>
                ` : ''}

                ${error ? `
                <div class="tool-error">
                    <div class="error-icon">⚠</div>
                    <div class="error-message">${escapeHtml(error)}</div>
                </div>
                ` : ''}
            </div>
            <script>
                if (!window.__toggleToolSection) {
                    window.__toggleToolSection = function(sectionId) {
                        const section = document.querySelector('[data-accordion="' + sectionId + '"]');
                        if (!section) return;

                        const header = section.querySelector('.section-header');
                        const content = section.querySelector('.section-content');

                        if (content.style.display === 'none') {
                            content.style.display = 'block';
                            header.classList.add('expanded');
                        } else {
                            content.style.display = 'none';
                            header.classList.remove('expanded');
                        }

                        // Capture state for preservation
                        if (window.__captureState) {
                            window.__captureState();
                        }
                    };
                }
            </script>
        `;
    }

    private static formatData(data: any): string {
        if (typeof data === 'string') {
            return escapeHtml(data);
        }
        try {
            return escapeHtml(JSON.stringify(data, null, 2));
        } catch {
            return escapeHtml(String(data));
        }
    }

    static getStyles(): string {
        return `
            .tool-card {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                margin-bottom: 8px;
                overflow: hidden;
            }

            .tool-card.status-success {
                border-left: 3px solid var(--vscode-testing-iconPassed, #50fa7b);
            }

            .tool-card.status-error {
                border-left: 3px solid var(--vscode-testing-iconFailed, #ff5555);
            }

            .tool-card.status-running {
                border-left: 3px solid var(--vscode-testing-iconQueued, #8be9fd);
            }

            .tool-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: var(--vscode-editor-background);
            }

            .tool-status {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .status-icon.spinning {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .tool-info {
                flex: 1;
            }

            .tool-name {
                font-size: 14px;
                font-weight: 600;
                font-family: 'Monaco', 'Menlo', monospace;
                color: var(--vscode-textLink-foreground);
            }

            .tool-description {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 2px;
            }

            .tool-meta {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 2px;
                font-size: 11px;
                opacity: 0.6;
            }

            .tool-duration {
                font-family: 'Monaco', 'Menlo', monospace;
            }

            .tool-section {
                border-top: 1px solid var(--vscode-panel-border);
            }

            .section-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
                user-select: none;
                transition: background 0.2s;
            }

            .section-header:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .expand-icon {
                font-size: 10px;
                transition: transform 0.2s;
                display: inline-block;
            }

            .section-header.expanded .expand-icon {
                transform: rotate(90deg);
            }

            .section-title {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0.8;
            }

            .section-content {
                padding: 0 12px 12px 12px;
            }

            .tool-data {
                margin: 0;
                padding: 8px;
                background: var(--vscode-textCodeBlock-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 12px;
                overflow-x: auto;
                white-space: pre;
            }

            .tool-error {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                padding: 12px;
                background: rgba(255, 85, 85, 0.1);
                border-top: 1px solid var(--vscode-panel-border);
            }

            .error-icon {
                font-size: 16px;
                color: var(--vscode-testing-iconFailed, #ff5555);
            }

            .error-message {
                flex: 1;
                font-size: 13px;
                color: var(--vscode-testing-iconFailed, #ff5555);
                white-space: pre-wrap;
                word-break: break-word;
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
// Register component
registry.register('ToolCard', ToolCard);
