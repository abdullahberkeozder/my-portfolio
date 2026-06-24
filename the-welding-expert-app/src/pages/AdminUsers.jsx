import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
  HiOutlineUserGroup,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import { getAdminProfile } from "../services/apiAuth";
import {
  getAdminProfiles,
  updateAdminProfile,
} from "../services/apiAdminProfiles";

const Page = styled.div`
  display: grid;
  gap: 2.4rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const InfoPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 0.8rem;
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 1.2rem;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-700);
  background: var(--color-brand-50);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const StatValue = styled.p`
  color: var(--color-grey-900);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
`;

const Panel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 1.6rem;
`;

const UserList = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const UserCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) auto;
  gap: 1.6rem;
  align-items: center;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const UserMain = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const UserName = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  font-weight: 800;
`;

const UserMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-100);
  font-size: 1.2rem;
  font-weight: 800;

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  ${(props) =>
    props.$tone === "green" &&
    css`
      color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  ${(props) =>
    props.$tone === "amber" &&
    css`
      color: #92400e;
      background: #fef3c7;
    `}

  ${(props) =>
    props.$tone === "red" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;

  @media (max-width: 780px) {
    justify-content: flex-start;
  }
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }

  ${(props) =>
    props.$success &&
    css`
      color: var(--color-green-700);
      border-color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  ${(props) =>
    props.$danger &&
    css`
      color: var(--color-red-700);
      border-color: var(--color-red-100);
      background: #fff7f7;
    `}

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 0.8rem;
  color: var(--color-grey-500);
  background: var(--color-grey-50);
`;

const ErrorState = styled(EmptyState)`
  color: var(--color-red-700);
  background: var(--color-red-100);
`;

function formatDate(date) {
  if (!date) return "Tarih belirtilmedi";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getRoleBadge(profile) {
  if (!profile.is_active) {
    return {
      label: "Pasif",
      tone: "red",
      icon: <HiOutlineNoSymbol />,
    };
  }

  if (profile.role === "admin") {
    return {
      label: "Admin",
      tone: "green",
      icon: <HiOutlineCheckCircle />,
    };
  }

  return {
    label: "Onay bekliyor",
    tone: "amber",
    icon: <HiOutlineXCircle />,
  };
}

function AdminUsers() {
  const queryClient = useQueryClient();

  const {
    data: admin,
    isLoading: isLoadingAdmin,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const isAdmin = admin?.isAdmin;

  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: getAdminProfiles,
    enabled: Boolean(isAdmin),
    retry: false,
  });

  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-profiles"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-profile"],
      });
      toast.success("Admin hesabı güncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const pendingCount = profiles.filter(
    (profile) => profile.role === "pending" && profile.is_active,
  ).length;
  const activeAdminCount = profiles.filter(
    (profile) => profile.role === "admin" && profile.is_active,
  ).length;
  const inactiveCount = profiles.filter(
    (profile) => !profile.is_active,
  ).length;

  function handleApprove(profile) {
    updateProfile({
      userId: profile.user_id,
      updates: {
        role: "admin",
        is_active: true,
      },
    });
  }

  function handleDeactivate(profile) {
    if (profile.user_id === admin?.user?.id) {
      toast.error("Kendi hesabınızı buradan pasifleştiremezsiniz.");
      return;
    }

    updateProfile({
      userId: profile.user_id,
      updates: {
        is_active: false,
      },
    });
  }

  function handleReactivate(profile) {
    updateProfile({
      userId: profile.user_id,
      updates: {
        is_active: true,
      },
    });
  }

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Admin hesapları</Heading>
          <MutedText>
            Yeni üyelikleri onaylayın ve yönetim paneli erişimlerini düzenleyin.
          </MutedText>
        </HeaderCopy>
      </PageHeader>

      <InfoPanel>
        <Heading as="h2">Yetki modeli</Heading>
        <MutedText>
          Yeni üyelikler önce onay bekler. Aktif admin hesapları randevu
          taleplerini ve müsaitlik takvimini yönetebilir.
        </MutedText>
      </InfoPanel>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <HiOutlineUserGroup />
          </StatIcon>
          <div>
            <MutedText>Onay bekleyen</MutedText>
            <StatValue>{pendingCount}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon>
            <HiOutlineCheckCircle />
          </StatIcon>
          <div>
            <MutedText>Aktif admin</MutedText>
            <StatValue>{activeAdminCount}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon>
            <HiOutlineNoSymbol />
          </StatIcon>
          <div>
            <MutedText>Pasif hesap</MutedText>
            <StatValue>{inactiveCount}</StatValue>
          </div>
        </StatCard>
      </StatsGrid>

      <Panel>
        {isLoadingAdmin && <Spinner />}

        {!isLoadingAdmin && !admin?.user && (
          <EmptyState>
            <strong>Admin girişi gerekiyor.</strong>
            <span>Admin hesaplarını yönetmek için giriş yapın.</span>
            <div>
              <Button
                as="a"
                href="/login">
                Giriş yap
              </Button>
            </div>
          </EmptyState>
        )}

        {!isLoadingAdmin && admin?.user && !isAdmin && (
          <EmptyState>
            <strong>Admin yetkisi bekleniyor.</strong>
            <span>
              Bu hesap henüz admin olarak onaylanmadığı için admin hesaplarını
              yönetemez.
            </span>
          </EmptyState>
        )}

        {isAdmin && isLoading && <Spinner />}

        {isAdmin && isError && (
          <ErrorState>
            <strong>Admin profilleri okunamadı.</strong>
            <span>{error.message}</span>
            <span>
              Supabase bağlantısını ve admin profilleri için tanımlanan erişim
              politikalarını kontrol edin.
            </span>
          </ErrorState>
        )}

        {isAdmin && !isLoading && !isError && profiles.length === 0 && (
          <EmptyState>
            <strong>Henüz admin profili bulunmuyor.</strong>
            <span>
              Yeni bir kullanıcı üye olduğunda burada onay bekleyen hesap
              olarak görüntülenir.
            </span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && profiles.length > 0 && (
          <UserList>
            {profiles.map((profile) => {
              const badge = getRoleBadge(profile);
              const isCurrentUser = profile.user_id === admin?.user?.id;
              const displayName =
                profile.full_name || profile.email || "İsimsiz kullanıcı";

              return (
                <UserCard key={profile.user_id}>
                  <UserMain>
                    <UserName>{displayName}</UserName>
                    <MutedText>
                      {profile.email || "E-posta bilgisi yok"}
                    </MutedText>
                    <UserMeta>
                      <Badge $tone={badge.tone}>
                        {badge.icon}
                        {badge.label}
                      </Badge>
                      {isCurrentUser && <Badge>Mevcut oturum</Badge>}
                      <Badge>
                        Kayıt: {formatDate(profile.created_at)}
                      </Badge>
                    </UserMeta>
                  </UserMain>

                  <Actions>
                    {profile.role !== "admin" && (
                      <SmallButton
                        type="button"
                        $success
                        disabled={isUpdating}
                        onClick={() => handleApprove(profile)}>
                        <HiOutlineCheckCircle />
                        Admin yap
                      </SmallButton>
                    )}

                    {!profile.is_active ? (
                      <SmallButton
                        type="button"
                        $success
                        disabled={isUpdating}
                        onClick={() => handleReactivate(profile)}>
                        <HiOutlineCheckCircle />
                        Aktif yap
                      </SmallButton>
                    ) : (
                      <SmallButton
                        type="button"
                        $danger
                        disabled={isUpdating || isCurrentUser}
                        onClick={() => handleDeactivate(profile)}>
                        <HiOutlineNoSymbol />
                        Pasifleştir
                      </SmallButton>
                    )}
                  </Actions>
                </UserCard>
              );
            })}
          </UserList>
        )}
      </Panel>
    </Page>
  );
}

export default AdminUsers;
