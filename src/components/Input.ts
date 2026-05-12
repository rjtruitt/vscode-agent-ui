import { registry } from '../base/Registry';
import { escapeHtml } from '../utils/html';
/**
 * Input Component
 *
 * Text input field for user data entry with validation and various input types.
 *
 * @aiInstructions
 * Use Input for collecting text-based user input:
 * - Text and multiline text
 * - Numbers and ranges
 * - Passwords and emails
 * - Search queries
 *
 * Choose the appropriate type:
 * - 'text' for general text input
 * - 'textarea' for multiline text
 * - 'number' for numeric input
 * - 'password' for passwords
 * - 'email' for email addresses
 * - 'search' for search fields
 *
 * @aiExample
 * ```typescript
 * import { Input } from 'vscode-agent-ui/components';
 *
 * // Basic text input
 * const nameInput = Input.render({
 *   label: 'Name',
 *   placeholder: 'Enter your name',
 *   oninput: 'handleNameChange'
 * });
 *
 * // Password input
 * const passwordInput = Input.render({
 *   type: 'password',
 *   label: 'Password',
 *   required: true,
 *   minLength: 8
 * });
 *
 * // Textarea with description
 * const descInput = Input.render({
 *   type: 'textarea',
 *   label: 'Description',
 *   description: 'Provide a detailed description',
 *   rows: 5,
 *   maxLength: 500
 * });
 *
 * // Input with error
 * const emailInput = Input.render({
 *   type: 'email',
 *   label: 'Email',
 *   value: 'invalid-email',
 *   error: 'Please enter a valid email address'
 * });
 *
 * // Search input with icon
 * const searchInput = Input.render({
 *   type: 'search',
 *   placeholder: 'Search...',
 *   icon: '🔍'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Always provide a label for accessibility
 * - Use appropriate input type (don't use 'text' for passwords)
 * - Don't forget to handle oninput or onchange events
 * - Use placeholder for hints, not instructions
 *
 * @aiWhenToUse
 * Use Input when:
 * - Collecting single-line or multi-line text
 * - Need text validation
 * - Building forms
 *
 * Don't use Input when:
 * - Choosing from predefined options (use Select)
 * - Toggle on/off states (use Toggle)
 * - Date selection (use DatePicker)
 *
 * @aiRelatedComponents
 * - Select (for choosing from options)
 * - Toggle (for on/off switches)
 * - Button (for form submission)
 *
 * @aiAccessibility
 * - Always include label
 * - Support keyboard navigation
 * - Error messages linked to input
 * - Required fields marked clearly
 *
 * @aiPerformance
 * Inputs are lightweight. For real-time validation, debounce input handlers.
 */

export type InputType = 'text' | 'textarea' | 'number' | 'password' | 'email' | 'search' | 'url' | 'tel';

/**
 * Input component properties
 */
export interface InputProps {
    /** Input type */
    type?: InputType;

    /** Label text */
    label?: string;

    /** Input value */
    value?: string;

    /** Placeholder text */
    placeholder?: string;

    /** Description/help text */
    description?: string;

    /** Error message */
    error?: string;

    /** Icon (emoji or HTML) */
    icon?: string;

    /** Disabled state */
    disabled?: boolean;

    /** Required field */
    required?: boolean;

    /** Readonly state */
    readonly?: boolean;

    /** Input handler function name */
    oninput?: string;

    /** Change handler function name */
    onchange?: string;

    /** Min length for text */
    minLength?: number;

    /** Max length for text */
    maxLength?: number;

    /** Min value for number */
    min?: number;

    /** Max value for number */
    max?: number;

    /** Step for number input */
    step?: number;

    /** Rows for textarea */
    rows?: number;

    /** Auto resize textarea */
    autoResize?: boolean;

    /** Additional CSS classes */
    className?: string;

    /** Input name attribute */
    name?: string;

    /** Input id attribute */
    id?: string;
}

/**
 * Input Component - Pure function renderer
 */
