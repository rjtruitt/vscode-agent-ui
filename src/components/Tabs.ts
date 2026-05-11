/**
 * Tabs Component
 *
 * Tab navigation for organizing content into separate views.
 * State is automatically preserved across panel refreshes.
 *
 * @aiInstructions
 * Use Tabs when you have multiple related views that the user needs to switch between:
 * - Dashboard sections (Overview, Details, Settings)
 * - Multi-step forms
 * - Different data views (Table, Chart, Raw)
 * - Configuration panels
 *
 * Tabs automatically work with Panel's state preservation system - the active tab
 * is remembered across panel refreshes. Just add data-tab-group to the container
 * and data-tab to each tab button.
 *
 * @aiExample
 * ```typescript
 * import { Tabs } from 'vscode-agent-ui/components';
 *
 * const html = Tabs.render({
 *   id: 'mainTabs',
 *   tabs: [
 *     { id: 'overview', label: 'Overview', content: '<p>Overview content</p>' },
 *     { id: 'details', label: 'Details', content: '<p>Details content</p>', badge: '3' },
 *     { id: 'settings', label: 'Settings', content: '<p>Settings content</p>', icon: '⚙️' }
 *   ],
 *   defaultTab: 'overview'
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // Custom content for each tab
 * import { Tabs, Card, Table } from 'vscode-agent-ui/components';
 *
 * const html = Tabs.render({
 *   id: 'dataTabs',
 *   tabs: [
 *     {
 *       id: 'table',
 *       label: 'Table View',
 *       content: Table.render({
 *         columns: [
 *           { key: 'name', label: 'Name' },
 *           { key: 'value', label: 'Value' }
 *         ],
 *         data: [
 *           { name: 'Item 1', value: '100' },
 *           { name: 'Item 2', value: '200' }
 *         ]
 *       })
 *     },
 *     {
 *       id: 'chart',
 *       label: 'Chart View',
 *       content: '<canvas id="myChart"></canvas>'
 *     }
 *   ]
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Forgetting to include Tabs.getStyles() - tabs won't be styled
 * - Using same ID for multiple tab groups - state restoration will conflict
 * - Not setting defaultTab - first tab is used, may not be what you want
 * - Putting too many tabs (>7) - consider accordion or tree instead
 * - Forgetting data-tab-group on container - state won't be preserved
 *
 * @aiWhenToUse
 * Use Tabs when:
 * - 2-7 related sections of content
 * - User needs to switch between views frequently
 * - All tabs are equally important
 * - Content is mutually exclusive (only one view at a time)
 *
 * Don't use Tabs when:
 * - Only one section - no need for tabs
 * - >7 sections - use accordion or tree view
 * - Hierarchical content - use tree view
 * - Progressive disclosure - use accordion
 *
 * @aiRelatedComponents
 * - Card (container for tab content)
 * - Badge (show counts on tabs)
 * - Panel (provides state preservation)
 *
 * @aiAccessibility
 * - Use semantic role="tablist", role="tab", role="tabpanel"
 * - Support keyboard navigation (Arrow keys, Home, End)
 * - aria-selected on active tab
 * - aria-controls linking tab to panel
 */

/**
 * Tab definition
 */
export interface Tab {
    /** Unique tab ID */
    id: string;

    /** Tab label text */
    label: string;

    /** Tab content (HTML) */
    content: string;

    /** Optional icon (emoji or HTML) */
    icon?: string;

    /** Optional badge (number or text) */
    badge?: string;

    /** Disabled state */
    disabled?: boolean;
}

/**
 * Tabs component properties
 */
export interface TabsProps {
    /** Unique tabs group ID (required for state preservation) */
    id: string;

    /** Array of tabs */
    tabs: Tab[];

    /** Default active tab ID */
    defaultTab?: string;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;

    /** Full width tabs */
    fullWidth?: boolean;

    /** Vertical orientation */
    vertical?: boolean;
}

/**
 * Tabs Component
 */
