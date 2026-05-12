/**
 * Component Registry
 *
 * Centralized registry for all components to support automated style collection
 * and high-concurrency development.
 *
 * @aiInstructions
 * The registry automatically collects all registered components and provides
 * utilities to get combined styles. Components self-register on import.
 *
 * @aiExample
 * ```typescript
 * import { registry } from 'vscode-agent-ui';
 *
 * // Get all styles for all registered components
 * const allStyles = registry.getAllStyles();
 *
 * // Get specific component
 * const button = registry.get('Button');
 * if (button) {
 *   const styles = button.getStyles();
 * }
 * ```
 */

import { StaticUIComponent } from './Component';
import { RegistryError } from '../utils/errors';
import { logger } from '../utils/logger';

class ComponentRegistry {
    private components: Map<string, StaticUIComponent> = new Map();
    private readonly log = logger.child({ module: 'ComponentRegistry' });

    /**
     * Register a component with the library
     * @param name Unique name for the component
     * @param component The component class
     * @throws {RegistryError} If component name is invalid or already registered
     */
    register(name: string, component: StaticUIComponent): void {
        // Validate name
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new RegistryError('Component name must be a non-empty string', {
                name
            });
        }

        // Validate component
        if (!component || typeof component.render !== 'function' || typeof component.getStyles !== 'function') {
            throw new RegistryError('Component must have render() and getStyles() methods', {
                name,
                hasRender: typeof component?.render === 'function',
                hasGetStyles: typeof component?.getStyles === 'function'
            });
        }

        // Warn if overwriting
        if (this.components.has(name)) {
            this.log.warn('Component being re-registered', { name });
        }

        this.components.set(name, component);
        this.log.debug('Component registered', { name });
    }

    /**
     * Get a specific component by name
     * @param name Component name
     * @returns Component class or undefined if not found
     */
    get(name: string): StaticUIComponent | undefined {
        return this.components.get(name);
    }

    /**
     * Check if a component is registered
     * @param name Component name
     */
    has(name: string): boolean {
        return this.components.has(name);
    }

    /**
     * Get all registered component names
     */
    getNames(): string[] {
        return Array.from(this.components.keys()).sort();
    }

    /**
     * Get all registered components
     */
    getAll(): StaticUIComponent[] {
        return Array.from(this.components.values());
    }

    /**
     * Get all component styles combined
     */
    getAllStyles(): string {
        return this.getAll()
            .map(c => {
                try {
                    return c.getStyles();
                } catch (error) {
                    this.log.error('Failed to get styles from component', {
                        component: c.constructor?.name,
                        error
                    });
                    return '';
                }
            })
            .filter(Boolean)
            .join('\n\n');
    }

    /**
     * Get count of registered components
     */
    get count(): number {
        return this.components.size;
    }
}

export const registry = new ComponentRegistry();
