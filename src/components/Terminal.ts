/**
 * Terminal Component
 *
 * Interactive terminal with command input, scrollable output, and reactive behavior.
 * Can execute actual commands or be used as a display-only terminal.
 *
 * @aiInstructions
 * Use Terminal when you need:
 * - Interactive command execution interface
 * - Display of command output or logs
 * - Shell-like interaction with users
 * - Tool execution feedback
 * - Build/test output display
 *
 * Terminal supports two modes:
 * - Interactive: User can type commands and get responses
 * - Display-only: Shows output without input (set readonly: true)
 *
 * @aiExample
 * ```typescript
 * import { Terminal } from 'vscode-agent-ui/components';
 *
 * // Interactive terminal
 * const terminal = Terminal.render({
 *   id: 'main-terminal',
 *   prompt: '$ ',
 *   onCommand: 'handleCommand'
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // Display-only with initial output
 * const outputTerminal = Terminal.render({
 *   id: 'build-output',
 *   readonly: true,
 *   initialOutput: [
 *     { type: 'output', text: 'Building project...' },
 *     { type: 'success', text: 'Build complete!' },
 *     { type: 'error', text: 'Warning: 2 unused imports' }
 *   ]
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Forgetting to handle the onCommand callback - commands won't execute
 * - Not setting a unique ID - state won't be preserved
 * - Not adding data-scroll-id if you want scroll position preserved
 * - Making the terminal too small - hard to read output
 *
 * @aiWhenToUse
 * Use Terminal when:
 * - Need shell-like command interface
 * - Displaying command/tool output
 * - Want interactive REPL-style interaction
 * - Showing build/test logs
 *
 * Don't use Terminal when:
 * - Simple text display (use Card or plain HTML)
 * - Need structured data display (use Table)
 * - Chat interface (use ChatWindow)
 */

export type TerminalLineType = 'command' | 'output' | 'error' | 'success' | 'warning' | 'info';

export interface TerminalLine {
    /** Line type (affects styling) */
    type: TerminalLineType;

    /** Line text content */
    text: string;

    /** Optional timestamp */
    timestamp?: number;
}

export interface TerminalProps {
    /** Unique terminal ID (required for state preservation) */
    id: string;

    /** Command prompt string (e.g., '$ ' or '> ') */
    prompt?: string;

    /** Initial output lines */
    initialOutput?: TerminalLine[];

    /** Readonly mode (no input) */
    readonly?: boolean;

    /** Show timestamps */
    showTimestamps?: boolean;

    /** Max lines to keep (older lines are removed) */
    maxLines?: number;

    /** Height in pixels or CSS value */
    height?: string;

    /** Command handler function name */
    onCommand?: string;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;

    /** Enable auto-scroll to bottom */
    autoScroll?: boolean;
}

export class Terminal {
    static render(props: TerminalProps): string {
        const {
            id,
            prompt = '$ ',
            initialOutput = [],
            readonly = false,
            showTimestamps = false,
            maxLines = 1000,
            height = '400px',
            onCommand,
            className = '',
            style = {},
            autoScroll = true
        } = props;

        const classes = [
            'vscode-terminal',
            readonly && 'readonly',
            className
        ].filter(Boolean).join(' ');

        const styles = {
            height,
            ...style
        };

        const styleStr = Object.entries(styles)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        // Render initial output lines
        const outputHtml = initialOutput.map(line => this.renderLine(line, showTimestamps)).join('');

        return `
            <div class="${classes}" id="${this.escapeHtml(id)}" ${styleStr ? `style="${styleStr}"` : ''}>
                <div class="terminal-output" data-scroll-id="${this.escapeHtml(id)}-output">
                    ${outputHtml}
                </div>
                ${!readonly ? `
                <div class="terminal-input-line">
                    <span class="terminal-prompt">${this.escapeHtml(prompt)}</span>
                    <input
                        type="text"
                        class="terminal-input"
                        id="${this.escapeHtml(id)}-input"
                        autocomplete="off"
                        spellcheck="false"
                        ${onCommand ? `onkeydown="__handleTerminalInput(event, '${this.escapeHtml(id)}', '${onCommand}')"` : ''}
                    />
                </div>
                ` : ''}
            </div>
            <script>
                if (!window.__terminalHistory) {
                    window.__terminalHistory = {};
                }
                if (!window.__terminalHistory['${this.escapeHtml(id)}']) {
                    window.__terminalHistory['${this.escapeHtml(id)}'] = {
                        history: [],
                        historyIndex: -1
                    };
                }

                if (!window.__handleTerminalInput) {
                    window.__handleTerminalInput = function(event, terminalId, commandHandler) {
                        if (event.key === 'Enter') {
                            const input = document.getElementById(terminalId + '-input');
                            const command = input.value.trim();

                            if (command) {
                                // Add to history
                                window.__terminalHistory[terminalId].history.push(command);
                                window.__terminalHistory[terminalId].historyIndex = window.__terminalHistory[terminalId].history.length;

                                // Add command to output
                                __addTerminalLine(terminalId, 'command', command);

                                // Clear input
                                input.value = '';

                                // Call handler
                                if (window[commandHandler]) {
                                    window[commandHandler](command, terminalId);
                                }
                            }
                            event.preventDefault();
                        } else if (event.key === 'ArrowUp') {
                            // Previous command in history
                            const hist = window.__terminalHistory[terminalId];
                            if (hist.historyIndex > 0) {
                                hist.historyIndex--;
                                const input = document.getElementById(terminalId + '-input');
                                input.value = hist.history[hist.historyIndex];
                            }
                            event.preventDefault();
                        } else if (event.key === 'ArrowDown') {
                            // Next command in history
                            const hist = window.__terminalHistory[terminalId];
                            if (hist.historyIndex < hist.history.length - 1) {
                                hist.historyIndex++;
                                const input = document.getElementById(terminalId + '-input');
                                input.value = hist.history[hist.historyIndex];
                            } else {
                                hist.historyIndex = hist.history.length;
                                const input = document.getElementById(terminalId + '-input');
                                input.value = '';
                            }
                            event.preventDefault();
                        }
                    };
                }

                if (!window.__addTerminalLine) {
                    window.__addTerminalLine = function(terminalId, type, text, timestamp) {
                        const output = document.querySelector('#' + terminalId + ' .terminal-output');
                        if (!output) return;

                        const line = document.createElement('div');
                        line.className = 'terminal-line type-' + type;

                        if (timestamp) {
                            const time = document.createElement('span');
                            time.className = 'terminal-timestamp';
                            time.textContent = new Date(timestamp).toLocaleTimeString() + ' ';
                            line.appendChild(time);
                        }

                        if (type === 'command') {
                            const prompt = document.createElement('span');
                            prompt.className = 'terminal-prompt';
                            prompt.textContent = '${this.escapeHtml(prompt)}';
                            line.appendChild(prompt);
                        }

                        const content = document.createElement('span');
                        content.className = 'terminal-content';
                        content.textContent = text;
                        line.appendChild(content);

                        output.appendChild(line);

                        // Remove old lines if over limit
                        const maxLines = ${maxLines};
                        const lines = output.querySelectorAll('.terminal-line');
                        if (lines.length > maxLines) {
                            for (let i = 0; i < lines.length - maxLines; i++) {
                                lines[i].remove();
                            }
                        }

                        // Auto-scroll
                        ${autoScroll ? 'output.scrollTop = output.scrollHeight;' : ''}
                    };
                }

                if (!window.__clearTerminal) {
                    window.__clearTerminal = function(terminalId) {
                        const output = document.querySelector('#' + terminalId + ' .terminal-output');
                        if (output) {
                            output.innerHTML = '';
                        }
                    };
                }
            </script>
        `;
    }

