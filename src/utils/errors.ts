/**
 * Typed Error System
 *
 * Production-grade error classes for structured error handling.
 * Never throw raw Error objects - always use these typed error classes.
 *
 * @aiInstructions
 * Use typed errors for all error conditions. Each error type includes:
 * - Structured error code for programmatic handling
 * - Clear error message for debugging
 * - Optional context data for additional information
 * - Proper inheritance for type checking
 *
 * @aiExample
 * ```typescript
 * import { ValidationError, ComponentError } from 'vscode-agent-ui/utils/errors';
 *
 * // Validation error
 * throw new ValidationError('Invalid props', {
 *   field: 'variant',
 *   expected: 'primary | secondary',
 *   received: 'invalid'
 * });
 *
 * // Component error
 * throw new ComponentError('Button', 'Failed to render', {
 *   reason: 'Missing required prop: text'
 * });
 *
 * // Catching typed errors
 * try {
 *   Button.render(props);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Validation failed:', error.context);
 *   }
 * }
 * ```
 *
 * @aiCommonMistakes
 * - Don't throw raw Error objects - always use typed errors
 * - Don't create error instances without a clear message
 * - Include context data for debugging
 *
 * @aiWhenToUse
 * Use typed errors for:
 * - Input validation failures
 * - Component rendering errors
 * - Configuration errors
 * - Any error condition that needs structured handling
 */

/**
 * Base error class for all library errors
 */
export abstract class UIError extends Error {
    /**
     * Error code for programmatic handling
     */
    public readonly code: string;

    /**
     * Additional context data
     */
    public readonly context?: Record<string, unknown>;

    /**
     * Timestamp when error occurred
     */
    public readonly timestamp: Date;

    constructor(code: string, message: string, context?: Record<string, unknown>) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context;
        this.timestamp = new Date();

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to JSON for logging/serialization
     */
    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}

/**
 * Validation error for invalid input/props
 */
export class ValidationError extends UIError {
    constructor(message: string, context?: Record<string, unknown>) {
        super('VALIDATION_ERROR', message, context);
    }
}

/**
 * Component rendering error
 */
export class ComponentError extends UIError {
    constructor(componentName: string, message: string, context?: Record<string, unknown>) {
        super('COMPONENT_ERROR', `[${componentName}] ${message}`, {
            component: componentName,
            ...context
        });
    }
}

/**
 * Configuration error for invalid settings
 */
export class ConfigError extends UIError {
    constructor(message: string, context?: Record<string, unknown>) {
        super('CONFIG_ERROR', message, context);
    }
}

/**
 * Registry error for component registration issues
 */
export class RegistryError extends UIError {
    constructor(message: string, context?: Record<string, unknown>) {
        super('REGISTRY_ERROR', message, context);
    }
}

/**
 * Type guard to check if error is a UIError
 */
export function isUIError(error: unknown): error is UIError {
    return error instanceof UIError;
}

/**
 * Format error for display to users (strips sensitive info)
 */
export function formatUserError(error: unknown): string {
    if (isUIError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Format error for logging (includes all details)
 */
export function formatLogError(error: unknown): Record<string, unknown> {
    if (isUIError(error)) {
        return error.toJSON();
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
    return {
        error: String(error)
    };
}
