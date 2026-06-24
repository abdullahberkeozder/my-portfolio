import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlinePhoto,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    border-left: 3px solid transparent;
    border-radius: var(--border-radius-sm);
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;

    @media (max-width: 900px) {
      min-height: 4.8rem;
      padding: 1.2rem 1.6rem;
    }
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-selection-soft);
    border-left-color: var(--color-action-primary);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: color 0.2s ease;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-selection);
  }
`;

function MainNav() {
  return (
    <nav aria-label="Yönetim menüsü">
      <NavList>
        <li>
          <StyledNavLink to="/admin/dashboard">
            <HiOutlineHome />
            <span>Kontrol merkezi</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/admin/bookings">
            <HiOutlineCalendarDays />
            <span>Randevu talepleri</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/admin/availability">
            <HiOutlineClock />
            <span>Müsaitlik takvimi</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/admin/users">
            <HiOutlineUserGroup />
            <span>Admin hesapları</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/appointment">
            <HiOutlineArrowTopRightOnSquare />
            <span>Müşteri ekranı</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/gallery">
            <HiOutlinePhoto />
            <span>İş galerisi</span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}

export default MainNav;
