/**
 * Base Component Interface
 */

/**
 * Interface for all UI components in the library
 */
export interface UIComponent<P = any> {
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
 */
export interface StaticUIComponent<P = any> {
    new(): any;
    render(props: P): string;
    getStyles(): string;
}
