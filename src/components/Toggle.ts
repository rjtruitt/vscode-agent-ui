import { escapeHtml } from '../utils/html';
import { ValidationError } from '../utils/errors';

/**
 * Toggle Component
 *
 * Switch control for toggling between two states (on/off, enabled/disabled).
 *
 * @aiInstructions
 * Use Toggle for binary on/off states:
 * - Enable/disable features
 * - Show/hide content
 * - Turn settings on/off
 * - Activate/deactivate modes
 *
 * Toggle is perfect for settings panels and preferences.
 * It provides immediate visual feedback of the current state.
 *
 * @aiExample
 * ```typescript
 * import { Toggle } from 'vscode-agent-ui/components';
 *
 * // Basic toggle
 * const darkMode = Toggle.render({
 *   label: 'Dark Mode',
 *   checked: true,
 *   onchange: 'handleDarkModeToggle'
 * });
 *
 * // Toggle with description
 * const autoSave = Toggle.render({
 *   label: 'Auto Save',
 *   description: 'Automatically save changes every 30 seconds',
 *   checked: false,
 *   onchange: 'handleAutoSaveToggle'
 * });
 *
 * // Disabled toggle
 * const premium = Toggle.render({
 *   label: 'Premium Features',
 *   description: 'Upgrade to enable premium features',
 *   disabled: true,
 *   checked: false
 * });
 *
 * // Small toggle
 * const compact = Toggle.render({
 *   label: 'Notifications',
 *   checked: true,
 *   size: 'small'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't use Toggle for multiple options - use Select or Radio
 * - Always provide a clear label
 * - Don't use Toggle for actions - use Button instead
 * - Make sure onchange handler updates the state
 *
 * @aiWhenToUse
 * Use Toggle when:
 * - Exactly two states (on/off)
 * - Immediate effect on toggle
 * - Settings or preferences
 * - Enable/disable features
 *
 * Don't use Toggle when:
 * - More than two options (use Select)
 * - Action required after toggle (use Checkbox + Button)
 * - Need to submit form (use Checkbox)
 *
 * @aiRelatedComponents
 * - Checkbox (for form submission)
 * - Select (for multiple options)
 * - Button (for actions)
 *
 * @aiAccessibility
 * - Uses role="switch" for screen readers
 * - Keyboard accessible (Space to toggle)
 * - Clear visual state indication
 * - Label properly associated
 */

export type ToggleSize = 'small' | 'medium' | 'large';

/**
 * Toggle component properties
 */
export interface ToggleProps {
    /** Label text */
    label: string;

    /** Checked state */
    checked: boolean;

    /** Description/help text */
    description?: string;

    /** Disabled state */
    disabled?: boolean;

    /** Toggle size */
    size?: ToggleSize;

    /** Change handler function name */
    onchange?: string;

    /** Additional CSS classes */
    className?: string;

    /** Toggle name attribute */
    name?: string;

    /** Toggle id attribute */
    id?: string;
}

/**
 * Toggle Component - Pure function renderer
 */