export class Input {
    /**
     * Render an input to HTML string
     */
    static render(props: InputProps): string {
        const {
            type = 'text',
            label,
            value = '',
            placeholder,
            description,
            error,
            icon,
            disabled = false,
            required = false,
            readonly = false,
            oninput,
            onchange,
            minLength,
            maxLength,
            min,
            max,
            step,
            rows = 3,
            autoResize = false,
            className = '',
            name,
            id = `input-${Math.random().toString(36).substr(2, 9)}`
        } = props;

        // Build wrapper classes
        const wrapperClasses = [
            'vscode-input-wrapper',
            error && 'has-error',
            disabled && 'disabled',
            icon && 'has-icon',
            className
        ].filter(Boolean).join(' ');

        // Build input classes
        const inputClasses = [
            'vscode-input',
            type === 'textarea' && 'textarea',
            autoResize && 'auto-resize'
        ].filter(Boolean).join(' ');

        // Build input attributes
        const attrs = [
            name && `name="${escapeHtml(name)}"`,
            `id="${id}"`,
            placeholder && `placeholder="${escapeHtml(placeholder)}"`,
            disabled && 'disabled',
            required && 'required',
            readonly && 'readonly',
            oninput && `oninput="${oninput}(event)"`,
            onchange && `onchange="${onchange}(event)"`,
            type === 'number' && min !== undefined && `min="${min}"`,
            type === 'number' && max !== undefined && `max="${max}"`,
            type === 'number' && step !== undefined && `step="${step}"`,
            minLength !== undefined && `minlength="${minLength}"`,
            maxLength !== undefined && `maxlength="${maxLength}"`,
            `aria-describedby="${id}-desc"`,
            error && `aria-invalid="true"`,
            required && `aria-required="true"`
        ].filter(Boolean).join(' ');

        // Render input element
        const inputElement = type === 'textarea'
            ? `<textarea class="${inputClasses}" rows="${rows}" ${attrs}>${escapeHtml(value)}</textarea>`
            : `<input type="${type}" class="${inputClasses}" value="${escapeHtml(value)}" ${attrs}>`;

        return `
            <div class="${wrapperClasses}">
                ${label ? `
                    <label for="${id}" class="input-label">
                        ${escapeHtml(label)}
                        ${required ? '<span class="required-mark">*</span>' : ''}
                    </label>
                ` : ''}
                <div class="input-container">
                    ${icon ? `<span class="input-icon">${icon}</span>` : ''}
                    ${inputElement}
                </div>
                ${description && !error ? `
                    <div id="${id}-desc" class="input-description">
                        ${escapeHtml(description)}
                    </div>
                ` : ''}
                ${error ? `
                    <div id="${id}-desc" class="input-error" role="alert">
                        ${escapeHtml(error)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get CSS styles for inputs
     */
    static getStyles(): string {
        return `
            /* Input Wrapper */
            .vscode-input-wrapper {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            /* Input Label */
            .input-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--vscode-foreground);
                cursor: pointer;
            }

            .required-mark {
                color: var(--vscode-errorForeground);
                margin-left: 2px;
            }

            /* Input Container */
            .input-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .vscode-input-wrapper.has-icon .input-container {
                padding-left: 30px;
            }

            .input-icon {
                position: absolute;
                left: 8px;
                font-size: 16px;
                color: var(--vscode-descriptionForeground);
                pointer-events: none;
            }

            /* Input Base */
            .vscode-input {
                width: 100%;
                padding: 8px 12px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                font-size: 13px;
                font-family: var(--vscode-font-family);
                outline: none;
                transition: all 0.2s ease;
            }

            .vscode-input:focus {
                border-color: var(--vscode-focusBorder);
                box-shadow: 0 0 0 1px var(--vscode-focusBorder);
            }

            .vscode-input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .vscode-input::placeholder {
                color: var(--vscode-input-placeholderForeground);
            }

            /* Textarea */
            .vscode-input.textarea {
                resize: vertical;
                min-height: 60px;
            }

            .vscode-input.textarea.auto-resize {
                resize: none;
            }

            /* Error State */
            .vscode-input-wrapper.has-error .vscode-input {
                border-color: var(--vscode-errorForeground);
            }

            .vscode-input-wrapper.has-error .vscode-input:focus {
                box-shadow: 0 0 0 1px var(--vscode-errorForeground);
            }

            /* Input Description */
            .input-description {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
            }

            /* Input Error */
            .input-error {
                font-size: 11px;
                color: var(--vscode-errorForeground);
                font-weight: 500;
                line-height: 1.4;
            }

            /* Number input controls */
            .vscode-input[type="number"]::-webkit-inner-spin-button,
            .vscode-input[type="number"]::-webkit-outer-spin-button {
                opacity: 1;
            }
        `;
    }}
// Register component
registry.register('Input', Input);
