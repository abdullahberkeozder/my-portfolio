import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlinePhoto,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import { getAdminProfile } from "../services/apiAuth";
import { ROUTE_ROLES } from "../utils/adminPermissions";

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

const ADMIN_LINKS = [
  {
    to: "/admin/dashboard",
    label: "Kontrol merkezi",
    icon: HiOutlineHome,
    roles: ROUTE_ROLES.dashboard,
  },
  {
    to: "/admin/bookings",
    label: "Randevu talepleri",
    icon: HiOutlineCalendarDays,
    roles: ROUTE_ROLES.bookings,
  },
  {
    to: "/admin/availability",
    label: "Müsaitlik takvimi",
    icon: HiOutlineClock,
    roles: ROUTE_ROLES.availability,
  },
  {
    to: "/admin/gallery",
    label: "İş galerisi",
    icon: HiOutlinePhoto,
    roles: ROUTE_ROLES.gallery,
  },
  {
    to: "/admin/users",
    label: "Ekip ve yetkiler",
    icon: HiOutlineUserGroup,
    roles: ROUTE_ROLES.users,
  },
  {
    to: "/admin/services",
    label: "Hizmet yönetimi",
    icon: HiOutlineWrenchScrewdriver,
    roles: ROUTE_ROLES.services,
  },
];

const PUBLIC_LINKS = [
  {
    to: "/appointment",
    label: "Randevu sayfası",
    icon: HiOutlineArrowTopRightOnSquare,
  },
  {
    to: "/gallery",
    label: "İş galerisi",
    icon: HiOutlinePhoto,
  },
];

function MainNav({ onClose }) {
  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const role = admin?.profile?.role;
  const visibleAdminLinks = ADMIN_LINKS.filter((link) =>
    link.roles.includes(role),
  );

  return (
    <nav aria-label="Yönetim menüsü">
      <NavList>
        {visibleAdminLinks.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.to}>
              <StyledNavLink to={link.to} onClick={onClose}>
                <Icon />
                <span>{link.label}</span>
              </StyledNavLink>
            </li>
          );
        })}

        {PUBLIC_LINKS.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.to}>
              <StyledNavLink to={link.to} onClick={onClose}>
                <Icon />
                <span>{link.label}</span>
              </StyledNavLink>
            </li>
          );
        })}
      </NavList>
    </nav>
  );
}

export default MainNav;
