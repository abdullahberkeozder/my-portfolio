import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to { transform: rotate(1turn); }
`;

const Spinner = styled.div.attrs({ role: "status", "aria-label": "Yükleniyor" })`
  position: relative;
  width: 4.8rem;
  height: 4.8rem;
  margin: ${(props) => (props.$compact ? "0" : "3.2rem auto")};
  border-radius: 50%;
  border: 1px solid var(--color-grey-200);
  background: var(--color-grey-0);
  box-shadow: inset 0 0 0 0.7rem var(--color-grey-50), var(--shadow-sm);

  &::before {
    content: "";
    position: absolute;
    inset: 0.5rem;
    border-radius: inherit;
    border: 2px solid transparent;
    border-top-color: var(--color-accent-400);
    border-right-color: var(--color-brand-700);
    animation: ${rotate} 850ms linear infinite;
  }

  &::after {
    content: "";
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    top: 0.35rem;
    left: calc(50% - 0.3rem);
    border-radius: 50%;
    background: var(--color-accent-400);
    box-shadow: 0 0 0.8rem rgba(217, 119, 50, 0.38);
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      border-color: var(--color-brand-600);
    }
  }
`;

export default Spinner;
