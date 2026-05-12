import { escapeHtml } from '../utils/html';
/**
 * DiffViewer Component
 *
 * Display code changes with GitHub-style before/after view.
 * Shows additions, deletions, and unchanged lines with syntax highlighting.
 *
 * @aiInstructions
 * Use DiffViewer to show code changes:
 * - File edits (before/after)
 * - Git diffs
 * - Tool operation results
 * - Code review changes
 * - Refactoring previews
 *
 * DiffViewer supports multiple modes:
 * - 'split': Side-by-side before/after (default)
 * - 'unified': Single column with +/- indicators
 * - 'inline': Compact inline changes
 *
 * @aiExample
 * ```typescript
 * import { DiffViewer } from 'vscode-agent-ui/components';
 *
 * const diff = DiffViewer.render({
 *   filename: 'src/index.ts',
 *   before: 'const x = 1;\nconst y = 2;',
 *   after: 'const x = 10;\nconst z = 3;',
 *   mode: 'unified'
 * });
 * ```
 *
 * @aiExample
 * ```typescript
 * // With diff lines format
 * const diff = DiffViewer.render({
 *   filename: 'config.json',
 *   lines: [
 *     { type: 'context', content: '{', lineNumbers: { before: 1, after: 1 } },
 *     { type: 'removed', content: '  "port": 3000,', lineNumbers: { before: 2 } },
 *     { type: 'added', content: '  "port": 8080,', lineNumbers: { after: 2 } },
 *     { type: 'context', content: '}', lineNumbers: { before: 3, after: 3 } }
 *   ]
 * });
 * ```
 */

export type DiffLineType = 'added' | 'removed' | 'context' | 'info';
export type DiffMode = 'unified' | 'split' | 'inline';

export interface DiffLine {
    /** Line type */
    type: DiffLineType;

    /** Line content */
    content: string;

    /** Line numbers */
    lineNumbers?: {
        before?: number;
        after?: number;
    };

    /** Highlight specific characters (for inline mode) */
    highlights?: Array<{ start: number; end: number }>;
}

export interface DiffViewerProps {
    /** Filename */
    filename?: string;

    /** Language for syntax highlighting */
    language?: string;

    /** Display mode */
    mode?: DiffMode;

    /** Before content (auto-diff with after) */
    before?: string;

    /** After content (auto-diff with before) */
    after?: string;

    /** Pre-computed diff lines */
    lines?: DiffLine[];

    /** Show line numbers */
    showLineNumbers?: boolean;

    /** Collapsible unchanged sections */
    collapseUnchanged?: boolean;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;
}

