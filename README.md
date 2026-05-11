# vscode-agent-ui

Lightweight, framework-agnostic UI components for VS Code webviews. Build beautiful extension interfaces with pure TypeScript components that adapt to VS Code's native theming.

## Why This Library?

Building VS Code webviews from scratch means reinventing common UI patterns. This library provides production-ready components that handle the complexity of VS Code's CSP restrictions, theming system, and webview lifecycle - so you can focus on your extension's unique features.

## Features

- 🎨 **Theme-Aware** - Automatically adapts to VS Code's theme (light, dark, high contrast)
- 📦 **Zero Runtime Dependencies** - Pure TypeScript with no bundled dependencies
- 🚀 **Framework Agnostic** - Pure functions returning HTML strings
- ♿ **Accessible** - ARIA labels, keyboard navigation, semantic HTML
- 🔒 **CSP Compliant** - Works with VS Code's Content Security Policy
- 💡 **Simple API** - `Component.render(props)` returns HTML, `Component.getStyles()` returns CSS
- 📱 **State Preservation** - Built-in support for maintaining state across webview reloads

## Installation

```bash
npm install vscode-agent-ui
```

## Quick Start

```typescript
import * as vscode from 'vscode';
import { Panel, Card, Button, Badge } from 'vscode-agent-ui';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('myExtension.showDashboard', () => {
    // Create a panel
    const panel = new Panel({
      extensionUri: context.extensionUri,
      viewType: 'myExtension.dashboard',
      title: 'Dashboard'
    });

    // Build HTML with components
    const html = panel.buildHtml({
      styles: Card.getStyles() + Badge.getStyles() + Button.getStyles(),
      body: `
        <h1>System Dashboard</h1>
        ${Card.render({
          title: 'Status',
          icon: '📊',
          content: `
            <p>System is ${Badge.render({ text: 'Running', variant: 'success', dot: true })}</p>
            <p>3 tasks active</p>
          `,
          footer: Button.render({
            text: 'Refresh',
            variant: 'primary',
            onclick: 'handleRefresh'
          })
        })}
      `,
      scripts: `
        function handleRefresh() {
          postMessage('refresh', {});
        }
      `
    });

    // Handle messages from webview
    panel.onDidReceiveMessage('refresh', async () => {
      vscode.window.showInformationMessage('Refreshing...');
      // Update panel with new data
    });

    panel.setHtml(html);
    panel.show();
  });

  context.subscriptions.push(disposable);
}
```

## Components

### Core Components

**Form & Input**
- `Button` - Clickable button with variants (primary, secondary, danger, ghost)
- `Input` - Text input with validation, multiline support, and error states
- `Select` - Dropdown selection with grouped options
- `Toggle` - On/off switch for binary states

**Feedback & Status**
- `Badge` - Status indicators and labels
- `Progress` - Progress bars, spinners, steppers, and circular progress
- `Card` - Content container with header, body, and footer

**Data Display**
- `Table` - Data table with sorting, filtering, and custom renderers

### Chat Components

- `ChatBubble` - Single message bubble for chat interfaces
- `ChatInput` - Message input with auto-resize and send button

### Layout Components

- `Panel` - **The foundation** - Generic webview panel for all custom UIs

## Usage Guide

### Pattern 1: Simple Information Display

```typescript
const panel = Panel.createSimple(
  context.extensionUri,
  'myExtension.info',
  'Information',
  `
    <h1>Welcome!</h1>
    <p>This is a simple panel.</p>
  `
);
```

### Pattern 2: Composed UI with Components

```typescript
const panel = new Panel({
  extensionUri: context.extensionUri,
  viewType: 'myExtension.dashboard',
  title: 'Dashboard'
});

const html = panel.buildHtml({
  styles: Card.getStyles() + Progress.getStyles(),
  body: `
    <h1>Build Status</h1>
    ${Card.render({
      title: 'Frontend',
      variant: 'success',
      content: Progress.render({
        type: 'bar',
        value: 100,
        variant: 'success',
        showPercentage: true
      })
    })}
    ${Card.render({
      title: 'Backend',
      variant: 'warning',
      content: Progress.render({
        type: 'bar',
        value: 65,
        variant: 'warning',
        showPercentage: true
      })
    })}
  `
});

panel.setHtml(html);
panel.show();
```

### Pattern 3: Interactive UI with Messaging

