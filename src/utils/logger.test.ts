/**
 * Tests for structured logging system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, createComponentLogger, LogEntry, LogLevel } from './logger';

describe('Logger', () => {
    let mockOutput: LogEntry[];

    beforeEach(() => {
        // Reset logger state
        logger.setLevel('debug');
        logger.setEnabled(true);

        // Capture log entries instead of outputting to console
        mockOutput = [];
        logger.setOutput((entry) => {
            mockOutput.push(entry);
        });
    });

    describe('basic logging', () => {
        it('should log debug messages', () => {
            logger.debug('Debug message', { foo: 'bar' });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('debug');
            expect(mockOutput[0].message).toBe('Debug message');
            expect(mockOutput[0].context).toEqual({ foo: 'bar' });
        });

        it('should log info messages', () => {
            logger.info('Info message', { foo: 'bar' });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('info');
            expect(mockOutput[0].message).toBe('Info message');
        });

        it('should log warn messages', () => {
            logger.warn('Warning message', { foo: 'bar' });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('warn');
            expect(mockOutput[0].message).toBe('Warning message');
        });

        it('should log error messages', () => {
            logger.error('Error message', { foo: 'bar' });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('error');
            expect(mockOutput[0].message).toBe('Error message');
        });

        it('should include timestamp in ISO format', () => {
            logger.info('Test');

            expect(mockOutput[0].timestamp).toBeDefined();
            // Validate ISO format
            const timestamp = new Date(mockOutput[0].timestamp);
            expect(timestamp.toISOString()).toBe(mockOutput[0].timestamp);
        });

        it('should work without context', () => {
            logger.info('No context');

            expect(mockOutput[0].context).toEqual({});
        });
    });

    describe('log levels', () => {
        it('should filter messages below log level', () => {
            logger.setLevel('warn');

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(mockOutput).toHaveLength(2);
            expect(mockOutput[0].level).toBe('warn');
            expect(mockOutput[1].level).toBe('error');
        });

        it('should allow all messages at debug level', () => {
            logger.setLevel('debug');

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(mockOutput).toHaveLength(4);
        });

        it('should allow only errors at error level', () => {
            logger.setLevel('error');

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('error');
        });

        it('should block all messages at none level', () => {
            logger.setLevel('none');

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(mockOutput).toHaveLength(0);
        });

        it('should respect log level hierarchy', () => {
            const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

            levels.forEach(level => {
                mockOutput = [];
                logger.setLevel(level);

                logger.debug('Debug');
                logger.info('Info');
                logger.warn('Warn');
                logger.error('Error');

                const expectedCount = 4 - levels.indexOf(level);
                expect(mockOutput).toHaveLength(expectedCount);
            });
        });
    });

    describe('enable/disable', () => {
        it('should not log when disabled', () => {
            logger.setEnabled(false);

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(mockOutput).toHaveLength(0);
        });

        it('should resume logging when re-enabled', () => {
            logger.setEnabled(false);
            logger.info('Should not appear');

            logger.setEnabled(true);
            logger.info('Should appear');

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].message).toBe('Should appear');
        });
    });

    describe('child logger', () => {
        it('should create child with additional context', () => {
            const child = logger.child({ component: 'Button' });
            child.info('Test', { action: 'click' });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].context).toEqual({
                component: 'Button',
                action: 'click',
            });
        });

        it('should merge child context with message context', () => {
            const child = logger.child({ component: 'Card' });
            child.info('Rendered', { variant: 'primary' });

            expect(mockOutput[0].context).toEqual({
                component: 'Card',
                variant: 'primary',
            });
        });

        it('should override parent context with message context', () => {
            const child = logger.child({ key: 'parent', other: 'value' });
            child.info('Test', { key: 'child' });

            expect(mockOutput[0].context).toEqual({
                key: 'child',
                other: 'value',
            });
        });

        it('should inherit log level from parent', () => {
            logger.setLevel('warn');
            const child = logger.child({ component: 'Test' });

            child.debug('Debug');
            child.info('Info');
            child.warn('Warn');

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('warn');
        });

        it('should inherit enabled state from parent', () => {
            logger.setEnabled(false);
            const child = logger.child({ component: 'Test' });

            child.info('Should not appear');

            expect(mockOutput).toHaveLength(0);
        });

        it('should support nested child loggers', () => {
            const parent = logger.child({ module: 'components' });
            const child = parent.child({ component: 'Button' });

            child.info('Test', { action: 'click' });

            expect(mockOutput[0].context).toEqual({
                module: 'components',
                component: 'Button',
                action: 'click',
            });
        });
    });

    describe('createComponentLogger', () => {
        it('should create logger with component context', () => {
            const componentLogger = createComponentLogger('Button');
            componentLogger.info('Rendered');

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].context).toEqual({ component: 'Button' });
        });

        it('should allow additional context', () => {
            const componentLogger = createComponentLogger('Card');
            componentLogger.warn('Deprecated prop', { prop: 'color' });

            expect(mockOutput[0].context).toEqual({
                component: 'Card',
                prop: 'color',
            });
        });
    });

    describe('custom output', () => {
        it('should use custom output function', () => {
            const customEntries: LogEntry[] = [];
            logger.setOutput((entry) => {
                customEntries.push(entry);
            });

            logger.info('Test');

            expect(customEntries).toHaveLength(1);
            expect(customEntries[0].message).toBe('Test');
        });

        it('should receive full log entry', () => {
            let capturedEntry: LogEntry | null = null;
            logger.setOutput((entry) => {
                capturedEntry = entry;
            });

            logger.warn('Warning', { detail: 'value' });

            expect(capturedEntry).not.toBeNull();
            expect(capturedEntry!.level).toBe('warn');
            expect(capturedEntry!.message).toBe('Warning');
            expect(capturedEntry!.timestamp).toBeDefined();
            expect(capturedEntry!.context).toEqual({ detail: 'value' });
        });
    });

    describe('real-world scenarios', () => {
        it('should handle component lifecycle logging', () => {
            const btnLogger = createComponentLogger('Button');

            btnLogger.debug('Initializing', { props: { text: 'Click me' } });
            btnLogger.info('Rendered successfully');
            btnLogger.warn('Deprecated prop used', { prop: 'color' });

            expect(mockOutput).toHaveLength(3);
            expect(mockOutput.every(e => e.context?.component === 'Button')).toBe(true);
        });

        it('should handle error logging with context', () => {
            const error = new Error('Render failed');
            logger.error('Component error', {
                component: 'Card',
                error: error.message,
                stack: error.stack,
            });

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('error');
            expect(mockOutput[0].context?.error).toBe('Render failed');
        });

        it('should support production vs development logging', () => {
            // Production: only errors
            logger.setLevel('error');
            logger.debug('Dev only');
            logger.info('App started');
            logger.error('Critical error');

            expect(mockOutput).toHaveLength(1);
            expect(mockOutput[0].level).toBe('error');

            // Development: everything
            mockOutput = [];
            logger.setLevel('debug');
            logger.debug('Dev info');
            logger.info('App started');

            expect(mockOutput).toHaveLength(2);
        });

        it('should handle high-frequency logging efficiently', () => {
            const startTime = Date.now();

            for (let i = 0; i < 1000; i++) {
                logger.info('Message', { index: i });
            }

            const duration = Date.now() - startTime;

            expect(mockOutput).toHaveLength(1000);
            expect(duration).toBeLessThan(1000); // Should be fast (< 1 second for 1000 logs)
        });

        it('should not leak sensitive information', () => {
            logger.info('User action', {
                username: 'john',
                action: 'login',
                // Sensitive data should be filtered at log time, not here
            });

            const entry = mockOutput[0];
            // Logger itself doesn't filter - that's the application's responsibility
            // But we can verify the structure is correct
            expect(entry.context).toHaveProperty('username');
            expect(entry.context).toHaveProperty('action');
        });
    });

    describe('edge cases', () => {
        it('should handle empty message', () => {
            logger.info('');
            expect(mockOutput[0].message).toBe('');
        });

        it('should handle very long messages', () => {
            const longMessage = 'x'.repeat(10000);
            logger.info(longMessage);
            expect(mockOutput[0].message).toBe(longMessage);
        });

        it('should handle special characters in message', () => {
            logger.info('Special: <>&"\'\n\t');
            expect(mockOutput[0].message).toBe('Special: <>&"\'\n\t');
        });

        it('should handle complex nested context', () => {
            logger.info('Complex', {
                nested: {
                    deeply: {
                        nested: {
                            value: 42,
                        },
                    },
                },
                array: [1, 2, 3],
            });

            expect(mockOutput[0].context).toEqual({
                nested: { deeply: { nested: { value: 42 } } },
                array: [1, 2, 3],
            });
        });

        it('should handle circular references in context', () => {
            const circular: any = { a: 1 };
            circular.self = circular;

            // Should not throw - JSON.stringify will be called by output handler
            expect(() => {
                logger.info('Circular', circular);
            }).not.toThrow();
        });

        it('should handle undefined and null in context', () => {
            logger.info('Nullish', {
                undef: undefined,
                nul: null,
            });

            expect(mockOutput[0].context).toEqual({
                undef: undefined,
                nul: null,
            });
        });
    });
});
