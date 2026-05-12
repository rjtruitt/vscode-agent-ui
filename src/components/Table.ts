import { registry } from '../base/Registry';
import { escapeHtml } from '../utils/html';
/**
 * Table Component
 *
 * Data table with sorting, filtering, and customizable columns.
 *
 * @aiInstructions
 * Use Table for displaying tabular data:
 * - Lists of items
 * - Log entries
 * - File listings
 * - Configuration data
 * - Metrics and statistics
 *
 * Table supports:
 * - Column sorting
 * - Row selection
 * - Custom cell rendering
 * - Hover effects
 * - Striped rows
 * - Compact or comfortable sizing
 *
 * @aiExample
 * ```typescript
 * import { Table } from 'vscode-agent-ui/components';
 *
 * // Basic table
 * const table = Table.render({
 *   columns: [
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'status', label: 'Status' },
 *     { key: 'progress', label: 'Progress' }
 *   ],
 *   data: [
 *     { name: 'Task 1', status: 'Running', progress: '75%' },
 *     { name: 'Task 2', status: 'Completed', progress: '100%' },
 *     { name: 'Task 3', status: 'Pending', progress: '0%' }
 *   ]
 * });
 *
 * // Table with custom cell rendering
 * const customTable = Table.render({
 *   columns: [
 *     {
 *       key: 'name',
 *       label: 'Name',
 *       sortable: true,
 *       width: '40%'
 *     },
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       render: (value) => Badge.render({
 *         text: value,
 *         variant: value === 'Running' ? 'success' : 'default'
 *       })
 *     }
 *   ],
 *   data: tasks,
 *   striped: true,
 *   hoverable: true
 * });
 *
 * // Compact table with row click
 * const clickableTable = Table.render({
 *   columns: [
 *     { key: 'file', label: 'File' },
 *     { key: 'size', label: 'Size', align: 'right' }
 *   ],
 *   data: files,
 *   compact: true,
 *   onRowClick: 'handleFileClick'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Not providing unique keys for data rows (use data-id attribute)
 * - Forgetting to handle sorting on sortable columns
 * - Making all columns sortable when some shouldn't be
 * - Not setting column widths for better control
 *
 * @aiWhenToUse
 * Use Table when:
 * - Displaying rows of structured data
 * - Need sorting or filtering
 * - Data has multiple attributes
 * - Users need to scan data quickly
 *
 * Don't use Table when:
 * - Single column list (use list elements)
 * - Hierarchical data (use Tree)
 * - Complex nested structure (use custom layout)
 * - Very large datasets (consider virtualization)
 *
 * @aiRelatedComponents
 * - Tree (for hierarchical data)
 * - Card (for grid layouts)
 * - Badge (for status indicators in cells)
 *
 * @aiAccessibility
 * - Semantic table elements
 * - Column headers properly marked
 * - Sortable columns indicate state
 * - Keyboard navigation support
 *
 * @aiPerformance
 * For large tables (100+ rows), consider:
 * - Pagination
 * - Virtual scrolling
 * - Lazy loading
 * - Client-side filtering
 */

export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Table column definition
 */
export interface TableColumn {
    /** Column key (matches data object key) */
    key: string;

    /** Column label */
    label: string;

    /** Column width (CSS value) */
    width?: string;

    /** Text alignment */
    align?: ColumnAlign;

    /** Is column sortable */
    sortable?: boolean;

    /** Custom cell renderer */
    render?: (value: any, row: any) => string;
}

/**
 * Table component properties
 */
export interface TableProps {
    /** Column definitions */
    columns: TableColumn[];

    /** Table data */
    data: any[];

    /** Striped rows */
    striped?: boolean;

    /** Hoverable rows */
    hoverable?: boolean;

    /** Compact sizing */
    compact?: boolean;

    /** Show borders */
    bordered?: boolean;

    /** Row click handler function name */
    onRowClick?: string;

    /** Empty state message */
    emptyMessage?: string;

    /** Additional CSS classes */
    className?: string;

    /** Table caption */
    caption?: string;
}

/**
 * Table Component - Pure function renderer
 */
