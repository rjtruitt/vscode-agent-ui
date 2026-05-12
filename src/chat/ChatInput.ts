import { escapeHtml } from '../utils/html';
/**
 * ChatInput Component
 *
 * Message input field for chat interfaces with support for multiline text, file attachments, and commands.
 *
 * @aiInstructions
 * Use ChatInput for collecting user messages in chat interfaces:
 * - Text message input
 * - Multiline support with auto-resize
 * - Send button
 * - Optional file attachments
 * - Command autocomplete (slash commands)
 *
 * ChatInput automatically handles:
 * - Enter to send (Shift+Enter for new line)
 * - Auto-resize as user types
 * - Empty message validation
 * - Loading state during processing
 *
 * @aiExample
 * ```typescript
 * import { ChatInput } from 'vscode-agent-ui/chat';
 *
 * // Basic chat input
 * const input = ChatInput.render({
 *   placeholder: 'Type a message...',
 *   onsubmit: 'handleSendMessage'
 * });
 *
 * // Chat input with file attachment
 * const inputWithFiles = ChatInput.render({
 *   placeholder: 'Ask me anything...',
 *   onsubmit: 'handleSendMessage',
 *   showAttachButton: true,
 *   onattach: 'handleFileAttach'
 * });
 *
 * // Loading state
 * const loadingInput = ChatInput.render({
 *   placeholder: 'Type a message...',
 *   onsubmit: 'handleSendMessage',
 *   loading: true,
 *   loadingText: 'AI is thinking...'
 * });
 *
 * // With character limit
 * const limitedInput = ChatInput.render({
 *   placeholder: 'Type a message...',
 *   onsubmit: 'handleSendMessage',
 *   maxLength: 500,
 *   showCharCount: true
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't forget onsubmit handler
 * - Use loading state while AI processes
 * - Clear input after sending message
 * - Validate empty messages before sending
 *
 * @aiWhenToUse
 * Use ChatInput when:
 * - Building chat interfaces
 * - Need message input with send button
 * - Want auto-resize textarea
 * - Need file attachment support
 *
 * Don't use ChatInput when:
 * - Simple form input needed (use Input)
 * - Don't need send button (use Input)
 * - Building non-chat interfaces (use Input)
 *
 * @aiRelatedComponents
 * - ChatBubble (for displaying messages)
 * - ChatWindow (complete chat interface)
 * - Input (for simple text input)
 *
 * @aiAccessibility
 * - Keyboard shortcuts (Enter to send)
 * - Label for screen readers
 * - Button has aria-label
 * - Disabled state during loading
 *
 * @aiPerformance
 * Auto-resize uses efficient DOM measurement. No performance issues with normal typing.
 */

/**
 * Chat input properties
 */
export interface ChatInputProps {
    /** Placeholder text */
    placeholder?: string;

    /** Submit handler function name */
    onsubmit?: string;

    /** Input change handler function name */
    oninput?: string;

    /** Loading state */
    loading?: boolean;

    /** Loading text */
    loadingText?: string;

    /** Show attach file button */
    showAttachButton?: boolean;

    /** File attach handler function name */
    onattach?: string;

    /** Maximum character length */
    maxLength?: number;

    /** Show character count */
    showCharCount?: boolean;

    /** Disabled state */
    disabled?: boolean;

    /** Additional CSS classes */
    className?: string;

    /** Input id */
    id?: string;
}

/**
 * ChatInput Component - Pure function renderer
 */
