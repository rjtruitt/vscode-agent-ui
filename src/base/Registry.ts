/**
 * Component Registry
 *
 * Centralized registry for all components to support automated style collection
 * and high-concurrency development.
 */

import { StaticUIComponent } from './Component';

class ComponentRegistry {
    private components: Map<string, StaticUIComponent> = new Map();

    /**
     * Register a component with the library
     * @param name Unique name for the component
     * @param component The component class
     */
    register(name: string, component: StaticUIComponent): void {
        this.components.set(name, component);
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
            .map(c => c.getStyles())
            .filter(Boolean)
            .join('\n\n');
    }
}

export const registry = new ComponentRegistry();
