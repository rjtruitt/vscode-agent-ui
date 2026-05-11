/**
 * Accordion Component
 *
 * Collapsible sections for organizing content hierarchically.
 * State is automatically preserved across panel refreshes.
 *
 * @aiInstructions
 * Use Accordion for:
 * - Organizing long content
 * - FAQ sections
 * - Configuration panels
 * - Nested data structures
 * - Progressive disclosure
 *
 * Accordion sections can be nested and support:
 * - Default open/closed state
 * - Custom icons
 * - Badges for status/counts
 * - Rich content in headers
 *
 * @aiExample
 * ```typescript
 * import { Accordion } from 'vscode-agent-ui/components';
 *
 * const accordion = Accordion.render({
 *   sections: [
 *     {
 *       id: 'settings',
 *       title: 'Settings',
 *       content: '<p>Settings content...</p>',
 *       defaultOpen: true
 *     },
 *     {
 *       id: 'advanced',
 *       title: 'Advanced Options',
 *       icon: '⚙️',
 *       content: '<p>Advanced content...</p>',
 *       defaultOpen: false
 *     }
 *   ]
 * });
 * ```
 */

export interface AccordionSection {
    /** Unique section ID (required for state preservation) */
    id: string;

    /** Section title */
    title: string;

    /** Title icon */
    icon?: string;

    /** Badge text (count, status, etc.) */
    badge?: string;

    /** Section content (HTML) */
    content: string;

    /** Default open state */
    defaultOpen?: boolean;

    /** Disabled state */
    disabled?: boolean;
}

export interface AccordionProps {
    /** Accordion sections */
    sections: AccordionSection[];

    /** Allow multiple sections open */
    multiple?: boolean;

    /** Additional CSS class */
    className?: string;

    /** Inline styles */
    style?: Record<string, string>;
}

export class Accordion {
    static render(props: AccordionProps): string {
        const {
            sections,
            multiple = true,
            className = '',
            style = {}
        } = props;

        const classes = [
            'accordion',
            multiple ? 'multiple' : 'single',
            className
        ].filter(Boolean).join(' ');

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        return `
            <div class="${classes}" ${styleStr ? `style="${styleStr}"` : ''}>
                ${sections.map(section => this.renderSection(section, multiple)).join('')}
            </div>
        `;
    }

    private static renderSection(section: AccordionSection, multiple: boolean): string {
        const {
            id,
            title,
            icon,
            badge,
            content,
            defaultOpen = false,
            disabled = false
        } = section;

        return `
            <div class="accordion-section ${disabled ? 'disabled' : ''}" data-accordion="${this.escapeHtml(id)}">
                <div
                    class="accordion-header ${defaultOpen ? 'expanded' : ''}"
                    onclick="${disabled ? '' : `__toggleAccordion('${this.escapeHtml(id)}', ${multiple})`}"
                    ${disabled ? '' : 'role="button" tabindex="0"'}
                    aria-expanded="${defaultOpen}"
                >
                    <span class="expand-icon">▶</span>
                    ${icon ? `<span class="section-icon">${icon}</span>` : ''}
                    <span class="section-title">${this.escapeHtml(title)}</span>
                    ${badge ? `<span class="section-badge">${this.escapeHtml(badge)}</span>` : ''}
                </div>
                <div class="accordion-content" style="display: ${defaultOpen ? 'block' : 'none'}">
                    ${content}
                </div>
            </div>
            <script>
                if (!window.__toggleAccordion) {
                    window.__toggleAccordion = function(sectionId, multiple) {
                        const section = document.querySelector('[data-accordion="' + sectionId + '"]');
                        if (!section) return;

                        const header = section.querySelector('.accordion-header');
                        const content = section.querySelector('.accordion-content');

                        const isExpanded = content.style.display !== 'none';

                        // If single mode, close others
                        if (!multiple) {
                            const parent = section.closest('.accordion');
                            if (parent) {
                                parent.querySelectorAll('.accordion-section').forEach(s => {
                                    if (s !== section) {
                                        s.querySelector('.accordion-content').style.display = 'none';
                                        s.querySelector('.accordion-header').classList.remove('expanded');
                                        s.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                                    }
                                });
                            }
                        }

                        // Toggle current
                        if (isExpanded) {
                            content.style.display = 'none';
                            header.classList.remove('expanded');
                            header.setAttribute('aria-expanded', 'false');
                        } else {
                            content.style.display = 'block';
                            header.classList.add('expanded');
                            header.setAttribute('aria-expanded', 'true');
                        }

                        // Capture state
                        if (window.__captureState) {
                            window.__captureState();
                        }
                    };
                }
            </script>
        `;
    }

    static getStyles(): string {
        return `
            .accordion {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                overflow: hidden;
            }

            .accordion-section {
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .accordion-section:last-child {
                border-bottom: none;
            }

            .accordion-section.disabled {
                opacity: 0.5;
                pointer-events: none;
            }

            .accordion-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                cursor: pointer;
                user-select: none;
                transition: background 0.2s;
            }

            .accordion-header:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .expand-icon {
                font-size: 10px;
                transition: transform 0.2s;
                display: inline-block;
                width: 12px;
            }

            .accordion-header.expanded .expand-icon {
                transform: rotate(90deg);
            }

            .section-icon {
                font-size: 16px;
            }

            .section-title {
                flex: 1;
                font-size: 13px;
                font-weight: 500;
            }

            .section-badge {
                padding: 2px 6px;
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }

            .accordion-content {
                padding: 12px;
                background: var(--vscode-editor-background);
                animation: fadeIn 0.2s;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `;
    }

    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
