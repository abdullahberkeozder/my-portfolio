import styled from "styled-components";

import SignupForm from "../features/authentication/SignupForm";
import Heading from "../ui/Heading";
import Logo from "../ui/Logo";

const SignupLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(32rem, 52rem);
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
  padding: 2.4rem;
`;

function Signup() {
  return (
    <SignupLayout>
      <Logo />
      <Heading as="h1">Admin üyeliği oluştur</Heading>
      <SignupForm />
    </SignupLayout>
  );
}

export default Signup;
