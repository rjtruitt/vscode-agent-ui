import { escapeHtml } from '../utils/html';
/**
 * Progress Component
 *
 * Visual indicator for progress, loading states, and step-by-step processes.
 *
 * @aiInstructions
 * Use Progress to show:
 * - Task completion percentage
 * - Loading states
 * - Multi-step processes
 * - Indeterminate operations
 *
 * Choose the right type:
 * - 'bar' for percentage completion (0-100%)
 * - 'spinner' for loading/waiting states
 * - 'stepper' for multi-step processes
 * - 'circular' for compact progress indication
 *
 * @aiExample
 * ```typescript
 * import { Progress } from 'vscode-agent-ui/components';
 *
 * // Progress bar
 * const buildProgress = Progress.render({
 *   type: 'bar',
 *   value: 75,
 *   label: 'Building project...',
 *   showPercentage: true
 * });
 *
 * // Indeterminate spinner
 * const loading = Progress.render({
 *   type: 'spinner',
 *   label: 'Loading data...'
 * });
 *
 * // Stepper for multi-step process
 * const stepper = Progress.render({
 *   type: 'stepper',
 *   steps: [
 *     { label: 'Initialize', status: 'completed' },
 *     { label: 'Process', status: 'active' },
 *     { label: 'Finalize', status: 'pending' }
 *   ],
 *   currentStep: 1
 * });
 *
 * // Circular progress
 * const circular = Progress.render({
 *   type: 'circular',
 *   value: 60,
 *   size: 'large',
 *   showPercentage: true
 * });
 *
 * // Color variants
 * const success = Progress.render({
 *   type: 'bar',
 *   value: 100,
 *   variant: 'success',
 *   label: 'Complete!'
 * });
 * ```
 *
 * @aiCommonMistakes
 * - Don't use 'bar' type without value (use 'spinner' for indeterminate)
 * - Keep labels short and descriptive
 * - Use appropriate variant (success for completion, error for failures)
 * - For long operations, provide percentage or steps
 *
 * @aiWhenToUse
 * Use Progress when:
 * - Operation takes more than 1 second
 * - Need to show completion percentage
 * - Multi-step process with clear stages
 * - Loading/waiting states
 *
 * Don't use Progress when:
 * - Operation is instant (<1s)
 * - Just need to disable UI (use disabled state)
 * - Need to show data loading (use skeleton screens)
 *
 * @aiRelatedComponents
 * - Spinner (simple loading indicator)
 * - Badge (for status indication)
 * - Card (for grouping progress info)
 *
 * @aiAccessibility
 * - Uses role="progressbar" for screen readers
 * - aria-valuenow for current value
 * - aria-label for description
 * - Visual and text indicators
 *
 * @aiPerformance
 * Update progress in reasonable intervals (every 100ms minimum) to avoid excessive re-renders.
 */

export type ProgressType = 'bar' | 'spinner' | 'stepper' | 'circular';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'small' | 'medium' | 'large';
export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface ProgressStep {
    /** Step label */
    label: string;

    /** Step description */
    description?: string;

    /** Step status */
    status: StepStatus;

    /** Step icon */
    icon?: string;
}

/**
 * Progress component properties
 */
export interface ProgressProps {
    /** Progress type */
    type: ProgressType;

    /** Progress value (0-100 for bar/circular) */
    value?: number;

    /** Label text */
    label?: string;

    /** Visual variant */
    variant?: ProgressVariant;

    /** Progress size */
    size?: ProgressSize;

    /** Show percentage text */
    showPercentage?: boolean;

    /** Steps for stepper type */
    steps?: ProgressStep[];

    /** Current step index */
    currentStep?: number;

    /** Additional CSS classes */
    className?: string;
}

/**
 * Progress Component - Pure function renderer
 */
export class Progress {
    /**
     * Render a progress indicator to HTML string
     */
    static render(props: ProgressProps): string {
        const { type } = props;

        switch (type) {
            case 'bar':
                return Progress.renderBar(props);
            case 'spinner':
                return Progress.renderSpinner(props);
            case 'stepper':
                return Progress.renderStepper(props);
            case 'circular':
                return Progress.renderCircular(props);
            default:
                return '';
        }
    }

