/**
 * Button Component Types
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Button component properties
 */
export interface ButtonProps {
    /** Button text label */
    text?: string;

    /** Button icon (emoji or HTML) */
    icon?: string;

    /** Visual variant */
    variant?: ButtonVariant;

    /** Button size */
    size?: ButtonSize;

    /** Button type for forms */
    type?: ButtonType;

    /** Disabled state */
    disabled?: boolean;

    /** Loading state (shows spinner) */
    loading?: boolean;

    /** Click handler function name */
    onclick?: string;

    /** Tooltip text */
    tooltip?: string;

    /** ARIA label for accessibility */
    ariaLabel?: string;

    /** Additional CSS classes */
    className?: string;

    /** Data attributes for custom handling */
    data?: Record<string, string>;

    /** Full width button */
    fullWidth?: boolean;
}
