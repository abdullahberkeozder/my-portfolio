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
    color: var(--color-brand-50);
    background-color: var(--color-brand-600);

    &:hover {
      background-color: var(--color-brand-700);
    }
  `,
  secondary: css`
    color: var(--color-grey-600);
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);

    &:hover {
      background-color: var(--color-grey-50);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-red-700);

    &:hover {
      background-color: var(--color-red-800);
    }
  `,
  success: css`
    color: var(--color-grey-0);
    background-color: var(--color-green-700);

    &:hover {
      background-color: var(--color-green-800);
    }
  `,
  ghost: css`
    color: var(--color-brand-700);
    background-color: transparent;
    box-shadow: none;

    &:hover {
      background-color: var(--color-brand-50);
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
    outline: 2px solid var(--color-brand-600);
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
