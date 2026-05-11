/**
 * Panel Component
 *
 * Generic webview panel for displaying custom HTML content in VS Code.
 * This is the foundation for all custom VS Code UI extensions.
 *
 * @aiInstructions
 * Use Panel when you need to create a custom webview interface in VS Code:
 * - Custom dashboards
 * - Chat interfaces
 * - Data visualization panels
 * - Tool windows
 * - Settings or configuration UIs
 *
 * Panel handles:
 * - Webview lifecycle management
 * - Message passing between extension and webview
 * - Theme detection and synchronization
 * - Resource loading (CSS, JS, images)
 * - Content Security Policy
 *
 * @aiExample
 * ```typescript
 * import * as vscode from 'vscode';
 * import { Panel } from 'vscode-agent-ui/layout';
 *
 * // Create a basic panel
 * const panel = new Panel({
 *   extensionUri: context.extensionUri,
 *   viewType: 'myExtension.customView',
 *   title: 'My Custom View',
 *   showOptions: {
 *     viewColumn: vscode.ViewColumn.Two,
 *     preserveFocus: false
 *   }
 * });
 *
 * // Set HTML content
 * panel.setHtml(`
 *   <h1>Hello from Panel!</h1>
 *   <p>This is custom content.</p>
 * `);
 *
 * // Handle messages from webview
 * panel.onDidReceiveMessage(message => {
 *   if (message.command === 'alert') {
 *     vscode.window.showInformationMessage(message.text);
 *   }
 * });
 *
 * // Post message to webview
 * panel.postMessage({
 *   command: 'update',
 *   data: { status: 'ready' }
 * });
 *
 * // Show the panel
 * panel.show();
 * ```
 *
 * @aiExample
 * ```typescript
 * // Build a complete HTML page
 * import { Button, Card } from 'vscode-agent-ui/components';
 *
 * const panel = new Panel({
 *   extensionUri: context.extensionUri,
 *   viewType: 'myExtension.dashboard',
 *   title: 'Dashboard'
 * });
 *
 * const html = `
 *   <!DOCTYPE html>
 *   <html>
 *   <head>
 *     <style>
 *       ${Button.getStyles()}
 *       ${Card.getStyles()}
 *     </style>
 *   </head>
 *   <body>
 *     <h1>Dashboard</h1>
 *     ${Card.render({
 *       title: 'Status',
 *       content: '<p>System is running</p>',
 *       variant: 'success'
 *     })}
 *     ${Button.render({
 *       text: 'Refresh',
 *       variant: 'primary',
 *       onclick: 'handleRefresh'
 *     })}
 *     <script>
 *       const vscode = acquireVsCodeApi();
 *       function handleRefresh() {
 *         vscode.postMessage({ command: 'refresh' });
 *       }
 *     </script>
 *   </body>
 *   </html>
 * `;
 *
 * panel.setHtml(html);
 * ```
 *
 * @aiCommonMistakes
 * - Forgetting to call panel.show() - panel won't be visible
 * - Not handling onDidReceiveMessage - can't respond to user actions
 * - Hardcoding resource paths - use panel.asWebviewUri()
 * - Not setting up CSP correctly - scripts won't run
 * - Forgetting to dispose panel when done
 *
 * @aiWhenToUse
 * Use Panel when:
 * - Need custom UI beyond VS Code's standard components
 * - Building dashboards or visualization tools
 * - Creating chat interfaces
 * - Need full control over layout and styling
 *
 * Don't use Panel when:
 * - Simple information display (use vscode.window.showInformationMessage)
 * - Quick user input (use vscode.window.showInputBox)
 * - Standard forms (use vscode.window.showQuickPick)
 * - TreeView is sufficient (use vscode.window.createTreeView)
 *
 * @aiRelatedComponents
 * - ChatWindow (for chat interfaces)
 * - All UI components (Button, Card, etc.) - use inside Panel
 * - SplitView (for multi-pane layouts)
 *
 * @aiAccessibility
 * - Ensure HTML is semantic
 * - Use proper ARIA labels
 * - Support keyboard navigation
 * - Test with screen readers
 *
 * @aiPerformance
 * - Keep HTML updates minimal - diff changes instead of replacing entire content
 * - Use postMessage sparingly - batch updates when possible
 * - Dispose panels when not needed
 * - Avoid heavy JavaScript in webview
 *
 * @aiSecurity
 * - Never trust data from webview - always validate
 * - Use CSP to restrict script execution
 * - Escape user input before displaying
 * - Don't expose sensitive data to webview
 */

