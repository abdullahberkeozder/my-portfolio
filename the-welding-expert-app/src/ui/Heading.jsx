import styled, { css } from "styled-components";

const Heading = styled.h1`
  ${(props) =>
    props.as === "h1" &&
    css`
      font-size: var(--font-size-page-title);
      font-weight: var(--font-weight-bold);
    `}

  ${(props) =>
    props.as === "h2" &&
    css`
      font-size: var(--font-size-title);
      font-weight: var(--font-weight-semibold);
    `}
    
    ${(props) =>
    props.as === "h3" &&
    css`
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    `}
    
  line-height: var(--line-height-tight);
`;

export default Heading;
