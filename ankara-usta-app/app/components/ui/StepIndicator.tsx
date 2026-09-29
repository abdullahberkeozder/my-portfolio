import React from 'react';
import styles from './StepIndicator.module.css';

export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export default function StepIndicator({
  steps,
  currentStep,
  className = '',
}: StepIndicatorProps) {
  const progressPercent = steps.length > 1
    ? (Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100
    : 0;

  return (
    <nav className={[styles.stepperContainer, className].filter(Boolean).join(' ')} aria-label="Süreç adımları">
      <div className={styles.connectorLine} aria-hidden="true">
        <div className={styles.connectorProgress} style={{ width: `${progressPercent}%` }} />
      </div>

      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const stateClass = isActive
          ? styles.stepItemActive
          : isCompleted
          ? styles.stepItemCompleted
          : '';

        return (
          <div key={label} className={`${styles.stepItem} ${stateClass}`}>
            <div
              className={styles.stepNode}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <span className={styles.stepLabel}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}
