import { escapeHtml } from '../utils/html';
/**
 * Canvas Component
 *
 * Container for generated content (documents, diagrams, visualizations) with
 * title, actions, collapse, and export capabilities.
 *
 * @aiInstructions
 * Use Canvas for agent-generated artifacts:
 * - Generated documents
 * - Charts and diagrams
 * - Code previews
 * - Rendered markdown
 * - Any content that needs export/action buttons
 *
 * Canvas provides:
 * - Title with optional icon
 * - Action dropdown (export, copy, etc.)
 * - Collapsible content
 * - Status indicators (generating, complete, error)
 * - Custom toolbar buttons
 *
 * @aiExample
 * ```typescript
 * import { Canvas } from 'vscode-agent-ui/components';
 *
 * const canvas = Canvas.render({
 *   id: 'doc-canvas',
 *   title: 'Generated Report',
 *   content: '<h1>Sales Report Q4</h1><p>...</p>',
 *   actions: [
 *     { label: 'Export to DOCX', onclick: 'exportToDocx' },
 *     { label: 'Export to PDF', onclick: 'exportToPdf' },
 *     { label: 'Copy HTML', onclick: 'copyHtml' }
 *   ],
 *   status: 'complete'
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // Generating state with progress
 * const canvas = Canvas.render({
 *   id: 'chart-canvas',
 *   title: 'Performance Chart',
 *   icon: '📊',
 *   content: '<div class="loading">Generating chart...</div>',
 *   status: 'generating',
 *   collapsible: true,
 *   defaultCollapsed: false
 * });
 * ```
 */

export type CanvasStatus = 'generating' | 'complete' | 'error';

export interface CanvasAction {
    /** Action label */
    label: string;

    /** Icon (emoji or HTML) */
    icon?: string;

    /** Click handler function name */
    onclick: string;

    /** Disabled state */
    disabled?: boolean;
}

export interface CanvasProps {
    /** Unique canvas ID (required for state preservation) */
    id: string;

    /** Canvas title */
    title: string;

    /** Title icon */
    icon?: string;

    /** Canvas content (HTML) */
    content: string;

    /** Generation status */
    status?: CanvasStatus;

    /** Action dropdown items */
    actions?: CanvasAction[];

    /** Custom toolbar buttons (HTML) */
    toolbar?: string;

    /** Make collapsible */
    collapsible?: boolean;

    /** Default collapsed state */
    defaultCollapsed?: boolean;

    /** Content height (CSS value) */
    height?: string;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;
}