export class Tabs {
    /**
     * Render tabs component
     */
    static render(props: TabsProps): string {
        const {
            id,
            tabs,
            defaultTab = tabs[0]?.id,
            className = '',
            style = {},
            fullWidth = false,
            vertical = false
        } = props;

        const classes = [
            'tabs',
            fullWidth ? 'tabs-full-width' : '',
            vertical ? 'tabs-vertical' : '',
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        // Render tab buttons
        const tabButtons = tabs.map(tab => {
            const isDefault = tab.id === defaultTab;
            const tabClasses = [
                'tab',
                isDefault ? 'active' : '',
                tab.disabled ? 'disabled' : ''
            ].filter(Boolean).join(' ');

            return `
                <button
                    class="${tabClasses}"
                    data-tab="${this.escapeHtml(tab.id)}"
                    role="tab"
                    aria-selected="${isDefault}"
                    aria-controls="panel-${this.escapeHtml(id)}-${this.escapeHtml(tab.id)}"
                    ${tab.disabled ? 'disabled' : ''}
                    onclick="__switchTab('${this.escapeHtml(id)}', '${this.escapeHtml(tab.id)}')"
                >
                    ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
                    <span class="tab-label">${this.escapeHtml(tab.label)}</span>
                    ${tab.badge ? `<span class="tab-badge">${this.escapeHtml(tab.badge)}</span>` : ''}
                </button>
            `;
        }).join('');

        // Render tab panels
        const tabPanels = tabs.map(tab => {
            const isDefault = tab.id === defaultTab;
            return `
                <div
                    class="tab-panel"
                    id="panel-${this.escapeHtml(id)}-${this.escapeHtml(tab.id)}"
                    data-tab-panel="${this.escapeHtml(tab.id)}"
                    role="tabpanel"
                    aria-labelledby="tab-${this.escapeHtml(id)}-${this.escapeHtml(tab.id)}"
                    style="display: ${isDefault ? 'block' : 'none'}"
                >
                    ${tab.content}
                </div>
            `;
        }).join('');

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''} data-tab-group="${this.escapeHtml(id)}">
                <div class="tabs-header" role="tablist" aria-label="${this.escapeHtml(id)} tabs">
                    ${tabButtons}
                </div>
                <div class="tabs-content">
                    ${tabPanels}
                </div>
            </div>
            <script>
                // Tab switching logic
                if (!window.__switchTab) {
                    window.__switchTab = function(groupId, tabId) {
                        const group = document.querySelector('[data-tab-group="' + groupId + '"]');
                        if (!group) return;

                        // Update tab buttons
                        group.querySelectorAll('[data-tab]').forEach(tab => {
                            const isActive = tab.getAttribute('data-tab') === tabId;
                            if (isActive) {
                                tab.classList.add('active');
                                tab.setAttribute('aria-selected', 'true');
                            } else {
                                tab.classList.remove('active');
                                tab.setAttribute('aria-selected', 'false');
                            }
                        });

                        // Update panels
                        group.querySelectorAll('[data-tab-panel]').forEach(panel => {
                            const panelId = panel.getAttribute('data-tab-panel');
                            panel.style.display = panelId === tabId ? 'block' : 'none';
                        });

                        // Capture state change
                        if (window.__captureState) {
                            window.__captureState();
                        }
                    };
                }
            </script>
        `;
    }

    /**
     * Get component styles
     */
    static getStyles(): string {
        return `
            .tabs {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .tabs-vertical {
                flex-direction: row;
            }

            .tabs-header {
                display: flex;
                gap: 4px;
                border-bottom: 1px solid var(--vscode-panel-border);
                padding: 0;
                margin: 0 0 16px 0;
            }

            .tabs-vertical .tabs-header {
                flex-direction: column;
                border-bottom: none;
                border-right: 1px solid var(--vscode-panel-border);
                margin: 0 16px 0 0;
                min-width: 120px;
            }

            .tab {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: transparent;
                color: var(--vscode-foreground);
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                font-weight: var(--vscode-font-weight);
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .tabs-vertical .tab {
                justify-content: flex-start;
                border-bottom: none;
                border-right: 2px solid transparent;
            }

            .tab:hover:not(.disabled) {
                background: var(--vscode-list-hoverBackground);
            }

            .tab.active {
                color: var(--vscode-textLink-activeForeground);
                border-bottom-color: var(--vscode-textLink-activeForeground);
            }

            .tabs-vertical .tab.active {
                border-bottom-color: transparent;
                border-right-color: var(--vscode-textLink-activeForeground);
            }

            .tab.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .tab-icon {
                font-size: 16px;
                line-height: 1;
            }

            .tab-label {
                flex: 1;
            }

            .tab-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                padding: 0 4px;
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                border-radius: 9px;
                font-size: 11px;
                font-weight: 600;
                line-height: 1;
            }

            .tabs-content {
                flex: 1;
            }

            .tabs-vertical .tabs-content {
                flex: 1;
            }

            .tab-panel {
                animation: fadeIn 0.2s ease;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .tabs-full-width .tabs-header {
                width: 100%;
            }

            .tabs-full-width .tab {
                flex: 1;
                justify-content: center;
            }
        `;
    }

    /**
     * Escape HTML entities
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