    private static renderLine(line: TerminalLine, showTimestamp: boolean): string {
        const timestamp = showTimestamp && line.timestamp
            ? `<span class="terminal-timestamp">${new Date(line.timestamp).toLocaleTimeString()}</span> `
            : '';

        const prompt = line.type === 'command'
            ? `<span class="terminal-prompt">$ </span>`
            : '';

        return `
            <div class="terminal-line type-${line.type}">
                ${timestamp}
                ${prompt}
                <span class="terminal-content">${this.escapeHtml(line.text)}</span>
            </div>
        `;
    }

    static getStyles(): string {
        return `
            .vscode-terminal {
                display: flex;
                flex-direction: column;
                background: var(--vscode-terminal-background, #1e1e1e);
                color: var(--vscode-terminal-foreground, #cccccc);
                font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                font-size: 13px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                overflow: hidden;
            }

            .terminal-output {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                min-height: 0;
            }

            .terminal-line {
                display: flex;
                align-items: flex-start;
                line-height: 1.5;
                margin-bottom: 2px;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .terminal-line.type-command {
                color: var(--vscode-terminal-ansiBrightWhite, #ffffff);
            }

            .terminal-line.type-output {
                color: var(--vscode-terminal-foreground, #cccccc);
            }

            .terminal-line.type-error {
                color: var(--vscode-terminal-ansiBrightRed, #ff5555);
            }

            .terminal-line.type-success {
                color: var(--vscode-terminal-ansiBrightGreen, #50fa7b);
            }

            .terminal-line.type-warning {
                color: var(--vscode-terminal-ansiBrightYellow, #f1fa8c);
            }

            .terminal-line.type-info {
                color: var(--vscode-terminal-ansiBrightCyan, #8be9fd);
            }

            .terminal-timestamp {
                opacity: 0.5;
                margin-right: 4px;
                font-size: 11px;
            }

            .terminal-prompt {
                color: var(--vscode-terminal-ansiBrightGreen, #50fa7b);
                margin-right: 4px;
                user-select: none;
            }

            .terminal-content {
                flex: 1;
            }

            .terminal-input-line {
                display: flex;
                align-items: center;
                padding: 12px;
                border-top: 1px solid var(--vscode-panel-border);
                background: var(--vscode-input-background);
            }

            .terminal-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--vscode-terminal-foreground);
                font-family: inherit;
                font-size: inherit;
                padding: 0;
                margin: 0;
            }

            .vscode-terminal.readonly .terminal-output {
                padding-bottom: 8px;
            }

            /* Scrollbar styling */
            .terminal-output::-webkit-scrollbar {
                width: 10px;
            }

            .terminal-output::-webkit-scrollbar-track {
                background: transparent;
            }

            .terminal-output::-webkit-scrollbar-thumb {
                background: var(--vscode-scrollbarSlider-background);
                border-radius: 5px;
            }

            .terminal-output::-webkit-scrollbar-thumb:hover {
                background: var(--vscode-scrollbarSlider-hoverBackground);
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