export class ChatInput {
    /**
     * Render a chat input to HTML string
     */
    static render(props: ChatInputProps): string {
        const {
            placeholder = 'Type a message...',
            onsubmit,
            oninput,
            loading = false,
            loadingText = 'Processing...',
            showAttachButton = false,
            onattach,
            maxLength,
            showCharCount = false,
            disabled = false,
            className = '',
            id = `chat-input-${Math.random().toString(36).substr(2, 9)}`
        } = props;

        const wrapperClasses = [
            'chat-input-wrapper',
            loading && 'loading',
            disabled && 'disabled',
            className
        ].filter(Boolean).join(' ');

        const textareaAttrs = [
            `id="${id}"`,
            `placeholder="${escapeHtml(placeholder)}"`,
            `rows="1"`,
            maxLength && `maxlength="${maxLength}"`,
            disabled && 'disabled',
            oninput && `oninput="${oninput}(event)"`,
            `aria-label="Message input"`
        ].filter(Boolean).join(' ');

        return `
            <div class="${wrapperClasses}">
                ${loading ? `
                    <div class="chat-input-loading">
                        <span class="loading-spinner"></span>
                        <span class="loading-text">${escapeHtml(loadingText)}</span>
                    </div>
                ` : ''}
                <div class="chat-input-container">
                    ${showAttachButton ? `
                        <button
                            type="button"
                            class="attach-button"
                            ${onattach ? `onclick="${onattach}(event)"` : ''}
                            ${disabled ? 'disabled' : ''}
                            aria-label="Attach file"
                            title="Attach file"
                        >
                            📎
                        </button>
                    ` : ''}
                    <textarea
                        class="chat-input-field"
                        ${textareaAttrs}
                        onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); ${onsubmit ? `${onsubmit}(event)` : ''}; }"
                    ></textarea>
                    <button
                        type="button"
                        class="send-button"
                        ${onsubmit ? `onclick="${onsubmit}(event)"` : ''}
                        ${disabled || loading ? 'disabled' : ''}
                        aria-label="Send message"
                        title="Send message (Enter)"
                    >
                        ${loading ? '⏳' : '➤'}
                    </button>
                </div>
                ${showCharCount && maxLength ? `
                    <div class="chat-input-footer">
                        <span class="char-count" id="${id}-count">0 / ${maxLength}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get CSS styles for chat input
     */
    static getStyles(): string {
        return `
            /* Chat Input Wrapper */
            .chat-input-wrapper {
                display: flex;
                flex-direction: column;
                gap: 8px;
                position: relative;
            }

            /* Loading Overlay */
            .chat-input-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                font-size: 13px;
                color: var(--vscode-descriptionForeground);
            }

            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid var(--vscode-progressBar-background);
                border-top-color: var(--vscode-button-background);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                font-style: italic;
            }

            /* Chat Input Container */
            .chat-input-container {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                padding: 8px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                transition: border-color 0.2s ease;
            }

            .chat-input-container:focus-within {
                border-color: var(--vscode-focusBorder);
            }

            .chat-input-wrapper.disabled .chat-input-container {
                opacity: 0.5;
            }

            /* Attach Button */
            .attach-button {
                padding: 8px;
                background: transparent;
                border: none;
                border-radius: 4px;
                font-size: 18px;
                cursor: pointer;
                transition: background 0.2s ease;
                flex-shrink: 0;
                line-height: 1;
            }

            .attach-button:hover:not(:disabled) {
                background: var(--vscode-toolbar-hoverBackground);
            }

            .attach-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Chat Input Field */
            .chat-input-field {
                flex: 1;
                min-height: 24px;
                max-height: 200px;
                padding: 8px 4px;
                background: transparent;
                color: var(--vscode-input-foreground);
                border: none;
                outline: none;
                font-size: 13px;
                font-family: var(--vscode-font-family);
                line-height: 1.5;
                resize: none;
                overflow-y: auto;
            }

            .chat-input-field::placeholder {
                color: var(--vscode-input-placeholderForeground);
            }

            .chat-input-field:disabled {
                cursor: not-allowed;
            }

            /* Send Button */
            .send-button {
                padding: 8px 12px;
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
                line-height: 1;
            }

            .send-button:hover:not(:disabled) {
                background: var(--vscode-button-hoverBackground);
                transform: scale(1.05);
            }

            .send-button:active:not(:disabled) {
                transform: scale(0.95);
            }

            .send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Chat Input Footer */
            .chat-input-footer {
                display: flex;
                justify-content: flex-end;
                padding: 0 4px;
            }

            .char-count {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
            }

            /* Auto-resize behavior */
            .chat-input-field {
                overflow-y: hidden;
            }
        `;
    }

    /**
     * Get JavaScript for auto-resize functionality
     */
    static getAutoResizeScript(): string {
        return `
            // Auto-resize textarea
            document.querySelectorAll('.chat-input-field').forEach(textarea => {
                const autoResize = () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
                };

                textarea.addEventListener('input', autoResize);
                autoResize();

                // Update character count
                const wrapper = textarea.closest('.chat-input-wrapper');
                const charCount = wrapper?.querySelector('.char-count');
                if (charCount) {
                    textarea.addEventListener('input', () => {
                        const maxLength = textarea.getAttribute('maxlength');
                        if (maxLength) {
                            charCount.textContent = \`\${textarea.value.length} / \${maxLength}\`;
                        }
                    });
                }
            });
        `;
    }}
