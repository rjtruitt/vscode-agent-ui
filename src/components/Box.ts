import { registry } from '../base/Registry';
import { escapeHtml } from '../utils/html';
/**
 * Box Component
 *
 * Ultra-minimal container with ZERO default styling.
 * You control EVERYTHING through props - padding, border, background, radius, etc.
 *
 * This is the lowest-level primitive - use it to build anything.
 */

export interface BoxProps {
    /** Content (HTML) */
    content: string;

    /** Custom CSS classes */
    className?: string;

    /** Inline styles - YOU control everything */
    style?: Record<string, string>;

    /** HTML attributes */
    attributes?: Record<string, string>;

    /** Click handler */
    onclick?: string;

    /** Hover handler */
    onmouseover?: string;

    /** Mouse leave handler */
    onmouseleave?: string;

    /** HTML tag to use (default: div) */
    tag?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'span';
}

export class Box {
    static render(props: BoxProps): string {
        const {
            content,
            className = '',
            style = {},
            attributes = {},
            onclick,
            onmouseover,
            onmouseleave,
            tag = 'div'
        } = props;

        const styleStr = Object.entries(style)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');

        const attrStr = Object.entries(attributes)
            .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
            .join(' ');

        const handlers = [
            onclick && `onclick="${onclick}()"`,
            onmouseover && `onmouseover="${onmouseover}()"`,
            onmouseleave && `onmouseleave="${onmouseleave}()"`
        ].filter(Boolean).join(' ');

        return `<${tag} ${className ? `class="${className}"` : ''} ${styleStr ? `style="${styleStr}"` : ''} ${attrStr} ${handlers}>${content}</${tag}>`;
    }

    static getStyles(): string {
        return '/* Box has no default styles - you control everything */';
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
// Register component
registry.register('Box', Box);
