import styled from "styled-components";

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 0.4rem;
`;

const LogoImage = styled.img`
  width: 4.2rem;
  height: 4.2rem;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-150);
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
      <LogoImage src="/logo.png" alt="Umut Usta Logo" />
      <div>
        <Name>Umut Usta</Name>
        <Caption>Randevu yönetimi</Caption>
      </div>
    </StyledLogo>
  );
}

export default Logo;
