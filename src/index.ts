/**
 * vscode-agent-ui
 *
 * Lightweight UI components for VS Code webviews.
 *
 * @aiInstructions
 * This library is fully tree-shakeable. Import only what you need:
 *
 * ```typescript
 * // Tree-shakeable: only imports Button and Card
 * import { Button, Card, getStyles } from 'vscode-agent-ui';
 * const styles = getStyles([Button, Card]);
 * ```
 *
 * Or use getAllStyles() to get styles for all components (imports everything):
 *
 * ```typescript
 * import { getAllStyles } from 'vscode-agent-ui';
 * const allStyles = getAllStyles(); // Loads all components
 * ```
 */

// Export all components from category index files
export * from './components';
export * from './chat';
export * from './layout';

// Export utilities
export * from './utils';

// Export registry for advanced usage
export { registry } from './base/Registry';

/**
 * Get styles for specific components (tree-shakeable)
 *
 * This is the recommended approach for production builds.
 * Only includes styles for the components you pass in.
 *
 * @param components - Array of component classes
 * @returns Combined CSS styles
 *
 * @aiExample
 * ```typescript
 * import { Button, Card, Input, getStyles } from 'vscode-agent-ui';
 *
 * // Only includes Button, Card, and Input in your bundle
 * const styles = getStyles([Button, Card, Input]);
 * ```
 */
export function getStyles(components: Array<{ getStyles(): string }>): string {
    return components.map(c => c.getStyles()).join('\n\n');
}

/**
 * Get all component styles (imports all components)
 *
 * ⚠️  WARNING: This imports ALL components into your bundle.
 * Use getStyles() for tree-shakeable builds.
 *
 * This function auto-registers all components and returns their combined styles.
 * Useful for development or when you know you'll use most components.
 *
 * @returns Combined CSS styles for all registered components
 *
 * @aiExample
 * ```typescript
 * import { getAllStyles } from 'vscode-agent-ui';
 *
 * // Loads all components - larger bundle size
 * const allStyles = getAllStyles();
 * ```
 */
export function getAllStyles(): string {
    // Import and register all components (side effect)
    // This is done lazily so tree-shaking works if you don't use this function
    require('./base/register-all');
    const { registry } = require('./base/Registry');
    return registry.getAllStyles();
}