export class Canvas {
    static render(props: CanvasProps): string {
        const {
            id,
            title,
            icon,
            content,
            status = 'complete',
            actions = [],
            toolbar = '',
            collapsible = false,
            defaultCollapsed = false,
            height,
            className = '',
            style = {}
        } = props;

        const classes = [
            'canvas',
            `status-${status}`,
            collapsible && 'collapsible',
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        const statusIcon = status === 'generating' ? '⟳' :
                          status === 'error' ? '⚠' :
                          status === 'complete' ? '✓' : '';

        const actionsDropdown = actions.length > 0 ? `
            <div class="canvas-actions">
                <button class="actions-button" onclick="__toggleCanvasActions('${escapeHtml(id)}')">
                    ⋮
                </button>
                <div class="actions-dropdown" id="${escapeHtml(id)}-actions" style="display: none;">
                    ${actions.map(action => `
                        <button
                            class="action-item"
                            onclick="${action.onclick}('${escapeHtml(id)}'); __toggleCanvasActions('${escapeHtml(id)}')"
                            ${action.disabled ? 'disabled' : ''}
                        >
                            ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
                            <span class="action-label">${escapeHtml(action.label)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="${classes}" id="${escapeHtml(id)}" ${styleStr ? `style="${styleStr}"` : ''} data-accordion="${escapeHtml(id)}-canvas">
                <div class="canvas-header ${collapsible ? 'clickable' : ''}" ${collapsible ? `onclick="__toggleCanvas('${escapeHtml(id)}')"` : ''}>
                    <div class="canvas-title-group">
                        ${collapsible ? '<span class="collapse-icon">▼</span>' : ''}
                        ${icon ? `<span class="canvas-icon">${icon}</span>` : ''}
                        <h3 class="canvas-title">${escapeHtml(title)}</h3>
                        <span class="canvas-status ${status === 'generating' ? 'spinning' : ''}">${statusIcon}</span>
                    </div>
                    <div class="canvas-toolbar">
                        ${toolbar}
                        ${actionsDropdown}
                    </div>
                </div>
                <div class="canvas-content" style="${height ? `height: ${height}; ` : ''}display: ${defaultCollapsed ? 'none' : 'block'}">
                    ${content}
                </div>
            </div>
            <script>
                if (!window.__toggleCanvas) {
                    window.__toggleCanvas = function(canvasId) {
                        const canvas = document.getElementById(canvasId);
                        if (!canvas) return;

                        const content = canvas.querySelector('.canvas-content');
                        const icon = canvas.querySelector('.collapse-icon');

                        if (content.style.display === 'none') {
                            content.style.display = 'block';
                            if (icon) icon.textContent = '▼';
                        } else {
                            content.style.display = 'none';
                            if (icon) icon.textContent = '▶';
                        }

                        if (window.__captureState) {
                            window.__captureState();
                        }
                    };
                }

                if (!window.__toggleCanvasActions) {
                    window.__toggleCanvasActions = function(canvasId) {
                        const dropdown = document.getElementById(canvasId + '-actions');
                        if (!dropdown) return;

                        const isVisible = dropdown.style.display !== 'none';
                        dropdown.style.display = isVisible ? 'none' : 'block';
                    };
                }

                // Close dropdowns when clicking outside
                document.addEventListener('click', function(e) {
                    if (!e.target.closest('.canvas-actions')) {
                        document.querySelectorAll('.actions-dropdown').forEach(d => {
                            d.style.display = 'none';
                        });
                    }
                });
            </script>
        `;
    }

    static getStyles(): string {
        return `
            .canvas {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                margin-bottom: 12px;
                overflow: hidden;
            }

            .canvas.status-generating {
                border-left: 3px solid rgba(100, 180, 255, 0.6);
            }

            .canvas.status-complete {
                border-left: 3px solid rgba(76, 175, 80, 0.6);
            }

            .canvas.status-error {
                border-left: 3px solid rgba(244, 67, 54, 0.6);
            }

            .canvas-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                background: var(--vscode-editorGroupHeader-tabsBackground);
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .canvas-header.clickable {
                cursor: pointer;
                user-select: none;
            }

            .canvas-header.clickable:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .canvas-title-group {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
            }

            .collapse-icon {
                font-size: 10px;
                transition: transform 0.2s;
            }

            .canvas-icon {
                font-size: 20px;
            }

            .canvas-title {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--vscode-foreground);
            }

            .canvas-status {
                font-size: 16px;
                margin-left: 4px;
            }

            .canvas-status.spinning {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .canvas-toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .canvas-actions {
                position: relative;
            }

            .actions-button {
                background: transparent;
                border: 1px solid var(--vscode-panel-border);
                color: var(--vscode-foreground);
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                transition: all 0.2s;
            }

            .actions-button:hover {
                background: var(--vscode-button-secondaryHoverBackground);
                border-color: var(--vscode-button-border);
            }

            .actions-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: var(--vscode-menu-background);
                border: 1px solid var(--vscode-menu-border);
                border-radius: 4px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                min-width: 160px;
                z-index: 1000;
            }

            .action-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: var(--vscode-menu-foreground);
                cursor: pointer;
                font-size: 13px;
                text-align: left;
                transition: background 0.2s;
            }

            .action-item:hover:not(:disabled) {
                background: var(--vscode-menu-selectionBackground);
                color: var(--vscode-menu-selectionForeground);
            }

            .action-item:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .action-icon {
                font-size: 14px;
            }

            .action-label {
                flex: 1;
            }

            .canvas-content {
                padding: 12px;
                overflow: auto;
            }

            .canvas-content:empty {
                padding: 0;
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