import * as vscode from 'vscode';

/**
 * Panel configuration options
 */
export interface PanelOptions {
    /** Extension URI for loading resources */
    extensionUri: vscode.Uri;

    /** Unique view type identifier */
    viewType: string;

    /** Panel title */
    title: string;

    /** Show options */
    showOptions?: vscode.ViewColumn | {
        viewColumn: vscode.ViewColumn;
        preserveFocus?: boolean;
    };

    /** Enable scripts in webview */
    enableScripts?: boolean;

    /** Retain context when hidden */
    retainContextWhenHidden?: boolean;

    /** Local resource roots */
    localResourceRoots?: vscode.Uri[];

    /** Enable forms in webview */
    enableForms?: boolean;

    /** Enable command URIs */
    enableCommandUris?: boolean;
}

/**
 * Panel Component - VS Code Webview Panel Wrapper
 */
export class Panel {
    private panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private messageHandlers: Map<string, (message: any) => void | Promise<void>> = new Map();
    private statePreservationEnabled: boolean = true;

    /**
     * Create a new Panel
     */
    constructor(private options: PanelOptions) {
        const {
            viewType,
            title,
            showOptions = vscode.ViewColumn.One,
            enableScripts = true,
            retainContextWhenHidden = true,
            localResourceRoots = [options.extensionUri],
            enableForms = false,
            enableCommandUris = false
        } = options;

        // Create webview panel
        this.panel = vscode.window.createWebviewPanel(
            viewType,
            title,
            typeof showOptions === 'number' ? showOptions : showOptions.viewColumn,
            {
                enableScripts,
                retainContextWhenHidden,
                localResourceRoots,
                enableForms,
                enableCommandUris
            }
        );

        // Handle disposal
        this.panel.onDidDispose(
            () => this.dispose(),
            null,
            this.disposables
        );

        // Handle messages
        this.panel.webview.onDidReceiveMessage(
            async message => {
                const handler = this.messageHandlers.get(message.command);
                if (handler) {
                    await handler(message);
                }
            },
            null,
            this.disposables
        );
    }

    /**
     * Set HTML content with automatic state preservation
     */
    setHtml(html: string): void {
        if (this.statePreservationEnabled) {
            // Request state capture before HTML update
            this.panel.webview.postMessage({ command: '__captureState' }).then(() => {
                this.panel.webview.html = html;
            });
        } else {
            this.panel.webview.html = html;
        }
    }

    /**
     * Enable or disable automatic state preservation
     */
    setStatePreservation(enabled: boolean): void {
        this.statePreservationEnabled = enabled;
    }

    /**
     * Build a complete HTML document with proper structure
     */
    buildHtml(options: {
        title?: string;
        styles?: string;
        body: string;
        scripts?: string;
        nonce?: string;
    }): string {
        const {
            title = this.options.title,
            styles = '',
            body,
            scripts = '',
            nonce = this.getNonce()
        } = options;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${this.panel.webview.cspSource} https: data:;">
            <title>${this.escapeHtml(title)}</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    font-weight: var(--vscode-font-weight);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 16px;
                }
                * {
                    box-sizing: border-box;
                }
                ${styles}
            </style>
        </head>
        <body>
            ${body}
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();

                // Helper to post messages
                function postMessage(command, data) {
                    vscode.postMessage({ command, ...data });
                }

