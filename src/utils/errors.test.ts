/**
 * Tests for typed error system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    UIError,
    ValidationError,
    ComponentError,
    ConfigError,
    RegistryError,
    isUIError,
    formatUserError,
    formatLogError,
} from './errors';

describe('UIError base class', () => {
    it('should create error with code, message, and context', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message', { foo: 'bar' });
            }
        }

        const error = new TestError();
        expect(error.code).toBe('TEST_ERROR');
        expect(error.message).toBe('Test message');
        expect(error.context).toEqual({ foo: 'bar' });
        expect(error.name).toBe('TestError');
    });

    it('should set timestamp', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message');
            }
        }

        const before = new Date();
        const error = new TestError();
        const after = new Date();

        expect(error.timestamp).toBeInstanceOf(Date);
        expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should be instanceof Error', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message');
            }
        }

        const error = new TestError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(UIError);
    });

    it('should have stack trace', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message');
            }
        }

        const error = new TestError();
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('TestError');
    });

    it('should serialize to JSON', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message', { detail: 'value' });
            }
        }

        const error = new TestError();
        const json = error.toJSON();

        expect(json.name).toBe('TestError');
        expect(json.code).toBe('TEST_ERROR');
        expect(json.message).toBe('Test message');
        expect(json.context).toEqual({ detail: 'value' });
        expect(json.timestamp).toBeDefined();
        expect(json.stack).toBeDefined();
    });

    it('should work without context', () => {
        class TestError extends UIError {
            constructor() {
                super('TEST_ERROR', 'Test message');
            }
        }

        const error = new TestError();
        expect(error.context).toBeUndefined();

        const json = error.toJSON();
        expect(json.context).toBeUndefined();
    });
});

describe('ValidationError', () => {
    it('should create validation error', () => {
        const error = new ValidationError('Invalid input', { field: 'email' });

        expect(error).toBeInstanceOf(ValidationError);
        expect(error).toBeInstanceOf(UIError);
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('Invalid input');
        expect(error.context).toEqual({ field: 'email' });
        expect(error.name).toBe('ValidationError');
    });

    it('should work without context', () => {
        const error = new ValidationError('Invalid input');
        expect(error.context).toBeUndefined();
    });
});

describe('ComponentError', () => {
    it('should create component error', () => {
        const error = new ComponentError('Button', 'Failed to render', { reason: 'missing props' });

        expect(error).toBeInstanceOf(ComponentError);
        expect(error).toBeInstanceOf(UIError);
        expect(error.code).toBe('COMPONENT_ERROR');
        expect(error.message).toBe('[Button] Failed to render');
        expect(error.context).toEqual({
            component: 'Button',
            reason: 'missing props',
        });
        expect(error.name).toBe('ComponentError');
    });

    it('should include component name in context', () => {
        const error = new ComponentError('Card', 'Render failed');

        expect(error.context).toEqual({ component: 'Card' });
    });

    it('should merge additional context with component name', () => {
        const error = new ComponentError('Input', 'Validation failed', {
            field: 'email',
            value: 'invalid',
        });

        expect(error.context).toEqual({
            component: 'Input',
            field: 'email',
            value: 'invalid',
        });
    });
});

describe('ConfigError', () => {
    it('should create config error', () => {
        const error = new ConfigError('Invalid configuration', { key: 'timeout' });

        expect(error).toBeInstanceOf(ConfigError);
        expect(error).toBeInstanceOf(UIError);
        expect(error.code).toBe('CONFIG_ERROR');
        expect(error.message).toBe('Invalid configuration');
        expect(error.name).toBe('ConfigError');
    });
});

describe('RegistryError', () => {
    it('should create registry error', () => {
        const error = new RegistryError('Component not found', { name: 'Button' });

        expect(error).toBeInstanceOf(RegistryError);
        expect(error).toBeInstanceOf(UIError);
        expect(error.code).toBe('REGISTRY_ERROR');
        expect(error.message).toBe('Component not found');
        expect(error.name).toBe('RegistryError');
    });
});

describe('isUIError', () => {
    it('should return true for UIError instances', () => {
        expect(isUIError(new ValidationError('test'))).toBe(true);
        expect(isUIError(new ComponentError('Test', 'test'))).toBe(true);
        expect(isUIError(new ConfigError('test'))).toBe(true);
        expect(isUIError(new RegistryError('test'))).toBe(true);
    });

    it('should return false for non-UIError instances', () => {
        expect(isUIError(new Error('test'))).toBe(false);
        expect(isUIError(new TypeError('test'))).toBe(false);
        expect(isUIError('string')).toBe(false);
        expect(isUIError(null)).toBe(false);
        expect(isUIError(undefined)).toBe(false);
        expect(isUIError(123)).toBe(false);
        expect(isUIError({})).toBe(false);
    });
});

describe('formatUserError', () => {
    it('should format UIError as message only', () => {
        const error = new ValidationError('Invalid email', { field: 'email' });
        expect(formatUserError(error)).toBe('Invalid email');
    });

    it('should format standard Error as message', () => {
        const error = new Error('Something went wrong');
        expect(formatUserError(error)).toBe('Something went wrong');
    });

    it('should format non-error values as string', () => {
        expect(formatUserError('string error')).toBe('string error');
        expect(formatUserError(123)).toBe('123');
        expect(formatUserError(null)).toBe('null');
        expect(formatUserError(undefined)).toBe('undefined');
    });

    it('should not expose sensitive context data', () => {
        const error = new ValidationError('Validation failed', {
            apiKey: 'secret-key-123',
            password: 'hunter2',
        });

        const formatted = formatUserError(error);
        expect(formatted).toBe('Validation failed');
        expect(formatted).not.toContain('secret-key-123');
        expect(formatted).not.toContain('hunter2');
    });
});

describe('formatLogError', () => {
    it('should format UIError with full details', () => {
        const error = new ValidationError('Invalid input', { field: 'email', value: 'bad@' });
        const formatted = formatLogError(error);

        expect(formatted.name).toBe('ValidationError');
        expect(formatted.code).toBe('VALIDATION_ERROR');
        expect(formatted.message).toBe('Invalid input');
        expect(formatted.context).toEqual({ field: 'email', value: 'bad@' });
        expect(formatted.timestamp).toBeDefined();
        expect(formatted.stack).toBeDefined();
    });

    it('should format standard Error with basic details', () => {
        const error = new Error('Standard error');
        const formatted = formatLogError(error);

        expect(formatted.name).toBe('Error');
        expect(formatted.message).toBe('Standard error');
        expect(formatted.stack).toBeDefined();
        expect(formatted.code).toBeUndefined();
    });

    it('should format non-error values as wrapped object', () => {
        const formatted = formatLogError('string error');
        expect(formatted).toEqual({ error: 'string error' });
    });

    it('should include all context data for logging', () => {
        const error = new ComponentError('Button', 'Render failed', {
            props: { text: 'Click me', disabled: true },
            attempt: 3,
        });

        const formatted = formatLogError(error);
        expect(formatted.context).toEqual({
            component: 'Button',
            props: { text: 'Click me', disabled: true },
            attempt: 3,
        });
    });

    it('should include timestamp in ISO format', () => {
        const error = new ValidationError('Test');
        const formatted = formatLogError(error);

        expect(formatted.timestamp).toBeDefined();
        expect(typeof formatted.timestamp).toBe('string');
        // Validate ISO format
        expect(() => new Date(formatted.timestamp as string)).not.toThrow();
    });
});

describe('error throwing and catching', () => {
    it('should be catchable with try-catch', () => {
        expect(() => {
            throw new ValidationError('Test error');
        }).toThrow(ValidationError);
    });

    it('should preserve stack trace through throws', () => {
        let caughtError: ValidationError | null = null;

        try {
            throw new ValidationError('Test');
        } catch (error) {
            caughtError = error as ValidationError;
        }

        expect(caughtError).not.toBeNull();
        expect(caughtError!.stack).toBeDefined();
        expect(caughtError!.stack).toContain('ValidationError');
    });

    it('should support instanceof checks in catch', () => {
        try {
            throw new ValidationError('Test');
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error).toBeInstanceOf(UIError);
            expect(error).toBeInstanceOf(Error);
        }
    });

    it('should allow differentiated error handling', () => {
        const errors = [
            new ValidationError('validation'),
            new ComponentError('Button', 'component'),
            new Error('standard'),
        ];

        const results = errors.map(error => {
            if (error instanceof ValidationError) {
                return 'validation';
            } else if (error instanceof ComponentError) {
                return 'component';
            } else {
                return 'other';
            }
        });

        expect(results).toEqual(['validation', 'component', 'other']);
    });
});