export class Table {
    /**
     * Render a table to HTML string
     */
    static render(props: TableProps): string {
        const {
            columns,
            data,
            striped = false,
            hoverable = false,
            compact = false,
            bordered = true,
            onRowClick,
            emptyMessage = 'No data available',
            className = '',
            caption
        } = props;

        const tableClasses = [
            'vscode-table',
            striped && 'striped',
            hoverable && 'hoverable',
            compact && 'compact',
            bordered && 'bordered',
            onRowClick && 'clickable',
            className
        ].filter(Boolean).join(' ');

        // Render table header
        const headerHtml = `
            <thead>
                <tr>
                    ${columns.map(col => {
                        const headerClasses = [
                            'table-header',
                            col.sortable && 'sortable',
                            col.align && `align-${col.align}`
                        ].filter(Boolean).join(' ');

                        return `
                            <th
                                class="${headerClasses}"
                                ${col.width ? `style="width: ${col.width}"` : ''}
                                ${col.sortable ? `onclick="handleSort('${col.key}')"` : ''}
                            >
                                ${escapeHtml(col.label)}
                                ${col.sortable ? '<span class="sort-indicator"></span>' : ''}
                            </th>
                        `;
                    }).join('')}
                </tr>
            </thead>
        `;

        // Render table body
        const bodyHtml = data.length > 0 ? `
            <tbody>
                ${data.map((row, index) => {
                    const rowClasses = [
                        'table-row'
                    ].filter(Boolean).join(' ');

                    const rowAttrs = [
                        `data-index="${index}"`,
                        onRowClick && `onclick="${onRowClick}(event, ${index})"`
                    ].filter(Boolean).join(' ');

                    return `
                        <tr class="${rowClasses}" ${rowAttrs}>
                            ${columns.map(col => {
                                const value = row[col.key];
                                const cellContent = col.render
                                    ? col.render(value, row)
                                    : escapeHtml(String(value ?? ''));

                                const cellClasses = [
                                    'table-cell',
                                    col.align && `align-${col.align}`
                                ].filter(Boolean).join(' ');

                                return `<td class="${cellClasses}">${cellContent}</td>`;
                            }).join('')}
                        </tr>
                    `;
                }).join('')}
            </tbody>
        ` : `
            <tbody>
                <tr>
                    <td colspan="${columns.length}" class="table-empty">
                        ${escapeHtml(emptyMessage)}
                    </td>
                </tr>
            </tbody>
        `;

        return `
            <table class="${tableClasses}">
                ${caption ? `<caption>${escapeHtml(caption)}</caption>` : ''}
                ${headerHtml}
                ${bodyHtml}
            </table>
        `;
    }

    /**
     * Get CSS styles for tables
     */
    static getStyles(): string {
        return `
            /* Table Base */
            .vscode-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
                color: var(--vscode-foreground);
            }

            .vscode-table caption {
                padding: 8px;
                font-weight: 600;
                text-align: left;
                color: var(--vscode-foreground);
            }

            /* Table Header */
            .table-header {
                padding: 12px;
                background: var(--vscode-sideBar-background);
                border-bottom: 2px solid var(--vscode-panel-border);
                text-align: left;
                font-weight: 600;
                white-space: nowrap;
            }

            .table-header.sortable {
                cursor: pointer;
                user-select: none;
                transition: background 0.2s ease;
            }

            .table-header.sortable:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .table-header.align-center {
                text-align: center;
            }

            .table-header.align-right {
                text-align: right;
            }

            .sort-indicator {
                margin-left: 4px;
                opacity: 0.3;
            }

            .sort-indicator::after {
                content: '⇅';
            }

            .table-header.sort-asc .sort-indicator::after {
                content: '↑';
                opacity: 1;
            }

            .table-header.sort-desc .sort-indicator::after {
                content: '↓';
                opacity: 1;
            }

            /* Table Cell */
            .table-cell {
                padding: 12px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .table-cell.align-center {
                text-align: center;
            }

            .table-cell.align-right {
                text-align: right;
            }

            /* Table Row */
            .table-row {
                transition: background 0.2s ease;
            }

            /* Variants */
            .vscode-table.striped .table-row:nth-child(even) {
                background: var(--vscode-list-hoverBackground);
            }

            .vscode-table.hoverable .table-row:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .vscode-table.clickable .table-row {
                cursor: pointer;
            }

            .vscode-table.clickable .table-row:active {
                background: var(--vscode-list-activeSelectionBackground);
                color: var(--vscode-list-activeSelectionForeground);
            }

            .vscode-table.compact .table-header,
            .vscode-table.compact .table-cell {
                padding: 6px 8px;
            }

            .vscode-table.bordered {
                border: 1px solid var(--vscode-panel-border);
            }

            /* Empty State */
            .table-empty {
                padding: 32px;
                text-align: center;
                color: var(--vscode-descriptionForeground);
                font-style: italic;
            }
        `;
    }

    /**
     * Get JavaScript for sorting functionality
     */
    static getSortingScript(): string {
        return `
            let currentSortColumn = null;
            let currentSortDirection = 'asc';

            function handleSort(columnKey) {
                // Update sort direction
                if (currentSortColumn === columnKey) {
                    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortColumn = columnKey;
                    currentSortDirection = 'asc';
                }

                // Update UI indicators
                document.querySelectorAll('.table-header').forEach(header => {
                    header.classList.remove('sort-asc', 'sort-desc');
                });

                const header = document.querySelector(\`.table-header[onclick*="\${columnKey}"]\`);
                if (header) {
                    header.classList.add(\`sort-\${currentSortDirection}\`);
                }

                // Notify extension to re-sort data
                postMessage('sort', {
                    column: columnKey,
                    direction: currentSortDirection
                });
            }
        `;
    }}
// Register component
registry.register('Table', Table);