export class DiffViewer {
    static render(props: DiffViewerProps): string {
        const {
            filename,
            language,
            mode = 'unified',
            before,
            after,
            lines: providedLines,
            showLineNumbers = true,
            collapseUnchanged = false,
            className = '',
            style = {}
        } = props;

        const classes = [
            'diff-viewer',
            `mode-${mode}`,
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        // Generate diff lines if before/after provided
        let lines = providedLines || [];
        if (!lines.length && before !== undefined && after !== undefined) {
            lines = this.generateDiffLines(before, after);
        }

        const header = filename ? `
            <div class="diff-header">
                <span class="diff-filename">${escapeHtml(filename)}</span>
                ${language ? `<span class="diff-language">${escapeHtml(language)}</span>` : ''}
            </div>
        ` : '';

        const content = mode === 'split'
            ? this.renderSplit(lines, showLineNumbers)
            : this.renderUnified(lines, showLineNumbers);

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''}>
                ${header}
                ${content}
            </div>
        `;
    }

    private static renderUnified(lines: DiffLine[], showLineNumbers: boolean): string {
        return `
            <div class="diff-content unified">
                ${lines.map(line => {
                    const lineClass = `diff-line type-${line.type}`;
                    const indicator = line.type === 'added' ? '+' :
                                    line.type === 'removed' ? '-' : ' ';
                    const lineNum = line.lineNumbers?.after || line.lineNumbers?.before || '';

                    return `
                        <div class="${lineClass}">
                            ${showLineNumbers ? `<span class="line-num">${lineNum}</span>` : ''}
                            <span class="line-indicator">${indicator}</span>
                            <span class="line-content">${escapeHtml(line.content)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    private static renderSplit(lines: DiffLine[], showLineNumbers: boolean): string {
        return `
            <div class="diff-content split">
                <div class="split-column before">
                    <div class="column-header">Before</div>
                    ${lines.filter(l => l.type !== 'added').map(line => {
                        const lineClass = `diff-line type-${line.type}`;
                        const lineNum = line.lineNumbers?.before || '';

                        return `
                            <div class="${lineClass}">
                                ${showLineNumbers ? `<span class="line-num">${lineNum}</span>` : ''}
                                <span class="line-content">${escapeHtml(line.content)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="split-column after">
                    <div class="column-header">After</div>
                    ${lines.filter(l => l.type !== 'removed').map(line => {
                        const lineClass = `diff-line type-${line.type}`;
                        const lineNum = line.lineNumbers?.after || '';

                        return `
                            <div class="${lineClass}">
                                ${showLineNumbers ? `<span class="line-num">${lineNum}</span>` : ''}
                                <span class="line-content">${escapeHtml(line.content)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    private static generateDiffLines(before: string, after: string): DiffLine[] {
        const beforeLines = before.split('\n');
        const afterLines = after.split('\n');
        const lines: DiffLine[] = [];

        // Simple line-by-line diff
        const maxLen = Math.max(beforeLines.length, afterLines.length);
        let beforeIdx = 0;
        let afterIdx = 0;

        for (let i = 0; i < maxLen; i++) {
            const beforeLine = beforeLines[i];
            const afterLine = afterLines[i];

            if (beforeLine === afterLine && beforeLine !== undefined) {
                lines.push({
                    type: 'context',
                    content: beforeLine,
                    lineNumbers: { before: beforeIdx + 1, after: afterIdx + 1 }
                });
                beforeIdx++;
                afterIdx++;
            } else {
                if (beforeLine !== undefined) {
                    lines.push({
                        type: 'removed',
                        content: beforeLine,
                        lineNumbers: { before: beforeIdx + 1 }
                    });
                    beforeIdx++;
                }
                if (afterLine !== undefined) {
                    lines.push({
                        type: 'added',
                        content: afterLine,
                        lineNumbers: { after: afterIdx + 1 }
                    });
                    afterIdx++;
                }
            }
        }

        return lines;
    }

    static getStyles(): string {
        return `
            .diff-viewer {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                overflow: hidden;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 13px;
            }

            .diff-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--vscode-editorGroupHeader-tabsBackground);
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .diff-filename {
                font-weight: 600;
                color: var(--vscode-textLink-foreground);
            }

            .diff-language {
                font-size: 11px;
                opacity: 0.6;
                text-transform: uppercase;
            }

            .diff-content {
                overflow-x: auto;
            }

            .diff-content.unified {
                display: flex;
                flex-direction: column;
            }

            .diff-content.split {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1px;
                background: var(--vscode-panel-border);
            }

            .split-column {
                background: var(--vscode-editor-background);
                overflow-x: auto;
            }

            .column-header {
                padding: 4px 8px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                background: var(--vscode-editorGroupHeader-tabsBackground);
                border-bottom: 1px solid var(--vscode-panel-border);
                position: sticky;
                top: 0;
                z-index: 1;
            }

            .diff-line {
                display: flex;
                align-items: flex-start;
                min-height: 20px;
                line-height: 20px;
                white-space: pre;
            }

            .diff-line.type-added {
                background: rgba(76, 175, 80, 0.15);
                border-left: 3px solid rgba(76, 175, 80, 0.6);
            }

            .diff-line.type-removed {
                background: rgba(244, 67, 54, 0.15);
                border-left: 3px solid rgba(244, 67, 54, 0.6);
            }

            .diff-line.type-context {
                background: transparent;
            }

            .diff-line.type-info {
                background: rgba(100, 180, 255, 0.1);
                color: rgba(100, 180, 255, 0.8);
                font-style: italic;
            }

            .line-num {
                display: inline-block;
                width: 50px;
                padding: 0 8px;
                text-align: right;
                color: var(--vscode-editorLineNumber-foreground);
                opacity: 0.5;
                user-select: none;
                flex-shrink: 0;
            }

            .line-indicator {
                display: inline-block;
                width: 20px;
                text-align: center;
                user-select: none;
                flex-shrink: 0;
            }

            .type-added .line-indicator {
                color: rgba(76, 175, 80, 0.9);
            }

            .type-removed .line-indicator {
                color: rgba(244, 67, 54, 0.9);
            }

            .line-content {
                flex: 1;
                padding-right: 8px;
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
