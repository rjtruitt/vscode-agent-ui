import { registry } from '../base/Registry';
import { escapeHtml } from '../utils/html';
/**
 * ChatBubble Component
 *
 * Single message bubble for chat interfaces with support for different roles and content types.
 *
 * @aiInstructions
 * Use ChatBubble for individual messages in a chat interface:
 * - User messages
 * - Assistant/AI responses
 * - System messages
 * - Tool execution results
 * - Error messages
 *
 * Choose role to automatically style the bubble:
 * - 'user' for human messages (right-aligned, blue)
 * - 'assistant' for AI responses (left-aligned, gray)
 * - 'system' for system notifications (centered, subtle)
 * - 'tool' for tool execution results (special formatting)
 * - 'error' for error messages (red border)
 *
 * @aiExample
 * ```typescript
 * import { ChatBubble } from 'vscode-agent-ui/chat';
 *
 * // User message
 * const userMsg = ChatBubble.render({
 *   role: 'user',
 *   content: 'Write a function to sort an array',
 *   timestamp: Date.now()
 * });
 *
 * // Assistant response with markdown
 * const assistantMsg = ChatBubble.render({
 *   role: 'assistant',
 *   content: 'Here is a sorting function:\n```javascript\nfunction sort(arr) { return arr.sort(); }\n```',
 *   timestamp: Date.now(),
 *   avatar: '🤖'
 * });
 *
 * // System message
 * const systemMsg = ChatBubble.render({
 *   role: 'system',
 *   content: 'Agent started processing your request',
 *   timestamp: Date.now()
 * });
 *
 * // Tool execution
 * const toolMsg = ChatBubble.render({
 *   role: 'tool',
 *   content: 'Command executed successfully',
 *   timestamp: Date.now(),
 *   metadata: {
 *     toolName: 'bash',
 *     duration: '1.2s'
 *   }
 * });
 *
 * // Error message
 * const errorMsg = ChatBubble.render({
 *   role: 'error',
 *   content: 'Failed to execute command: Permission denied',
 *   timestamp: Date.now()
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't render raw HTML in content - it will be escaped for security
 * - Use markdown for formatting (bold, code, links)
 * - Always include timestamp for context
 * - Use appropriate role for semantic meaning
 *
 * @aiWhenToUse
 * Use ChatBubble when:
 * - Building chat interfaces
 * - Displaying conversation history
 * - Showing AI agent interactions
 * - Tool execution logs
 *
 * Don't use ChatBubble when:
 * - Need full chat interface (use ChatWindow)
 * - Displaying non-conversational content (use Card)
 * - Building custom message layouts (use Card with custom HTML)
 *
 * @aiRelatedComponents
 * - ChatWindow (complete chat interface)
 * - ChatInput (message input field)
 * - Card (for non-chat content)
 *
 * @aiAccessibility
 * - Semantic role attributes
 * - Timestamp for context
 * - Clear visual distinction between roles
 * - Keyboard navigation support
 *
 * @aiPerformance
 * ChatBubbles are lightweight. Render hundreds without performance issues.
 * For very long conversations (1000+ messages), use virtualization.
 */

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool' | 'error';

export interface ChatBubbleAction {
    /** Action icon (emoji or HTML) */
    icon: string;

    /** Action label (for tooltip) */
    label: string;

    /** Click handler function name */
    onclick: string;

    /** Visual variant */
    variant?: 'default' | 'danger' | 'primary';
}

/**
 * Chat bubble properties
 */
export interface ChatBubbleProps {
    /** Message role */
    role: ChatRole;

    /** Message content (supports markdown) */
    content: string;

    /** Message timestamp */
    timestamp: number;

    /** Avatar (emoji or image URL) */
    avatar?: string;

    /** Author name */
    author?: string;

    /** Additional metadata */
    metadata?: Record<string, any>;

    /** Show timestamp */
    showTimestamp?: boolean;

    /** Action buttons */
    actions?: ChatBubbleAction[];

    /** Additional CSS classes */
    className?: string;
}

/**
 * ChatBubble Component - Pure function renderer
 */
