import styled, { css } from "styled-components";

const sizes = {
  small: css`
    min-height: 3.6rem;
    font-size: var(--font-size-sm);
    padding: 0.7rem 1rem;
    font-weight: var(--font-weight-semibold);
    text-align: center;
  `,
  medium: css`
    min-height: 4.4rem;
    font-size: var(--font-size-body);
    padding: 1rem 1.6rem;
    font-weight: var(--font-weight-semibold);
  `,
  large: css`
    min-height: 4.8rem;
    font-size: var(--font-size-md);
    padding: 1.2rem 2.4rem;
    font-weight: var(--font-weight-semibold);
  `,
};

const variations = {
  primary: css`
    color: var(--color-grey-0);
    background-color: var(--color-selection);

    &:hover:not(:disabled) {
      background-color: var(--color-selection-strong);
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(23, 107, 145, 0.4);
    }
  `,
  cta: css`
    color: var(--color-surface-dark);
    background-color: var(--color-action-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-action-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(244, 196, 48, 0.5);
    }
  `,
  secondary: css`
    color: var(--color-grey-600);
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);

    &:hover:not(:disabled) {
      background-color: var(--color-grey-50);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-red-700);

    &:hover:not(:disabled) {
      background-color: var(--color-red-800);
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(180, 35, 24, 0.4);
    }
  `,
  success: css`
    color: var(--color-grey-0);
    background-color: var(--color-green-700);

    &:hover:not(:disabled) {
      background-color: var(--color-green-800);
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(46, 125, 79, 0.4);
    }
  `,
  ghost: css`
    color: var(--color-selection-strong);
    background-color: transparent;
    box-shadow: none;

    &:hover:not(:disabled) {
      background-color: var(--color-selection-soft);
      transform: translateY(-1px);
    }
  `,
};

const StyledButton = styled.button`
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  line-height: 1.2;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.1s ease;

  ${(props) =>
    variations[props.$variation] || variations.primary}
  ${(props) => sizes[props.$size] || sizes.medium}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  &:disabled {
    color: var(--color-grey-500);
    background-color: var(--color-grey-200);
    box-shadow: none;
    transform: none;
  }

  &:disabled:hover {
    background-color: var(--color-grey-200);
  }

  @media (max-width: 900px) {
    min-height: 4.4rem;
  }
`;

function Button({
  variation = "primary",
  size = "medium",
  ...props
}) {
  return (
    <StyledButton
      $variation={variation}
      $size={size}
      {...props}
    />
  );
}

export default Button;
