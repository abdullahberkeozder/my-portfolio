import { useState } from "react";
import styled from "styled-components";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import Input from "./Input";

const Field = styled.div`
  position: relative;
`;

const StyledInput = styled(Input)`
  width: 100%;
  padding-right: 5rem;
`;

const Toggle = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  width: 4.4rem;
  min-height: 4.4rem;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  background: transparent;

  &:hover {
    color: var(--color-brand-700);
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field>
      <StyledInput
        {...props}
        type={isVisible ? "text" : "password"}
      />
      <Toggle
        type="button"
        aria-label={isVisible ? "Şifreyi gizle" : "Şifreyi göster"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}>
        {isVisible ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
      </Toggle>
    </Field>
  );
}

export default PasswordInput;
