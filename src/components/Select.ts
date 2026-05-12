import { escapeHtml } from '../utils/html';
/**
 * Select Component
 *
 * Dropdown selection component for choosing from predefined options.
 *
 * @aiInstructions
 * Use Select when users need to choose from a list of options:
 * - Single selection from many options
 * - Configuration settings
 * - Filter controls
 * - Form fields with predefined values
 *
 * For multiple selections, use MultiSelect component.
 * For few options (2-5), consider using Radio buttons or Toggle.
 *
 * @aiExample
 * ```typescript
 * import { Select } from 'vscode-agent-ui/components';
 *
 * // Basic select
 * const model = Select.render({
 *   label: 'Model',
 *   options: [
 *     { value: 'gpt-4', label: 'GPT-4' },
 *     { value: 'claude-3', label: 'Claude 3' },
 *     { value: 'llama-2', label: 'Llama 2' }
 *   ],
 *   value: 'claude-3',
 *   onchange: 'handleModelChange'
 * });
 *
 * // Select with grouped options
 * const toolSelect = Select.render({
 *   label: 'Tool',
 *   options: [
 *     {
 *       group: 'File Operations',
 *       items: [
 *         { value: 'read', label: 'Read File' },
 *         { value: 'write', label: 'Write File' }
 *       ]
 *     },
 *     {
 *       group: 'System Operations',
 *       items: [
 *         { value: 'bash', label: 'Execute Command' }
 *       ]
 *     }
 *   ]
 * });
 *
 * // Select with description
 * const priority = Select.render({
 *   label: 'Priority',
 *   description: 'Set task priority level',
 *   options: [
 *     { value: 'low', label: 'Low', icon: '🟢' },
 *     { value: 'medium', label: 'Medium', icon: '🟡' },
 *     { value: 'high', label: 'High', icon: '🔴' }
 *   ]
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't use Select for 2 options - use Toggle instead
 * - Always provide label for accessibility
 * - Don't forget onchange handler
 * - Provide value property to set selected option
 *
 * @aiWhenToUse
 * Use Select when:
 * - 3+ options to choose from
 * - Options are predefined
 * - Need compact UI
 * - Single selection needed
 *
 * Don't use Select when:
 * - Only 2 options (use Toggle)
 * - Need multiple selections (use MultiSelect)
 * - Options are dynamic/searchable (use Autocomplete)
 * - User needs to see all options at once (use Radio group)
 *
 * @aiRelatedComponents
 * - MultiSelect (for multiple selections)
 * - Toggle (for two options)
 * - Input (for free text)
 *
 * @aiAccessibility
 * - Native select element for keyboard support
 * - Label properly associated
 * - Optgroup for grouped options
 */

export interface SelectOption {
    /** Option value */
    value: string;

    /** Option label */
    label: string;

    /** Option icon (emoji or HTML) */
    icon?: string;

    /** Disabled state */
    disabled?: boolean;
}

export interface SelectOptionGroup {
    /** Group name */
    group: string;

    /** Options in this group */
    items: SelectOption[];
}

/**
 * Select component properties
 */
export interface SelectProps {
    /** Label text */
    label?: string;

    /** Selected value */
    value?: string;

    /** Options (flat array or grouped) */
    options: (SelectOption | SelectOptionGroup)[];

    /** Placeholder text */
    placeholder?: string;

    /** Description/help text */
    description?: string;

    /** Error message */
    error?: string;

    /** Disabled state */
    disabled?: boolean;

    /** Required field */
    required?: boolean;

    /** Change handler function name */
    onchange?: string;

    /** Additional CSS classes */
    className?: string;

    /** Select name attribute */
    name?: string;

    /** Select id attribute */
    id?: string;
}

/**
 * Select Component - Pure function renderer
 */
