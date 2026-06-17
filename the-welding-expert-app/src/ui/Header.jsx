import styled from "styled-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineUserCircle,
} from "react-icons/hi2";

import Button from "./Button";
import { getAdminProfile, logout } from "../services/apiAuth";

const StyledHeader = styled.header`
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.6rem;
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
`;

function Header() {
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
      <HeaderText>
        <HiOutlineClock />
        Same-day quote review
      </HeaderText>
      <Status>
        <HiOutlineBolt />
        Taking appointments
      </Status>
      {admin?.user ? (
        <>
          <UserBox>
            <HiOutlineUserCircle />
            {admin.profile?.full_name || admin.user.email}
          </UserBox>
          <Button
            size="small"
            variation="secondary"
            disabled={isLoading}
            onClick={() => signOut()}>
            Cikis
          </Button>
        </>
      ) : (
        <Button
          as={Link}
          to="/login"
          size="small"
          variation="secondary">
          Giris
        </Button>
      )}
    </StyledHeader>
  );
}

export default Header;
