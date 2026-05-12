/**
 * Structured Logging System
 *
 * Production-grade logging with structured data output.
 * Never use console.* directly in library code - use this logger.
 *
 * @aiInstructions
 * Use the logger for all output in library code:
 * - logger.error() for errors and exceptions
 * - logger.warn() for warnings and deprecations
 * - logger.info() for informational messages
 * - logger.debug() for debugging (only in development)
 *
 * All log entries are structured JSON for easy parsing and analysis.
 *
 * @aiExample
 * ```typescript
 * import { logger } from 'vscode-agent-ui/utils/logger';
 *
 * // Basic logging
 * logger.info('Component rendered', { component: 'Button', props: {...} });
 * logger.warn('Deprecated prop used', { prop: 'color', replacement: 'variant' });
 * logger.error('Rendering failed', { error, component: 'Card' });
 *
 * // With context
 * const componentLogger = logger.child({ component: 'Button' });
 * componentLogger.info('Initialized');
 * componentLogger.error('Render failed', { reason: 'invalid props' });
 *
 * // Configure log level
 * logger.setLevel('debug'); // in development
 * logger.setLevel('error'); // in production
 * ```
 *
 * @aiCommonMistakes
 * - Don't use console.* directly - always use logger
 * - Don't log sensitive data (passwords, tokens, PII)
 * - Use appropriate log levels
 *
 * @aiWhenToUse
 * Use logger for:
 * - Error conditions
 * - Deprecation warnings
 * - Important state changes
 * - Debug information (development only)
 *
 * Don't log:
 * - Every function call (too noisy)
 * - Sensitive information
 * - In hot paths (performance impact)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
}

export interface LoggerConfig {
    level: LogLevel;
    /** Custom output function (default: console methods) */
    output?: (entry: LogEntry) => void;
    /** Enable/disable logging */
    enabled?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4
};

/**
 * Structured logger implementation
 */
class Logger {
    private config: Required<LoggerConfig>;
    private context: Record<string, unknown> = {};

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            level: config?.level ?? 'info',
            output: config?.output ?? this.defaultOutput.bind(this),
            enabled: config?.enabled ?? true
        };
    }

    /**
     * Create a child logger with additional context
     */
    child(context: Record<string, unknown>): Logger {
        const child = new Logger(this.config);
        child.context = { ...this.context, ...context };
        return child;
    }

    /**
     * Set the minimum log level
     */
    setLevel(level: LogLevel): void {
        this.config.level = level;
    }

    /**
     * Enable or disable logging
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
    }

    /**
     * Set custom output function
     */
    setOutput(output: (entry: LogEntry) => void): void {
        this.config.output = output;
    }

    /**
     * Log debug message (development only)
     */
    debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }

    /**
     * Log informational message
     */
    info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    /**
     * Log warning message
     */
    warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    /**
     * Log error message
     */
    error(message: string, context?: Record<string, unknown>): void {
        this.log('error', message, context);
    }

    /**
     * Internal log method
     */
    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (!this.config.enabled) {
            return;
        }

        if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) {
            return;
        }

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: { ...this.context, ...context }
        };

        this.config.output(entry);
    }

    /**
     * Default output to console with structured format
     */
    private defaultOutput(entry: LogEntry): void {
        const { level, message, timestamp, context } = entry;
        const contextStr = context && Object.keys(context).length > 0
            ? ` ${JSON.stringify(context)}`
            : '';

        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;

        switch (level) {
            case 'debug':
                // eslint-disable-next-line no-console
                console.debug(logMessage);
                break;
            case 'info':
                // eslint-disable-next-line no-console
                console.info(logMessage);
                break;
            case 'warn':
                // eslint-disable-next-line no-console
                console.warn(logMessage);
                break;
            case 'error':
                // eslint-disable-next-line no-console
                console.error(logMessage);
                break;
        }
    }
}

/**
 * Global logger instance
 *
 * Configure this at application startup:
 * ```typescript
 * import { logger } from 'vscode-agent-ui/utils/logger';
 * logger.setLevel('error'); // production
 * logger.setLevel('debug'); // development
 * ```
 */
export const logger = new Logger({
    level: 'info',
    enabled: true
});

/**
 * Create a component-specific logger
 */
export function createComponentLogger(componentName: string): Logger {
    return logger.child({ component: componentName });
}
