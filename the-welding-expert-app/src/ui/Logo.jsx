import styled from "styled-components";
import BrandLogo from "./BrandLogo";

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 0.6rem;
`;

const LogoMark = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;

  & img {
    display: block;
    object-fit: contain;
  }
`;

const Name = styled.p`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
`;

const Caption = styled.span`
  display: block;
  color: var(--color-grey-500);
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.2rem;
`;

function Logo() {
  return (
    <StyledLogo>
      <LogoMark>
        <BrandLogo size={4} alt="" aria-hidden="true" />
      </LogoMark>
      <div>
        <Name>Umut Usta</Name>
        <Caption>Randevu yönetimi</Caption>
      </div>
    </StyledLogo>
  );
}

export default Logo;
