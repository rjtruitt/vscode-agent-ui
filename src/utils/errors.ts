/**
 * Typed Error Classes
 *
 * Library-specific error hierarchy for better error handling and debugging.
 *
 * @aiInstruction
 * Use these typed errors instead of throwing raw Error objects:
 * - ValidationError: Invalid input parameters
 * - ComponentError: Component rendering/initialization failures
 * - ConfigurationError: Invalid configuration or setup
 *
 * All errors include:
 * - code: Machine-readable error code
 * - field: The parameter/field that caused the error (if applicable)
 * - context: Additional debugging information
 *
 * @aiExample
 * ```typescript
 * import { ValidationError, ComponentError } from 'vscode-agent-ui/utils/errors';
 *
 * // Validate input
 * function renderButton(text: string) {
 *   if (!text || text.trim().length === 0) {
 *     throw new ValidationError(
 *       'INVALID_TEXT',
 *       'text',
 *       'Button text cannot be empty',
 *       { received: text }
 *     );
 *   }
 * }
 *
 * // Catch and handle
 * try {
 *   renderButton('');
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     console.error(`Validation failed for ${error.field}: ${error.message}`);
 *   }
 * }
 * ```
 */

/**
 * Base error class for all library errors
 */
export class UIError extends Error {
  /**
   * Machine-readable error code
   */
  public readonly code: string;

  /**
   * Additional context for debugging
   */
  public readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'UIError';
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when input validation fails
 *
 * @aiInstruction
 * Throw ValidationError when:
 * - Required parameters are missing
 * - Parameter values are invalid (wrong type, out of range)
 * - Parameter combinations are invalid
 *
 * Always include:
 * - code: Error code like 'INVALID_VALUE', 'MISSING_PARAMETER'
 * - field: The parameter name that failed validation
 * - message: User-friendly explanation
 * - context: Additional details (expected vs received values)
 */
export class ValidationError extends UIError {
  /**
   * The field/parameter that failed validation
   */
  public readonly field: string;

  constructor(
    code: string,
    field: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(code, message, context);
    this.name = 'ValidationError';
    this.field = field;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
    };
  }
}

/**
 * Error thrown during component rendering or initialization
 *
 * @aiInstruction
 * Throw ComponentError when:
 * - Component fails to render
 * - Required resources are missing
 * - Internal component state is invalid
 */
export class ComponentError extends UIError {
  /**
   * The component name/type where error occurred
   */
  public readonly component: string;

  constructor(
    code: string,
    component: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(code, message, context);
    this.name = 'ComponentError';
    this.component = component;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      component: this.component,
    };
  }
}

/**
 * Error thrown when configuration is invalid
 *
 * @aiInstruction
 * Throw ConfigurationError when:
 * - Invalid configuration options
 * - Missing required configuration
 * - Configuration conflicts
 */
export class ConfigurationError extends UIError {
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'ConfigurationError';
  }
}

/**
 * Type guard to check if error is a UIError
 */
export function isUIError(error: unknown): error is UIError {
  return error instanceof UIError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if error is a ComponentError
 */
export function isComponentError(error: unknown): error is ComponentError {
  return error instanceof ComponentError;
}

/**
 * Type guard to check if error is a ConfigurationError
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

/**
 * Format error for display
 *
 * @aiInstruction
 * Use this to convert errors to user-friendly messages:
 * - Includes error code and message
 * - Optionally includes context details
 * - Safe for displaying to end users
 */
export function formatError(error: unknown, includeContext = false): string {
  if (isUIError(error)) {
    let msg = `[${error.code}] ${error.message}`;

    if (includeContext && error.context) {
      msg += `\nContext: ${JSON.stringify(error.context, null, 2)}`;
    }

    return msg;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
