import styled, { css } from "styled-components";

const Form = styled.form`
  ${(props) =>
    props.type === "regular" &&
    css`
      display: grid;
      gap: 1.8rem;
    `}

  ${(props) =>
    props.type === "modal" &&
    css`
      width: 80rem;
    `}
    
  font-size: var(--font-size-body);
`;

Form.defaultProps = {
  type: "regular",
};

export default Form;
