import styled from "styled-components";
import { HiOutlineXMark } from "react-icons/hi2";
import Logo from "./Logo";
import MainNav from "./MainNav";

const StyledSidebar = styled.aside`
  grid-area: sidebar;
  background-color: var(--color-grey-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);

  display: flex;
  flex-direction: column;
  gap: 3.2rem;
  z-index: 60;

  @media (max-width: 900px) {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(30rem, calc(100vw - 4.8rem));
    padding: 2.4rem 2rem;
    box-shadow: var(--shadow-lg);
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-105%")});
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    transition:
      transform 0.25s ease,
      visibility 0.25s ease;
  }
`;

const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
`;

const CloseButton = styled.button`
  display: none;

  @media (max-width: 900px) {
    width: 4.4rem;
    height: 4.4rem;
    flex: 0 0 4.4rem;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-grey-700);
    background: var(--color-grey-0);

    &:hover {
      color: var(--color-brand-700);
      background: var(--color-brand-50);
    }

    & svg {
      width: 2.2rem;
      height: 2.2rem;
    }
  }
`;

const Backdrop = styled.div`
  display: none;

  @media (max-width: 900px) {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: block;
    border: 0;
    background: rgba(17, 24, 39, 0.48);
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease;
  }
`;

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <Backdrop
        $isOpen={isOpen}
        aria-hidden="true"
        onClick={onClose}
      />
      <StyledSidebar
        id="admin-navigation"
        $isOpen={isOpen}>
        <SidebarTop>
          <Logo />
          <CloseButton
            type="button"
            aria-label="Menüyü kapat"
            onClick={onClose}>
            <HiOutlineXMark />
          </CloseButton>
        </SidebarTop>
        <MainNav />
      </StyledSidebar>
    </>
  );
}

export default Sidebar;
