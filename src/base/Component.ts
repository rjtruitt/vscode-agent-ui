/**
 * Base Component Interface
 *
 * Core type definitions for all UI components in the library.
 * Components use static methods for rendering (no instantiation needed).
 *
 * @aiInstructions
 * All components must implement the UIComponent interface with proper prop types.
 * Components are pure functions that take props and return HTML strings.
 * Use BaseProps for standard className and data attributes.
 *
 * @aiExample
 * ```typescript
 * import { UIComponent, BaseProps } from 'vscode-agent-ui/base';
 *
 * interface MyComponentProps extends BaseProps {
 *   title: string;
 *   count: number;
 * }
 *
 * export class MyComponent implements UIComponent<MyComponentProps> {
 *   static render(props: MyComponentProps): string {
 *     return `<div class="${props.className || ''}">${props.title}: ${props.count}</div>`;
 *   }
 *
 *   static getStyles(): string {
 *     return '.my-component { padding: 8px; }';
 *   }
 * }
 * ```
 */

/**
 * Base props that all components can accept
 */
export interface BaseProps {
    /** Additional CSS classes */
    className?: string;
    /** Data attributes for custom metadata */
    data?: Record<string, string>;
}

/**
 * Interface for all UI components in the library
 *
 * Components are implemented as classes with static methods.
 * This allows tree-shaking and avoids unnecessary instantiation.
 *
 * @template P - Props type extending BaseProps
 */
export interface UIComponent<P extends BaseProps = BaseProps> {
    /**
     * Render the component to an HTML string
     *
     * Pure function that takes props and returns HTML.
     * Never throws - validation errors should be handled gracefully.
     *
     * @param props - Component properties
     * @returns HTML string representation
     */
    render(props: P): string;

    /**
     * Get the CSS styles required for this component
     *
     * Returns a string of CSS rules that should be injected once.
     * Styles use CSS custom properties (variables) for theming.
     *
     * @returns CSS string
     */
    getStyles(): string;
}

/**
 * Type for component classes with static methods
 *
 * Used by the registry to store components without needing
 * to know their specific prop types at compile time.
 *
 * Uses structural typing to accept any class with render and getStyles static methods,
 * regardless of the specific prop types they accept.
 *
 * Note: Uses `unknown` for flexibility while maintaining type safety - the registry
 * performs runtime validation of component structure.
 */
export type StaticUIComponent = {
    /** Constructor signature (components are never instantiated) */
    new(...args: unknown[]): unknown;
    /** Render method that returns HTML string */
    render(props: unknown): string;
    /** Get component styles */
    getStyles(): string;
}
