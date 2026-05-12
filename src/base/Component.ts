/**
 * Base Component Interface
 */

/**
 * Base props that all components can accept
 */
export interface BaseProps {
    /** Additional CSS classes */
    className?: string;
    /** Data attributes */
    data?: Record<string, string>;
}

/**
 * Interface for all UI components in the library
 */
export interface UIComponent<P = BaseProps> {
    /**
     * Render the component to an HTML string
     * @param props Component properties
     */
    render(props: P): string;

    /**
     * Get the CSS styles required for this component
     */
    getStyles(): string;
}

/**
 * Type helper for component classes (which have static methods)
 * Uses loose typing to accommodate various prop types
 */
export interface StaticUIComponent {
    new(): unknown;
    render(props: unknown): string;
    getStyles(): string;
}
