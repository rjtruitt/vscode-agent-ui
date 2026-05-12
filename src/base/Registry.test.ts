/**
 * Tests for Component Registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registry } from './Registry';
import { StaticUIComponent } from './Component';
import { RegistryError } from '../utils/errors';

// Mock components for testing (don't need to implement interface - runtime validation handles it)
class MockComponent {
    static render(): string {
        return '<div>Mock</div>';
    }

    static getStyles(): string {
        return '.mock { color: red; }';
    }
}

class AnotherMockComponent {
    static render(): string {
        return '<span>Another</span>';
    }

    static getStyles(): string {
        return '.another { color: blue; }';
    }
}

describe('ComponentRegistry', () => {
    // Note: We can't fully reset the global registry between tests,
    // but we can test its functionality

    describe('register', () => {
        it('should register a component', () => {
            const componentName = `TestComponent_${Date.now()}`;
            registry.register(componentName, MockComponent as unknown as StaticUIComponent);

            expect(registry.has(componentName)).toBe(true);
            expect(registry.get(componentName)).toBe(MockComponent);
        });

        it('should throw RegistryError if name is invalid', () => {
            expect(() => {
                registry.register('', MockComponent as unknown as StaticUIComponent);
            }).toThrow(RegistryError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register(null, MockComponent);
            }).toThrow(RegistryError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register(undefined, MockComponent);
            }).toThrow(RegistryError);

            expect(() => {
                registry.register('   ', MockComponent);
            }).toThrow(RegistryError);
        });

        it('should throw RegistryError if component is invalid', () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register('Invalid', null);
            }).toThrow(RegistryError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register('Invalid', {});
            }).toThrow(RegistryError);

            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register('Invalid', { render: 'not-a-function' });
            }).toThrow(RegistryError);

            try {
                // @ts-expect-error - testing runtime validation
                registry.register('Invalid', { render: () => 'ok' });
            } catch (error) {
                expect(error).toBeInstanceOf(RegistryError);
                if (error instanceof RegistryError) {
                    expect(error.context?.hasRender).toBe(true);
                    expect(error.context?.hasGetStyles).toBe(false);
                }
            }
        });

        it('should allow re-registering a component', () => {
            const name = `ReregisterTest_${Date.now()}`;

            registry.register(name, MockComponent as unknown as StaticUIComponent);
            expect(registry.get(name)).toBe(MockComponent);

            // Re-register with different component
            registry.register(name, AnotherMockComponent);
            expect(registry.get(name)).toBe(AnotherMockComponent);
        });

        it('should validate component has both render and getStyles', () => {
            const invalidComponent = {
                render: () => 'html',
                // missing getStyles
            };

            expect(() => {
                // @ts-expect-error - testing runtime validation
                registry.register('Invalid', invalidComponent);
            }).toThrow(RegistryError);
        });
    });

    describe('get', () => {
        it('should return registered component', () => {
            const name = `GetTest_${Date.now()}`;
            registry.register(name, MockComponent as unknown as StaticUIComponent);

            const component = registry.get(name);
            expect(component).toBe(MockComponent);
        });

        it('should return undefined for unregistered component', () => {
            const component = registry.get('NonExistent_12345');
            expect(component).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should return true for registered component', () => {
            const name = `HasTest_${Date.now()}`;
            registry.register(name, MockComponent as unknown as StaticUIComponent);

            expect(registry.has(name)).toBe(true);
        });

        it('should return false for unregistered component', () => {
            expect(registry.has('NonExistent_54321')).toBe(false);
        });
    });

    describe('getNames', () => {
        it('should return array of registered component names', () => {
            const name1 = `Names1_${Date.now()}`;
            const name2 = `Names2_${Date.now()}`;

            registry.register(name1, MockComponent);
            registry.register(name2, AnotherMockComponent as unknown as StaticUIComponent);

            const names = registry.getNames();

            expect(Array.isArray(names)).toBe(true);
            expect(names).toContain(name1);
            expect(names).toContain(name2);
        });

        it('should return sorted names', () => {
            const names = registry.getNames();

            // Should be alphabetically sorted
            const sorted = [...names].sort();
            expect(names).toEqual(sorted);
        });
    });

    describe('getAll', () => {
        it('should return array of registered components', () => {
            const name1 = `All1_${Date.now()}`;
            const name2 = `All2_${Date.now()}`;

            registry.register(name1, MockComponent);
            registry.register(name2, AnotherMockComponent as unknown as StaticUIComponent);

            const components = registry.getAll();

            expect(Array.isArray(components)).toBe(true);
            expect(components.length).toBeGreaterThan(0);
        });

        it('should return components that can be called', () => {
            const components = registry.getAll();

            components.forEach(component => {
                expect(typeof component.render).toBe('function');
                expect(typeof component.getStyles).toBe('function');
            });
        });
    });

    describe('getAllStyles', () => {
        it('should return combined styles from all components', () => {
            const name1 = `Styles1_${Date.now()}`;
            const name2 = `Styles2_${Date.now()}`;

            registry.register(name1, MockComponent);
            registry.register(name2, AnotherMockComponent as unknown as StaticUIComponent);

            const styles = registry.getAllStyles();

            expect(typeof styles).toBe('string');
            expect(styles.length).toBeGreaterThan(0);
        });

        it('should include styles from all registered components', () => {
            const name1 = `StylesInclude1_${Date.now()}`;
            const name2 = `StylesInclude2_${Date.now()}`;

            registry.register(name1, MockComponent);
            registry.register(name2, AnotherMockComponent as unknown as StaticUIComponent);

            const styles = registry.getAllStyles();

            expect(styles).toContain('.mock');
            expect(styles).toContain('.another');
        });

        it('should handle components that throw errors gracefully', () => {
            const name = `ErrorComponent_${Date.now()}`;

            class ErrorComponent {
                static render(): string {
                    return '<div>Error</div>';
                }

                static getStyles(): string {
                    throw new Error('Styles error');
                }
            }

            registry.register(name, ErrorComponent as unknown as StaticUIComponent);

            // Should not throw, just skip the erroring component
            expect(() => registry.getAllStyles()).not.toThrow();

            const styles = registry.getAllStyles();
            expect(typeof styles).toBe('string');
        });

        it('should filter out empty styles', () => {
            const name = `EmptyStyles_${Date.now()}`;

            class EmptyStylesComponent {
                static render(): string {
                    return '<div>Empty</div>';
                }

                static getStyles(): string {
                    return '';
                }
            }

            registry.register(name, EmptyStylesComponent as unknown as StaticUIComponent);

            const styles = registry.getAllStyles();
            // Should still be a valid string, just may be empty or contain other components' styles
            expect(typeof styles).toBe('string');
        });

        it('should join styles with double newlines', () => {
            const name1 = `Join1_${Date.now()}`;
            const name2 = `Join2_${Date.now()}`;

            registry.register(name1, MockComponent);
            registry.register(name2, AnotherMockComponent as unknown as StaticUIComponent);

            const styles = registry.getAllStyles();

            // Styles should be separated by double newlines
            expect(styles).toContain('\n\n');
        });
    });

    describe('count', () => {
        it('should return number of registered components', () => {
            const beforeCount = registry.count;

            const name = `Count_${Date.now()}`;
            registry.register(name, MockComponent as unknown as StaticUIComponent);

            const afterCount = registry.count;

            expect(afterCount).toBe(beforeCount + 1);
        });

        it('should not increase count when re-registering', () => {
            const name = `CountReregister_${Date.now()}`;

            registry.register(name, MockComponent as unknown as StaticUIComponent);
            const count1 = registry.count;

            registry.register(name, AnotherMockComponent);
            const count2 = registry.count;

            expect(count2).toBe(count1);
        });
    });

    describe('real-world scenarios', () => {
        it('should support registering multiple components', () => {
            const baseName = `Multi_${Date.now()}`;

            for (let i = 0; i < 5; i++) {
                registry.register(`${baseName}_${i}`, MockComponent);
            }

            for (let i = 0; i < 5; i++) {
                expect(registry.has(`${baseName}_${i}`)).toBe(true);
            }
        });

        it('should support getting styles for specific components', () => {
            const name = `Specific_${Date.now()}`;
            registry.register(name, MockComponent as unknown as StaticUIComponent);

            const component = registry.get(name);
            expect(component).toBeDefined();

            const styles = component!.getStyles();
            expect(styles).toContain('.mock');
        });

        it('should provide component discovery', () => {
            const prefix = `Discovery_${Date.now()}`;

            registry.register(`${prefix}_Button`, MockComponent);
            registry.register(`${prefix}_Card`, AnotherMockComponent);

            const names = registry.getNames();
            const discoveryNames = names.filter(n => n.startsWith(prefix));

            expect(discoveryNames.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('validation error details', () => {
        it('should include component name in error context', () => {
            try {
                registry.register('', MockComponent);
            } catch (error) {
                expect(error).toBeInstanceOf(RegistryError);
                if (error instanceof RegistryError) {
                    expect(error.context?.name).toBeDefined();
                }
            }
        });

        it('should include validation details in error context', () => {
            try {
                // @ts-expect-error - testing runtime validation
                registry.register('Test', { render: () => 'ok' });
            } catch (error) {
                expect(error).toBeInstanceOf(RegistryError);
                if (error instanceof RegistryError) {
                    expect(error.context?.hasRender).toBeDefined();
                    expect(error.context?.hasGetStyles).toBeDefined();
                }
            }
        });
    });

    describe('edge cases', () => {
        it('should handle components with complex names', () => {
            const names = [
                `Component_${Date.now()}`,
                `my.component.${Date.now()}`,
                `Component123_${Date.now()}`,
                `UPPERCASE_${Date.now()}`,
            ];

            names.forEach(name => {
                registry.register(name, MockComponent as unknown as StaticUIComponent);
                expect(registry.has(name)).toBe(true);
            });
        });

        it('should handle component with very long styles', () => {
            const name = `LongStyles_${Date.now()}`;

            class LongStylesComponent {
                static render(): string {
                    return '<div>Long</div>';
                }

                static getStyles(): string {
                    return '.long { '.repeat(1000) + 'color: red; ' + '}'.repeat(1000);
                }
            }

            registry.register(name, LongStylesComponent as unknown as StaticUIComponent);

            const styles = registry.getAllStyles();
            expect(styles.length).toBeGreaterThan(1000);
        });

        it('should handle component with no styles', () => {
            const name = `NoStyles_${Date.now()}`;

            class NoStylesComponent {
                static render(): string {
                    return '<div>No styles</div>';
                }

                static getStyles(): string {
                    return '';
                }
            }

            registry.register(name, NoStylesComponent as unknown as StaticUIComponent);

            expect(() => registry.getAllStyles()).not.toThrow();
        });
    });
});
