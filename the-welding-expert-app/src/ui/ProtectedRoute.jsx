import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineLockClosed,
  HiOutlineNoSymbol,
} from "react-icons/hi2";

import Button from "./Button";
import Spinner from "./Spinner";
import { getAdminProfile, logout } from "../services/apiAuth";

const Gate = styled.main`
  min-height: 100vh;
  padding: 2.4rem;
  display: grid;
  place-items: center;
  background: var(--color-grey-50);
`;

const GateCard = styled.section`
  width: min(100%, 52rem);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  justify-items: start;
  gap: 1.6rem;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-md);

  @media (max-width: 520px) {
    padding: 2.4rem;
  }
`;

const StatusIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.$danger ? "var(--color-red-700)" : "var(--color-brand-700)"};
  background: ${(props) =>
    props.$danger ? "var(--color-red-100)" : "var(--color-brand-50)"};

  & svg {
    width: 2.6rem;
    height: 2.6rem;
  }
`;

const Title = styled.h1`
  color: var(--color-grey-900);
  font-size: 2.6rem;
  line-height: 1.2;
`;

const Description = styled.p`
  color: var(--color-grey-600);
  font-size: 1.5rem;
  line-height: 1.7;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LoadingCard = styled.div`
  display: grid;
  justify-items: center;
  gap: 1.2rem;
  color: var(--color-grey-600);
  font-size: 1.4rem;
  font-weight: 700;
`;

function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: admin,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const { mutate: signOut, isLoading: isSigningOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  if (isLoading) {
    return (
      <Gate>
        <LoadingCard
          role="status"
          aria-live="polite">
          <Spinner />
          <span>Admin yetkisi kontrol ediliyor...</span>
        </LoadingCard>
      </Gate>
    );
  }

  if (isError) {
    return (
      <Gate>
        <GateCard>
          <StatusIcon $danger>
            <HiOutlineExclamationTriangle />
          </StatusIcon>
          <Title>Yetki bilgisi doğrulanamadı</Title>
          <Description>
            Supabase oturum veya admin profil bilgisi şu anda okunamıyor. Admin
            paneli güvenlik nedeniyle açılmadı.
          </Description>
          <Actions>
            <Button
              type="button"
              disabled={isFetching}
              onClick={() => refetch()}>
              {isFetching ? "Kontrol ediliyor..." : "Tekrar dene"}
            </Button>
            <Button
              as={Link}
              to="/appointment"
              variation="secondary">
              Müşteri ekranına dön
            </Button>
          </Actions>
        </GateCard>
      </Gate>
    );
  }

  if (!admin?.user) {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: location }}
      />
    );
  }

  if (!admin.isAdmin) {
    const isInactiveAdmin =
      admin.profile?.role === "admin" && !admin.profile?.is_active;
    const hasProfile = Boolean(admin.profile);

    return (
      <Gate>
        <GateCard>
          <StatusIcon $danger={isInactiveAdmin}>
            {isInactiveAdmin ? (
              <HiOutlineNoSymbol />
            ) : hasProfile ? (
              <HiOutlineClock />
            ) : (
              <HiOutlineLockClosed />
            )}
          </StatusIcon>
          <Title>
            {isInactiveAdmin
              ? "Admin hesabı pasif"
              : hasProfile
                ? "Admin onayı bekleniyor"
                : "Admin profili bulunamadı"}
          </Title>
          <Description>
            {isInactiveAdmin
              ? "Bu hesabın admin paneli erişimi pasifleştirildi. Tekrar erişim için aktif bir adminle iletişime geçin."
              : hasProfile
                ? "Hesabınız oluşturuldu ancak henüz aktif admin olarak onaylanmadı. Onay verilene kadar admin sayfaları görüntülenemez."
                : "Oturumunuz açık ancak bu kullanıcıya ait bir admin profili bulunmuyor."}
          </Description>
          <Actions>
            <Button
              as={Link}
              to="/appointment">
              Müşteri ekranına dön
            </Button>
            <Button
              type="button"
              variation="secondary"
              disabled={isSigningOut}
              onClick={() => signOut()}>
              {isSigningOut ? "Çıkış yapılıyor..." : "Farklı hesapla giriş"}
            </Button>
          </Actions>
        </GateCard>
      </Gate>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