export class ChatBubble {
    /**
     * Render a chat bubble to HTML string
     */
    static render(props: ChatBubbleProps): string {
        const {
            role,
            content,
            timestamp,
            avatar,
            author,
            metadata,
            showTimestamp = true,
            actions = [],
            className = ''
        } = props;

        const bubbleClasses = [
            'chat-bubble',
            `role-${role}`,
            className
        ].filter(Boolean).join(' ');

        const timeStr = new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const defaultAvatar = ChatBubble.getDefaultAvatar(role);
        const displayAvatar = avatar || defaultAvatar;
        const displayAuthor = author || ChatBubble.getDefaultAuthor(role);

        // Render markdown content
        const renderedContent = ChatBubble.renderMarkdown(content);

        return `
            <div class="${bubbleClasses}" data-role="${role}">
                <div class="bubble-avatar">${displayAvatar}</div>
                <div class="bubble-body">
                    <div class="bubble-header">
                        <span class="bubble-author">${escapeHtml(displayAuthor)}</span>
                        ${showTimestamp ? `<span class="bubble-time">${timeStr}</span>` : ''}
                    </div>
                    <div class="bubble-content">
                        ${renderedContent}
                    </div>
                    ${metadata && Object.keys(metadata).length > 0 ? `
                        <div class="bubble-metadata">
                            ${Object.entries(metadata).map(([key, value]) =>
                                `<span class="metadata-item">${escapeHtml(key)}: ${escapeHtml(String(value))}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    ${actions.length > 0 ? `
                        <div class="bubble-actions">
                            ${actions.map(action => `
                                <button
                                    class="bubble-action ${action.variant ? `variant-${action.variant}` : ''}"
                                    onclick="${action.onclick}(event)"
                                    title="${escapeHtml(action.label)}"
                                    aria-label="${escapeHtml(action.label)}">
                                    ${action.icon}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get default avatar for role
     */
    private static getDefaultAvatar(role: ChatRole): string {
        switch (role) {
            case 'user': return '👤';
            case 'assistant': return '🤖';
            case 'system': return 'ℹ️';
            case 'tool': return '🔧';
            case 'error': return '❌';
            default: return '💬';
        }
    }

    /**
     * Get default author for role
     */
    private static getDefaultAuthor(role: ChatRole): string {
        switch (role) {
            case 'user': return 'You';
            case 'assistant': return 'Assistant';
            case 'system': return 'System';
            case 'tool': return 'Tool';
            case 'error': return 'Error';
            default: return 'Message';
        }
    }

    /**
     * Render markdown to HTML (basic implementation)
     */
    private static renderMarkdown(text: string): string {
        let html = escapeHtml(text);

        // Code blocks (```language\ncode\n```)
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
        });

        // Inline code (`code`)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links ([text](url))
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    /**
     * Get CSS styles for chat bubbles
     */
    static getStyles(): string {
        return `
            /* Chat Bubble Base */
            .chat-bubble {
                display: flex;
                gap: 12px;
                padding: 12px;
                margin-bottom: 8px;
                animation: bubble-in 0.2s ease;
            }

            @keyframes bubble-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Bubble Avatar */
            .bubble-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
                background: var(--vscode-input-background);
            }

            /* Bubble Body */
            .bubble-body {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            /* Bubble Header */
            .bubble-header {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .bubble-author {
                font-size: 12px;
                font-weight: 600;
                color: var(--vscode-foreground);
            }

            .bubble-time {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
            }

            /* Bubble Content */
            .bubble-content {
                font-size: 13px;
                line-height: 1.6;
                color: var(--vscode-foreground);
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 12px;
                word-wrap: break-word;
            }

            .bubble-content > *:first-child {
                margin-top: 0;
            }

            .bubble-content > *:last-child {
                margin-bottom: 0;
            }

            /* Markdown Styles */
            .bubble-content code {
                background: var(--vscode-textCodeBlock-background);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: var(--vscode-editor-font-family);
                font-size: 12px;
            }

            .bubble-content pre {
                background: var(--vscode-textCodeBlock-background);
                padding: 12px;
                border-radius: 6px;
                overflow-x: auto;
                margin: 8px 0;
            }

            .bubble-content pre code {
                background: none;
                padding: 0;
            }

            .bubble-content strong {
                font-weight: 600;
            }

            .bubble-content a {
                color: var(--vscode-textLink-foreground);
                text-decoration: none;
            }

            .bubble-content a:hover {
                text-decoration: underline;
            }

            /* Bubble Metadata */
            .bubble-metadata {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
            }

            .metadata-item {
                padding: 2px 6px;
                background: var(--vscode-badge-background);
                border-radius: 3px;
            }

            /* Role-specific Styles */
            .chat-bubble.role-user {
                flex-direction: row-reverse;
            }

            .chat-bubble.role-user .bubble-content {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border-color: var(--vscode-button-background);
            }

            .chat-bubble.role-user .bubble-author {
                text-align: right;
            }

            .chat-bubble.role-system {
                justify-content: center;
            }

            .chat-bubble.role-system .bubble-content {
                background: var(--vscode-sideBar-background);
                border-color: var(--vscode-panel-border);
                text-align: center;
                font-style: italic;
            }

            .chat-bubble.role-tool .bubble-content {
                background: var(--vscode-textCodeBlock-background);
                border-left: 3px solid var(--vscode-editorInfo-foreground);
            }

            .chat-bubble.role-error .bubble-content {
                background: var(--vscode-inputValidation-errorBackground);
                border-color: var(--vscode-errorForeground);
                border-left-width: 3px;
            }

            .chat-bubble.role-error .bubble-avatar {
                background: var(--vscode-errorForeground);
                color: white;
            }

            /* Bubble Actions */
            .bubble-actions {
                display: flex;
                gap: 6px;
                margin-top: 6px;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .chat-bubble:hover .bubble-actions {
                opacity: 1;
            }

            .bubble-action {
                background: transparent;
                border: none;
                color: var(--vscode-foreground);
                cursor: pointer;
                padding: 4px 6px;
                border-radius: 3px;
                font-size: 14px;
                line-height: 1;
                transition: all 0.15s ease;
                opacity: 0.6;
            }

            .bubble-action:hover {
                opacity: 1;
                background: var(--vscode-toolbar-hoverBackground);
            }

            .bubble-action:active {
                transform: scale(0.95);
            }

            .bubble-action.variant-primary {
                color: var(--vscode-button-foreground);
                background: var(--vscode-button-background);
                opacity: 1;
            }

            .bubble-action.variant-primary:hover {
                background: var(--vscode-button-hoverBackground);
            }

            .bubble-action.variant-danger {
                color: var(--vscode-errorForeground);
            }

            .bubble-action.variant-danger:hover {
                background: rgba(255, 0, 0, 0.15);
            }
        `;
    }}
// Register component
registry.register('ChatBubble', ChatBubble);
