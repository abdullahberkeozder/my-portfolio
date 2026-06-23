import styled from "styled-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineBars3,
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineUserCircle,
} from "react-icons/hi2";

import Button from "./Button";
import { getAdminProfile, logout } from "../services/apiAuth";

const StyledHeader = styled.header`
  grid-area: header;
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.6rem;
  min-width: 0;

  @media (max-width: 900px) {
    padding: 1rem 2.4rem;
    justify-content: space-between;
  }

  @media (max-width: 560px) {
    padding: 0.8rem 1.6rem;
    gap: 1rem;
  }
`;

const MobileStart = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    min-width: 0;
  }
`;

const MenuButton = styled.button`
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
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const MobileTitle = styled.div`
  min-width: 0;

  & strong,
  & span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & strong {
    color: var(--color-grey-900);
    font-size: 1.4rem;
  }

  & span {
    color: var(--color-grey-500);
    font-size: 1.1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.6rem;
  min-width: 0;

  @media (max-width: 560px) {
    gap: 0.8rem;
  }
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-green-700);
  background: var(--color-green-100);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  font-weight: 700;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

const HeaderText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-600);
  font-size: 1.4rem;
  font-weight: 600;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-yellow-700);
  }

  @media (max-width: 1180px) {
    display: none;
  }
`;

const UserBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-600);
  font-size: 1.3rem;
  font-weight: 700;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }

  @media (max-width: 720px) {
    & span {
      display: none;
    }
  }
`;

function Header({ isNavigationOpen, onToggleNavigation }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const { mutate: signOut, isLoading } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  return (
    <StyledHeader>
      <MobileStart>
        <MenuButton
          type="button"
          aria-label={isNavigationOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-controls="admin-navigation"
          aria-expanded={isNavigationOpen}
          onClick={onToggleNavigation}>
          <HiOutlineBars3 />
        </MenuButton>
        <MobileTitle>
          <strong>Welding Expert</strong>
          <span>Yönetim paneli</span>
        </MobileTitle>
      </MobileStart>

      <HeaderActions>
        <HeaderText>
          <HiOutlineClock />
          Günlük iş takibi
        </HeaderText>
        <Status>
          <HiOutlineBolt />
          Randevu alınıyor
        </Status>
        {admin?.user ? (
          <>
            <UserBox title={admin.profile?.full_name || admin.user.email}>
              <HiOutlineUserCircle />
              <span>{admin.profile?.full_name || admin.user.email}</span>
            </UserBox>
            <Button
              size="small"
              variation="secondary"
              disabled={isLoading}
              onClick={() => signOut()}>
              Çıkış
            </Button>
          </>
        ) : (
          <Button
            as={Link}
            to="/login"
            size="small"
            variation="secondary">
            Giriş
          </Button>
        )}
      </HeaderActions>
    </StyledHeader>
  );
}

export default Header;