                // State preservation system
                (function() {
                    const STATE_KEY = '__panelState';
                    let state = vscode.getState() || {};

                    // Capture state before HTML refresh
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.command === '__captureState') {
                            captureState();
                        } else if (message.command === '__restoreState') {
                            restoreState();
                        }
                    });

                    // Auto-restore state on load
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', () => restoreState());
                    } else {
                        restoreState();
                    }

                    function captureState() {
                        const captured = {
                            // Input values
                            inputs: {},
                            // Select values
                            selects: {},
                            // Checkbox/radio states
                            checks: {},
                            // Accordion states (data-accordion attribute)
                            accordions: {},
                            // Tab states (data-tab-group attribute)
                            tabs: {},
                            // Scroll positions
                            scrolls: {}
                        };

                        // Capture inputs
                        document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea').forEach(el => {
                            if (el.id) {
                                captured.inputs[el.id] = el.value;
                            }
                        });

                        // Capture selects
                        document.querySelectorAll('select').forEach(el => {
                            if (el.id) {
                                captured.selects[el.id] = el.value;
                            }
                        });

                        // Capture checkboxes/radios
                        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
                            if (el.id) {
                                captured.checks[el.id] = el.checked;
                            }
                        });

                        // Capture accordions
                        document.querySelectorAll('[data-accordion]').forEach(el => {
                            const id = el.getAttribute('data-accordion');
                            const isExpanded = el.classList.contains('expanded') || el.getAttribute('aria-expanded') === 'true';
                            captured.accordions[id] = isExpanded;
                        });

                        // Capture tabs
                        document.querySelectorAll('[data-tab-group]').forEach(group => {
                            const groupId = group.getAttribute('data-tab-group');
                            const activeTab = group.querySelector('[data-tab].active');
                            if (activeTab) {
                                captured.tabs[groupId] = activeTab.getAttribute('data-tab');
                            }
                        });

                        // Capture scroll positions
                        document.querySelectorAll('[data-scroll-id]').forEach(el => {
                            const id = el.getAttribute('data-scroll-id');
                            captured.scrolls[id] = {
                                top: el.scrollTop,
                                left: el.scrollLeft
                            };
                        });

                        // Also capture main scroll
                        captured.scrolls['__main'] = {
                            top: window.scrollY || document.documentElement.scrollTop,
                            left: window.scrollX || document.documentElement.scrollLeft
                        };

                        state = captured;
                        vscode.setState(captured);
                    }

                    function restoreState() {
                        if (!state || Object.keys(state).length === 0) {
                            return;
                        }

                        // Restore inputs
                        if (state.inputs) {
                            for (const [id, value] of Object.entries(state.inputs)) {
                                const el = document.getElementById(id);
                                if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                                    el.value = value;
                                }
                            }
                        }

                        // Restore selects
                        if (state.selects) {
                            for (const [id, value] of Object.entries(state.selects)) {
                                const el = document.getElementById(id);
                                if (el && el.tagName === 'SELECT') {
                                    el.value = value;
                                }
                            }
                        }

                        // Restore checkboxes/radios
                        if (state.checks) {
                            for (const [id, checked] of Object.entries(state.checks)) {
                                const el = document.getElementById(id);
                                if (el && (el.type === 'checkbox' || el.type === 'radio')) {
                                    el.checked = checked;
                                }
                            }
                        }

                        // Restore accordions
                        if (state.accordions) {
                            for (const [id, isExpanded] of Object.entries(state.accordions)) {
                                const el = document.querySelector(\`[data-accordion="\${id}"]\`);
                                if (el) {
                                    if (isExpanded) {
                                        el.classList.add('expanded');
                                        el.setAttribute('aria-expanded', 'true');
                                    } else {
                                        el.classList.remove('expanded');
                                        el.setAttribute('aria-expanded', 'false');
                                    }
                                }
                            }
                        }

                        // Restore tabs
                        if (state.tabs) {
                            for (const [groupId, tabId] of Object.entries(state.tabs)) {
                                const group = document.querySelector(\`[data-tab-group="\${groupId}"]\`);
                                if (group) {
                                    // Remove active from all tabs
                                    group.querySelectorAll('[data-tab]').forEach(tab => {
                                        tab.classList.remove('active');
                                    });
                                    // Add active to saved tab
                                    const activeTab = group.querySelector(\`[data-tab="\${tabId}"]\`);
                                    if (activeTab) {
                                        activeTab.classList.add('active');
                                    }
                                    // Show corresponding panel
                                    group.querySelectorAll('[data-tab-panel]').forEach(panel => {
                                        panel.style.display = panel.getAttribute('data-tab-panel') === tabId ? 'block' : 'none';
                                    });
                                }
                            }
                        }

                        // Restore scroll positions
                        if (state.scrolls) {
                            for (const [id, pos] of Object.entries(state.scrolls)) {
                                if (id === '__main') {
                                    window.scrollTo(pos.left, pos.top);
                                } else {
                                    const el = document.querySelector(\`[data-scroll-id="\${id}"]\`);
                                    if (el) {
                                        el.scrollTop = pos.top;
                                        el.scrollLeft = pos.left;
                                    }
                                }
                            }
                        }
                    }

                    // Export for user scripts
                    window.__captureState = captureState;
                    window.__restoreState = restoreState;
                })();

                ${scripts}
            </script>
        </body>
        </html>`;
    }

    /**
     * Post a message to the webview
     */
    postMessage(message: any): Thenable<boolean> {
        return this.panel.webview.postMessage(message);
    }

    /**
     * Register a message handler
     */
    onDidReceiveMessage(command: string, handler: (message: any) => void | Promise<void>): void;
    onDidReceiveMessage(handler: (message: any) => void | Promise<void>): void;
    onDidReceiveMessage(
        commandOrHandler: string | ((message: any) => void | Promise<void>),
        handler?: (message: any) => void | Promise<void>
    ): void {
        if (typeof commandOrHandler === 'string') {
            if (handler) {
                this.messageHandlers.set(commandOrHandler, handler);
            }
        } else {
            // Global handler - handle all messages
            this.messageHandlers.set('*', commandOrHandler);
        }
    }

    /**
     * Show the panel
     */
    show(viewColumn?: vscode.ViewColumn, preserveFocus?: boolean): void {
        this.panel.reveal(viewColumn, preserveFocus);
    }

    /**
     * Get webview instance
     */
    getWebview(): vscode.Webview {
        return this.panel.webview;
    }

    /**
     * Get panel instance
     */
    getPanel(): vscode.WebviewPanel {
        return this.panel;
    }

    /**
     * Convert a URI to a webview URI
     */
    asWebviewUri(uri: vscode.Uri): vscode.Uri {
        return this.panel.webview.asWebviewUri(uri);
    }

    /**
     * Get a resource URI for the webview
     */
    getResourceUri(relativePath: string): vscode.Uri {
        return this.asWebviewUri(
            vscode.Uri.joinPath(this.options.extensionUri, relativePath)
        );
    }

    /**
     * Update panel title
     */
    setTitle(title: string): void {
        this.panel.title = title;
    }

    /**
     * Update panel icon
     */
    setIconPath(iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri }): void {
        this.panel.iconPath = iconPath;
    }

    /**
     * Check if panel is visible
     */
    get visible(): boolean {
        return this.panel.visible;
    }

    /**
     * Check if panel is active
     */
    get active(): boolean {
        return this.panel.active;
    }

    /**
     * Get current view column
     */
    get viewColumn(): vscode.ViewColumn | undefined {
        return this.panel.viewColumn;
    }

    /**
     * Dispose the panel
     */
    dispose(): void {
        this.panel.dispose();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.messageHandlers.clear();
    }

    /**
     * Generate a nonce for CSP
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Escape HTML entities
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Static helper to create a simple panel with HTML
     */
    static createSimple(
        extensionUri: vscode.Uri,
        viewType: string,
        title: string,
        html: string,
        viewColumn: vscode.ViewColumn = vscode.ViewColumn.One
    ): Panel {
        const panel = new Panel({
            extensionUri,
            viewType,
            title,
            showOptions: viewColumn
        });

        panel.setHtml(html);
        panel.show();

        return panel;
    }
}