    /**
     * Render progress bar
     */
    private static renderBar(props: ProgressProps): string {
        const {
            value = 0,
            label,
            variant = 'default',
            size = 'medium',
            showPercentage = false,
            className = ''
        } = props;

        const percentage = Math.min(100, Math.max(0, value));

        const wrapperClasses = [
            'vscode-progress',
            'progress-bar',
            `variant-${variant}`,
            `size-${size}`,
            className
        ].filter(Boolean).join(' ');

        return `
            <div class="${wrapperClasses}">
                ${label || showPercentage ? `
                    <div class="progress-header">
                        ${label ? `<span class="progress-label">${escapeHtml(label)}</span>` : ''}
                        ${showPercentage ? `<span class="progress-percentage">${percentage}%</span>` : ''}
                    </div>
                ` : ''}
                <div class="progress-track" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" ${label ? `aria-label="${escapeHtml(label)}"` : ''}>
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render spinner
     */
    private static renderSpinner(props: ProgressProps): string {
        const {
            label,
            size = 'medium',
            className = ''
        } = props;

        const wrapperClasses = [
            'vscode-progress',
            'progress-spinner',
            `size-${size}`,
            className
        ].filter(Boolean).join(' ');

        return `
            <div class="${wrapperClasses}">
                <div class="spinner" role="status" ${label ? `aria-label="${escapeHtml(label)}"` : ''}></div>
                ${label ? `<span class="progress-label">${escapeHtml(label)}</span>` : ''}
            </div>
        `;
    }

    /**
     * Render stepper
     */
    private static renderStepper(props: ProgressProps): string {
        const {
            steps = [],
            currentStep = 0,
            className = ''
        } = props;

        const wrapperClasses = [
            'vscode-progress',
            'progress-stepper',
            className
        ].filter(Boolean).join(' ');

        const stepsHtml = steps.map((step, index) => {
            const stepClasses = [
                'stepper-step',
                `status-${step.status}`,
                index === currentStep && 'current'
            ].filter(Boolean).join(' ');

            const icon = step.icon || Progress.getStepIcon(step.status);

            return `
                <div class="${stepClasses}">
                    <div class="step-indicator">
                        <span class="step-icon">${icon}</span>
                        ${index < steps.length - 1 ? '<div class="step-line"></div>' : ''}
                    </div>
                    <div class="step-content">
                        <div class="step-label">${escapeHtml(step.label)}</div>
                        ${step.description ? `
                            <div class="step-description">${escapeHtml(step.description)}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="${wrapperClasses}">
                ${stepsHtml}
            </div>
        `;
    }

    /**
     * Render circular progress
     */
    private static renderCircular(props: ProgressProps): string {
        const {
            value = 0,
            label,
            variant = 'default',
            size = 'medium',
            showPercentage = false,
            className = ''
        } = props;

        const percentage = Math.min(100, Math.max(0, value));
        const radius = size === 'small' ? 16 : size === 'large' ? 32 : 24;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        const wrapperClasses = [
            'vscode-progress',
            'progress-circular',
            `variant-${variant}`,
            `size-${size}`,
            className
        ].filter(Boolean).join(' ');

        const svgSize = radius * 2 + 8;

        return `
            <div class="${wrapperClasses}">
                <svg class="circular-svg" width="${svgSize}" height="${svgSize}" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    <circle class="circular-track" cx="${svgSize / 2}" cy="${svgSize / 2}" r="${radius}"></circle>
                    <circle class="circular-fill" cx="${svgSize / 2}" cy="${svgSize / 2}" r="${radius}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"></circle>
                    ${showPercentage ? `
                        <text class="circular-text" x="50%" y="50%" text-anchor="middle" dy="0.3em">${percentage}%</text>
                    ` : ''}
                </svg>
                ${label ? `<div class="progress-label">${escapeHtml(label)}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get default icon for step status
     */
    private static getStepIcon(status: StepStatus): string {
        switch (status) {
            case 'completed': return '✓';
            case 'active': return '●';
            case 'error': return '✕';
            case 'pending': return '○';
            default: return '○';
        }
    }

    /**
     * Get CSS styles for progress
     */
    static getStyles(): string {
        return `
            /* Progress Base */
            .vscode-progress {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* Progress Header */
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
            }

            .progress-label {
                font-size: 13px;
                color: var(--vscode-foreground);
            }

            .progress-percentage {
                font-size: 12px;
                font-weight: 600;
                color: var(--vscode-descriptionForeground);
            }

            /* Progress Bar */
            .progress-track {
                width: 100%;
                height: 8px;
                background: var(--vscode-progressBar-background, rgba(255, 255, 255, 0.1));
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: var(--vscode-progressBar-background, var(--vscode-button-background));
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .progress-bar.size-small .progress-track {
                height: 4px;
            }

            .progress-bar.size-large .progress-track {
                height: 12px;
            }

            /* Variants */
            .progress-bar.variant-success .progress-fill {
                background: var(--vscode-terminal-ansiGreen);
            }

            .progress-bar.variant-warning .progress-fill {
                background: var(--vscode-editorWarning-foreground);
            }

            .progress-bar.variant-error .progress-fill {
                background: var(--vscode-errorForeground);
            }

            /* Spinner */
            .progress-spinner {
                flex-direction: row;
                align-items: center;
                gap: 10px;
            }

            .spinner {
                width: 20px;
                height: 20px;
                border: 3px solid var(--vscode-progressBar-background, rgba(255, 255, 255, 0.2));
                border-top-color: var(--vscode-button-background);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            .progress-spinner.size-small .spinner {
                width: 14px;
                height: 14px;
                border-width: 2px;
            }

            .progress-spinner.size-large .spinner {
                width: 32px;
                height: 32px;
                border-width: 4px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Stepper */
            .progress-stepper {
                flex-direction: column;
                gap: 0;
            }

            .stepper-step {
                display: flex;
                gap: 12px;
                position: relative;
            }

            .step-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
            }

            .step-icon {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: var(--vscode-input-background);
                border: 2px solid var(--vscode-input-border);
                font-size: 14px;
                z-index: 1;
            }

            .step-line {
                width: 2px;
                flex: 1;
                min-height: 24px;
                background: var(--vscode-input-border);
                margin: 2px 0;
            }

            .step-content {
                flex: 1;
                padding-bottom: 24px;
            }

            .step-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--vscode-foreground);
                margin-bottom: 4px;
            }

            .step-description {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
            }

            /* Step Status */
            .stepper-step.status-completed .step-icon {
                background: var(--vscode-terminal-ansiGreen);
                border-color: var(--vscode-terminal-ansiGreen);
                color: white;
            }

            .stepper-step.status-completed .step-line {
                background: var(--vscode-terminal-ansiGreen);
            }

            .stepper-step.status-active .step-icon {
                background: var(--vscode-button-background);
                border-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }

            .stepper-step.status-error .step-icon {
                background: var(--vscode-errorForeground);
                border-color: var(--vscode-errorForeground);
                color: white;
            }

            .stepper-step.status-error .step-line {
                background: var(--vscode-errorForeground);
            }

            /* Circular Progress */
            .progress-circular {
                align-items: center;
            }

            .circular-svg {
                transform: rotate(-90deg);
            }

            .circular-track {
                fill: none;
                stroke: var(--vscode-progressBar-background, rgba(255, 255, 255, 0.1));
                stroke-width: 4;
            }

            .circular-fill {
                fill: none;
                stroke: var(--vscode-button-background);
                stroke-width: 4;
                stroke-linecap: round;
                transition: stroke-dashoffset 0.3s ease;
            }

            .circular-text {
                transform: rotate(90deg);
                transform-origin: center;
                font-size: 12px;
                font-weight: 600;
                fill: var(--vscode-foreground);
            }

            .progress-circular.variant-success .circular-fill {
                stroke: var(--vscode-terminal-ansiGreen);
            }

            .progress-circular.variant-warning .circular-fill {
                stroke: var(--vscode-editorWarning-foreground);
            }

            .progress-circular.variant-error .circular-fill {
                stroke: var(--vscode-errorForeground);
            }
        `;
    }}
