/**
 * vscode-agent-ui
 *
 * Lightweight UI components for VS Code webviews.
 *
 * All components are:
 * - Framework-agnostic (pure functions returning HTML strings)
 * - Theme-aware (automatically adapt to VS Code's theme)
 * - Accessible (ARIA labels, keyboard navigation)
 * - State preserving (inputs, tabs, accordions survive webview reloads)
 * - CSP compliant (inline styles, no external resources)
 *
 * ## Why Component.getStyles() Instead of .css Files?
 *
 * VS Code webviews have strict Content Security Policy (CSP) restrictions that make
 * loading external CSS files complex. Each CSS file must be:
 * 1. Converted to a webview URI using webview.asWebviewUri()
 * 2. Added to the CSP policy with proper nonces
 * 3. Managed as extension resources
 *
 * Instead, this library uses inline styles via `Component.getStyles()`:
 * - Simpler: No URI conversion or CSP configuration needed
 * - Efficient: Only load styles for components you actually use
 * - Portable: Works in any VS Code webview without setup
 *
 * **Best Practice:** Only import styles for components you use:
 * ```typescript
 * ${Card.getStyles()}
 * ${Button.getStyles()}
 * ```
 *
 * **Avoid:** Using getAllStyles() loads all 20+ component styles unnecessarily
 *
 * ## Quick Start
 * ```typescript
 * import { Panel, Button, Card } from 'vscode-agent-ui';
 *
 * // Create a panel
 * const panel = new Panel({
 *   extensionUri: context.extensionUri,
 *   viewType: 'myView',
 *   title: 'My View'
 * });
 *
 * // Build HTML with components
 * const html = panel.buildHtml({
 *   styles: Button.getStyles() + Card.getStyles(),
 *   body: `
 *     ${Card.render({ title: 'Status', content: 'Running' })}
 *     ${Button.render({ text: 'Stop', variant: 'danger' })}
 *   `
 * });
 *
 * panel.setHtml(html);
 * panel.show();
 * ```
 *
 * ## Component Categories
 *
 * ### Core Components (src/components/)
 * Basic UI building blocks for forms, feedback, and interaction:
 * - Button - Clickable button with variants
 * - Card - Content container with header/footer
 * - Badge - Status indicator
 * - Progress - Progress bars, spinners, steppers
 * - Input - Text input with validation
 * - Select - Dropdown selection
 * - Toggle - On/off switch
 * - Table - Data table with sorting
 *
 * ### Chat Components (src/chat/)
 * Specialized components for chat interfaces:
 * - ChatBubble - Single message bubble
 * - ChatInput - Message input with send button
 *
 * ### Layout Components (src/layout/)
 * Foundation for building custom UIs:
 * - Panel - Generic webview panel (most important!)
 *
 * ## Usage Patterns
 *
 * ### Pattern 1: Simple Panel
 * ```typescript
 * const panel = Panel.createSimple(
 *   extensionUri,
 *   'myView',
 *   'My View',
 *   '<h1>Hello World</h1>'
 * );
 * ```
 *
 * ### Pattern 2: Composed UI
 * ```typescript
 * const panel = new Panel({ extensionUri, viewType: 'myView', title: 'Dashboard' });
 * const html = panel.buildHtml({
 *   styles: Card.getStyles() + Badge.getStyles(),
 *   body: `
 *     <h1>Dashboard</h1>
 *     ${Card.render({
 *       title: 'Status',
 *       content: Badge.render({ text: 'Running', variant: 'success' })
 *     })}
 *   `
 * });
 * panel.setHtml(html);
 * ```
 *
 * ### Pattern 3: Interactive UI
 * ```typescript
 * const panel = new Panel({ extensionUri, viewType: 'myView', title: 'Chat' });
 *
 * // Handle messages from webview
 * panel.onDidReceiveMessage('send', async (msg) => {
 *   const response = await processMessage(msg.text);
 *   panel.postMessage({ command: 'addMessage', data: response });
 * });
 *
 * const html = panel.buildHtml({
 *   styles: ChatBubble.getStyles() + ChatInput.getStyles(),
 *   body: `
 *     <div id="messages"></div>
 *     ${ChatInput.render({ onsubmit: 'handleSend' })}
 *   `,
 *   scripts: `
 *     function handleSend(event) {
 *       const input = document.querySelector('.chat-input-field');
 *       postMessage('send', { text: input.value });
 *       input.value = '';
 *     }
 *   `
 * });
 * ```
 */

// Export all components
export * from './components/Button';
export * from './components/Card';
export * from './components/Badge';
export * from './components/Progress';
export * from './components/Input';
export * from './components/Select';
export * from './components/Toggle';
export * from './components/Table';
export * from './components/Tabs';
export * from './components/MetricCard';
export * from './components/Terminal';
export * from './components/ToolCard';
export * from './components/DiffViewer';
export * from './components/Canvas';
export * from './components/Accordion';
export * from './components/StatBox';
export * from './components/Box';

// Export chat components
export * from './chat/ChatBubble';
export * from './chat/ChatInput';

// Export layout components
export * from './layout/Panel';

/**
 * Get styles for specific components (modular approach)
 *
 * @param components - Array of component classes
 * @returns Combined CSS styles
 *
 * @example
 * ```typescript
 * import { getStyles, Card, Button, Badge } from 'vscode-agent-ui';
 *
 * const styles = getStyles([Card, Button, Badge]);
 * // Returns only the CSS needed for Card, Button, and Badge
 * ```
 */
export function getStyles(components: Array<{ getStyles(): string }>): string {
    return components.map(c => c.getStyles()).join('\n\n');
}

/**
 * Convenience function to get all component styles
 *
 * **Warning:** This loads CSS for all 20+ components. Use getStyles() instead
 * to load only what you need.
 *
 * @deprecated Use getStyles([Component1, Component2, ...]) instead for better performance
 */
export function getAllStyles(): string {
    const { Button } = require('./components/Button');
    const { Card } = require('./components/Card');
    const { Badge } = require('./components/Badge');
    const { Progress } = require('./components/Progress');
    const { Input } = require('./components/Input');
    const { Select } = require('./components/Select');
    const { Toggle } = require('./components/Toggle');
    const { Table } = require('./components/Table');
    const { Tabs } = require('./components/Tabs');
    const { MetricCard } = require('./components/MetricCard');
    const { Terminal } = require('./components/Terminal');
    const { ToolCard } = require('./components/ToolCard');
    const { DiffViewer } = require('./components/DiffViewer');
    const { Canvas } = require('./components/Canvas');
    const { Accordion } = require('./components/Accordion');
    const { StatBox } = require('./components/StatBox');
    const { Box } = require('./components/Box');
    const { ChatBubble } = require('./chat/ChatBubble');
    const { ChatInput } = require('./chat/ChatInput');

    return [
        Button.getStyles(),
        Card.getStyles(),
        Badge.getStyles(),
        Progress.getStyles(),
        Input.getStyles(),
        Select.getStyles(),
        Toggle.getStyles(),
        Table.getStyles(),
        Tabs.getStyles(),
        MetricCard.getStyles(),
        Terminal.getStyles(),
        ToolCard.getStyles(),
        DiffViewer.getStyles(),
        Canvas.getStyles(),
        Accordion.getStyles(),
        StatBox.getStyles(),
        Box.getStyles(),
        ChatBubble.getStyles(),
        ChatInput.getStyles()
    ].join('\n\n');
}
