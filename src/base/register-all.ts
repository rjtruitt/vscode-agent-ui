/**
 * Component Registration
 *
 * This file imports and registers all components with the global registry.
 * Import this file only if you need to use getAllStyles() to get styles
 * for all components at once.
 *
 * For tree-shakeable builds, use the individual component imports and
 * the getStyles() utility function instead:
 *
 * ```typescript
 * import { Button, Card } from 'vscode-agent-ui';
 * import { getStyles } from 'vscode-agent-ui';
 *
 * const styles = getStyles([Button, Card]);
 * ```
 *
 * @aiInstructions
 * This module has side effects - it registers all components on import.
 * Only import this if you specifically need getAllStyles() functionality.
 *
 * Tree-shaking: If you don't use getAllStyles(), your bundler will
 * eliminate this file and only include the components you actually use.
 */

import { registry } from './Registry';

// Import all components
import { Accordion } from '../components/Accordion';
import { Badge } from '../components/Badge';
import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Canvas } from '../components/Canvas';
import { Card } from '../components/Card';
import { DiffViewer } from '../components/DiffViewer';
import { Input } from '../components/Input';
import { MetricCard } from '../components/MetricCard';
import { Progress } from '../components/Progress';
import { Select } from '../components/Select';
import { StatBox } from '../components/StatBox';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { Terminal } from '../components/Terminal';
import { Toggle } from '../components/Toggle';
import { ToolCard } from '../components/ToolCard';

import { ChatBubble } from '../chat/ChatBubble';
import { ChatInput } from '../chat/ChatInput';

// Register all components
registry.register('Accordion', Accordion);
registry.register('Badge', Badge);
registry.register('Box', Box);
registry.register('Button', Button);
registry.register('Canvas', Canvas);
registry.register('Card', Card);
registry.register('DiffViewer', DiffViewer);
registry.register('Input', Input);
registry.register('MetricCard', MetricCard);
registry.register('Progress', Progress);
registry.register('Select', Select);
registry.register('StatBox', StatBox);
registry.register('Table', Table);
registry.register('Tabs', Tabs);
registry.register('Terminal', Terminal);
registry.register('Toggle', Toggle);
registry.register('ToolCard', ToolCard);

registry.register('ChatBubble', ChatBubble);
registry.register('ChatInput', ChatInput);