export class Toggle {
    /**
     * Render a toggle to HTML string
     *
     * @throws {ValidationError} If props are invalid
     */
    static render(props: ToggleProps): string {
        // Validate required label
        if (!props.label || typeof props.label !== 'string' || props.label.trim() === '') {
            throw new ValidationError('Toggle label is required and must be a non-empty string', {
                field: 'label',
                received: props.label,
            });
        }

        // Validate required checked state
        if (typeof props.checked !== 'boolean') {
            throw new ValidationError('Toggle checked state is required and must be a boolean', {
                field: 'checked',
                received: props.checked,
                expected: 'boolean',
            });
        }

        const {
            label,
            checked,
            description,
            disabled = false,
            size = 'medium',
            onchange,
            className = '',
            name,
            id = `toggle-${Math.random().toString(36).substr(2, 9)}`
        } = props;

        // Validate size
        const validSizes: ToggleSize[] = ['small', 'medium', 'large'];
        if (!validSizes.includes(size)) {
            throw new ValidationError('Invalid toggle size', {
                field: 'size',
                expected: validSizes.join(' | '),
                received: size,
            });
        }

        // Build wrapper classes
        const wrapperClasses = [
            'vscode-toggle-wrapper',
            `size-${size}`,
            disabled && 'disabled',
            className
        ].filter(Boolean).join(' ');

        // Build attributes
        const attrs = [
            name && `name="${escapeHtml(name)}"`,
            `id="${id}"`,
            disabled && 'disabled',
            checked && 'checked',
            onchange && `onchange="${onchange}(event)"`,
            `role="switch"`,
            `aria-checked="${checked}"`,
            description && `aria-describedby="${id}-desc"`
        ].filter(Boolean).join(' ');

        return `
            <div class="${wrapperClasses}">
                <div class="toggle-control">
                    <input type="checkbox" class="toggle-input" ${attrs}>
                    <label for="${id}" class="toggle-switch">
                        <span class="toggle-slider"></span>
                    </label>
                    <label for="${id}" class="toggle-label">
                        ${escapeHtml(label)}
                    </label>
                </div>
                ${description ? `
                    <div id="${id}-desc" class="toggle-description">
                        ${escapeHtml(description)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get CSS styles for toggles
     */
    static getStyles(): string {
        return `
            /* Toggle Wrapper */
            .vscode-toggle-wrapper {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            /* Toggle Control */
            .toggle-control {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            /* Hide native checkbox */
            .toggle-input {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
                pointer-events: none;
            }

            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 20px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .toggle-switch:hover {
                border-color: var(--vscode-focusBorder);
            }

            /* Toggle Slider */
            .toggle-slider {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 14px;
                height: 14px;
                background: var(--vscode-foreground);
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            /* Checked State */
            .toggle-input:checked + .toggle-switch {
                background: var(--vscode-button-background);
                border-color: var(--vscode-button-background);
            }

            .toggle-input:checked + .toggle-switch .toggle-slider {
                transform: translateX(20px);
                background: var(--vscode-button-foreground);
            }

            /* Focus State */
            .toggle-input:focus + .toggle-switch {
                outline: 2px solid var(--vscode-focusBorder);
                outline-offset: 2px;
            }

            /* Disabled State */
            .vscode-toggle-wrapper.disabled .toggle-switch {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .toggle-input:disabled + .toggle-switch {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Toggle Label */
            .toggle-label {
                font-size: 13px;
                color: var(--vscode-foreground);
                cursor: pointer;
                user-select: none;
            }

            .vscode-toggle-wrapper.disabled .toggle-label {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Toggle Description */
            .toggle-description {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
                margin-left: 50px;
            }

            /* Sizes */
            .vscode-toggle-wrapper.size-small .toggle-switch {
                width: 32px;
                height: 16px;
            }

            .vscode-toggle-wrapper.size-small .toggle-slider {
                width: 10px;
                height: 10px;
            }

            .vscode-toggle-wrapper.size-small .toggle-input:checked + .toggle-switch .toggle-slider {
                transform: translateX(16px);
            }

            .vscode-toggle-wrapper.size-small .toggle-label {
                font-size: 12px;
            }

            .vscode-toggle-wrapper.size-small .toggle-description {
                margin-left: 42px;
            }

            .vscode-toggle-wrapper.size-large .toggle-switch {
                width: 48px;
                height: 24px;
            }

            .vscode-toggle-wrapper.size-large .toggle-slider {
                width: 18px;
                height: 18px;
            }

            .vscode-toggle-wrapper.size-large .toggle-input:checked + .toggle-switch .toggle-slider {
                transform: translateX(24px);
            }

            .vscode-toggle-wrapper.size-large .toggle-label {
                font-size: 14px;
            }

            .vscode-toggle-wrapper.size-large .toggle-description {
                margin-left: 58px;
            }
        `;
    }}