export class Select {
    /**
     * Render a select to HTML string
     */
    static render(props: SelectProps): string {
        const {
            label,
            value,
            options,
            placeholder,
            description,
            error,
            disabled = false,
            required = false,
            onchange,
            className = '',
            name,
            id = `select-${Math.random().toString(36).substr(2, 9)}`
        } = props;

        // Build wrapper classes
        const wrapperClasses = [
            'vscode-select-wrapper',
            error && 'has-error',
            disabled && 'disabled',
            className
        ].filter(Boolean).join(' ');

        // Build select attributes
        const attrs = [
            name && `name="${escapeHtml(name)}"`,
            `id="${id}"`,
            disabled && 'disabled',
            required && 'required',
            onchange && `onchange="${onchange}(event)"`,
            `aria-describedby="${id}-desc"`,
            error && `aria-invalid="true"`,
            required && `aria-required="true"`
        ].filter(Boolean).join(' ');

        // Render options
        const optionsHtml = options.map(opt => {
            if ('group' in opt) {
                return Select.renderOptGroup(opt as SelectOptionGroup, value);
            } else {
                return Select.renderOption(opt as SelectOption, value);
            }
        }).join('');

        return `
            <div class="${wrapperClasses}">
                ${label ? `
                    <label for="${id}" class="select-label">
                        ${escapeHtml(label)}
                        ${required ? '<span class="required-mark">*</span>' : ''}
                    </label>
                ` : ''}
                <div class="select-container">
                    <select class="vscode-select" ${attrs}>
                        ${placeholder ? `<option value="" disabled ${!value ? 'selected' : ''}>${escapeHtml(placeholder)}</option>` : ''}
                        ${optionsHtml}
                    </select>
                    <span class="select-arrow">▼</span>
                </div>
                ${description && !error ? `
                    <div id="${id}-desc" class="select-description">
                        ${escapeHtml(description)}
                    </div>
                ` : ''}
                ${error ? `
                    <div id="${id}-desc" class="select-error" role="alert">
                        ${escapeHtml(error)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render a single option
     */
    private static renderOption(option: SelectOption, selectedValue?: string): string {
        const selected = option.value === selectedValue ? 'selected' : '';
        const disabled = option.disabled ? 'disabled' : '';
        const label = option.icon ? `${option.icon} ${option.label}` : option.label;

        return `<option value="${escapeHtml(option.value)}" ${selected} ${disabled}>${escapeHtml(label)}</option>`;
    }

    /**
     * Render an option group
     */
    private static renderOptGroup(group: SelectOptionGroup, selectedValue?: string): string {
        const optionsHtml = group.items.map(opt => Select.renderOption(opt, selectedValue)).join('');
        return `
            <optgroup label="${escapeHtml(group.group)}">
                ${optionsHtml}
            </optgroup>
        `;
    }

    /**
     * Get CSS styles for selects
     */
    static getStyles(): string {
        return `
            /* Select Wrapper */
            .vscode-select-wrapper {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            /* Select Label */
            .select-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--vscode-foreground);
                cursor: pointer;
            }

            .required-mark {
                color: var(--vscode-errorForeground);
                margin-left: 2px;
            }

            /* Select Container */
            .select-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            /* Select Base */
            .vscode-select {
                width: 100%;
                padding: 8px 32px 8px 12px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                font-size: 13px;
                font-family: var(--vscode-font-family);
                outline: none;
                transition: all 0.2s ease;
                cursor: pointer;
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
            }

            .vscode-select:focus {
                border-color: var(--vscode-focusBorder);
                box-shadow: 0 0 0 1px var(--vscode-focusBorder);
            }

            .vscode-select:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Select Arrow */
            .select-arrow {
                position: absolute;
                right: 10px;
                font-size: 10px;
                color: var(--vscode-foreground);
                pointer-events: none;
            }

            /* Error State */
            .vscode-select-wrapper.has-error .vscode-select {
                border-color: var(--vscode-errorForeground);
            }

            .vscode-select-wrapper.has-error .vscode-select:focus {
                box-shadow: 0 0 0 1px var(--vscode-errorForeground);
            }

            /* Select Description */
            .select-description {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
            }

            /* Select Error */
            .select-error {
                font-size: 11px;
                color: var(--vscode-errorForeground);
                font-weight: 500;
                line-height: 1.4;
            }

            /* Option Groups */
            .vscode-select optgroup {
                font-weight: 600;
                color: var(--vscode-foreground);
            }

            .vscode-select option {
                padding: 4px 8px;
            }
        `;
    }}