```typescript
const panel = new Panel({
  extensionUri: context.extensionUri,
  viewType: 'myExtension.tasks',
  title: 'Task Manager'
});

// Handle messages from webview
panel.onDidReceiveMessage('createTask', async (message) => {
  await createTask(message.name);
  // Update UI
  panel.postMessage({ command: 'taskCreated', data: { id: 123, name: message.name } });
});

panel.onDidReceiveMessage('deleteTask', async (message) => {
  await deleteTask(message.id);
  panel.postMessage({ command: 'taskDeleted', data: { id: message.id } });
});

const html = panel.buildHtml({
  styles: Input.getStyles() + Button.getStyles() + Table.getStyles(),
  body: `
    <h1>Tasks</h1>
    <div>
      ${Input.render({ id: 'taskName', placeholder: 'Enter task name...' })}
      ${Button.render({ text: 'Create Task', variant: 'primary', onclick: 'handleCreate' })}
    </div>
    <div id="tasks">
      ${Table.render({
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ],
        data: tasks
      })}
    </div>
  `,
  scripts: `
    function handleCreate() {
      const input = document.getElementById('taskName');
      postMessage('createTask', { name: input.value });
      input.value = '';
    }
  `
});

panel.setHtml(html);
panel.show();
```

### Pattern 4: Chat Interface

```typescript
const panel = new Panel({
  extensionUri: context.extensionUri,
  viewType: 'myExtension.chat',
  title: 'AI Assistant'
});

panel.onDidReceiveMessage('send', async (message) => {
  // Add user message
  panel.postMessage({
    command: 'addMessage',
    data: {
      role: 'user',
      content: message.text,
      timestamp: Date.now()
    }
  });

  // Get AI response
  const response = await getAIResponse(message.text);

  // Add assistant message
  panel.postMessage({
    command: 'addMessage',
    data: {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    }
  });
});

const html = panel.buildHtml({
  styles: ChatBubble.getStyles() + ChatInput.getStyles(),
  body: `
    <div id="chat-container" style="height: calc(100vh - 100px); overflow-y: auto;">
      <div id="messages"></div>
    </div>
    ${ChatInput.render({
      placeholder: 'Ask me anything...',
      onsubmit: 'handleSend'
    })}
  `,
  scripts: `
    ${ChatInput.getAutoResizeScript()}

    function handleSend(event) {
      const input = document.querySelector('.chat-input-field');
      const text = input.value.trim();
      if (text) {
        postMessage('send', { text });
        input.value = '';
      }
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'addMessage') {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML += ${JSON.stringify('${ChatBubble.render(message.data)}')};
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    });
  `
});

panel.setHtml(html);
panel.show();
```

## AI-Friendly Documentation

Each component includes extensive JSDoc with custom tags designed for AI assistants:

- `@aiInstructions` - How to use the component
- `@aiExample` - Working code examples
- `@aiCommonMistakes` - What NOT to do
- `@aiWhenToUse` - When to use vs alternatives
- `@aiRelatedComponents` - Related components
- `@aiPerformance` - Performance considerations
- `@aiAccessibility` - Accessibility best practices

AI assistants can read these docs and generate correct, idiomatic code without additional context.

## Architecture

```
vscode-agent-ui/
├── src/
│   ├── components/       # Core UI primitives
│   │   ├── Button.ts
│   │   ├── Card.ts
│   │   ├── Badge.ts
│   │   ├── Progress.ts
│   │   ├── Input.ts
│   │   ├── Select.ts
│   │   ├── Toggle.ts
│   │   └── Table.ts
│   ├── chat/            # Chat-specific components
│   │   ├── ChatBubble.ts
│   │   └── ChatInput.ts
│   ├── layout/          # Layout foundations
│   │   └── Panel.ts
│   └── index.ts         # Main exports
```

## Design Principles

1. **Pure Functions** - Components are functions that return HTML strings
2. **No State** - Components don't maintain state (you do)
3. **Composable** - Combine components to build complex UIs
4. **Theme-Aware** - Uses VS Code CSS variables automatically
5. **Accessible** - Semantic HTML + ARIA by default
6. **Documented** - Extensive docs for humans and AI

## Not Included (By Design)

This library intentionally does NOT include:
- Application-specific logic (orchestrators, workers, agents)
- State management
- Data fetching
- Business logic
- Framework bindings

These are YOUR responsibility. This library just makes the UI part easy.

## Examples

See the `/examples` directory for complete working examples:
- `basic-ui/` - Simple panels and components
- `chat-interface/` - Complete chat UI
- `dashboard/` - Monitoring dashboard
- `data-table/` - Sortable data tables

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT © Rob Truitt

## Credits

Built for the VS Code extension community by developers who build AI agent extensions.

---

**Remember**: This is a UI library, not an agent framework. Use these primitives to build YOUR application, YOUR way.
