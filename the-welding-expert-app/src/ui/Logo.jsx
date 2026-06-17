import styled from "styled-components";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 0.4rem;
`;

const Mark = styled.div`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #facc15;
  background: var(--color-grey-900);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const Name = styled.p`
  color: var(--color-grey-900);
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
`;

const Caption = styled.span`
  display: block;
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
`;

function Logo() {
  return (
    <StyledLogo>
      <Mark>
        <HiOutlineWrenchScrewdriver />
      </Mark>
      <div>
        <Name>Welding Expert</Name>
        <Caption>Appointments</Caption>
      </div>
    </StyledLogo>
  );
}

export default Logo;
