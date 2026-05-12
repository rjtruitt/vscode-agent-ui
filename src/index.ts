/**
 * vscode-agent-ui
 *
 * Lightweight UI components for VS Code webviews.
 */

import { registry } from './base/Registry';

// Export all components from category index files
export * from './components';
export * from './chat';
export * from './layout';

// Export utilities
export * from './utils';

// Export registry for advanced usage
export { registry } from './base/Registry';

/**
 * Get styles for specific components (modular approach)
 *
 * @param components - Array of component classes
 * @returns Combined CSS styles
 */
export function getStyles(components: Array<{ getStyles(): string }>): string {
    return components.map(c => c.getStyles()).join('\n\n');
}

/**
 * Convenience function to get all component styles
 *
 * Uses the internal registry to automatically collect styles from all
 * registered components.
 */
export function getAllStyles(): string {
    return registry.getAllStyles();
}
