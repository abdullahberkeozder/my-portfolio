import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineNoSymbol,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineUserMinus,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import { getAdminProfile } from "../services/apiAuth";
import {
  getAdminProfiles,
  manageTeamMember,
} from "../services/apiAdminProfiles";
import {
  ADMIN_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  STATUS_LABELS,
} from "../utils/adminPermissions";

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
  line-height: 1.6;
`;

const InfoPanel = styled.section`
  border-left: 4px solid var(--color-action-primary);
  padding: 1.6rem 1.8rem;
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;
  background: var(--color-selection-soft);
`;

const InfoIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--color-selection-strong);
  background: var(--color-grey-0);

  & svg {
    width: 2.1rem;
    height: 2.1rem;
  }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1.2rem;
  align-items: center;
  background: var(--color-grey-0);
`;

const StatIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--color-brand-700);
  background: var(--color-brand-50);

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const StatValue = styled.p`
  color: var(--color-grey-900);
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
`;

const Panel = styled.section`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 1.6rem;
  background: var(--color-grey-0);

  @media (max-width: 560px) {
    padding: 1.6rem;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
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
  grid-template-columns: minmax(18rem, 1fr) minmax(18rem, 24rem) auto;
  gap: 1.6rem;
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: minmax(18rem, 1fr) minmax(18rem, 24rem);
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const UserMain = styled.div`
  display: grid;
  gap: 0.6rem;
  min-width: 0;
`;

const UserName = styled.h3`
  overflow-wrap: anywhere;
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
      color: var(--color-status-warning-text);
      background: var(--color-status-warning-bg);
    `}

  ${(props) =>
    props.$tone === "red" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}
`;

const RoleControl = styled.label`
  display: grid;
  gap: 0.6rem;
  color: var(--color-grey-700);
  font-size: 1.2rem;
  font-weight: 800;

  & select {
    min-height: 4.4rem;
    width: 100%;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    padding: 0 3.6rem 0 1.2rem;
    color: var(--color-grey-800);
    background: var(--color-grey-0);
    font: inherit;
    cursor: pointer;
  }

  & select:focus-visible {
    outline: 3px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  & select:disabled {
    color: var(--color-grey-500);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;

  @media (max-width: 980px) {
    grid-column: 1 / -1;
  }

  @media (max-width: 680px) {
    justify-content: flex-start;
  }
`;

const SmallButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
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
      background: var(--color-status-danger-bg);
    `}

  &:disabled {
    color: var(--color-grey-400);
    border-color: var(--color-grey-200);
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

function getStatusTone(status) {
  if (status === "active") return "green";
  if (status === "pending") return "amber";
  return "red";
}

function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: getAdminProfiles,
    enabled: Boolean(admin?.isOwner),
    retry: false,
  });

  const { mutate: updateMember, isLoading: isUpdating } = useMutation({
    mutationFn: manageTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Ekip üyesi güncellendi.");
    },
    onError: (updateError) => toast.error(updateError.message),
  });

  const counts = profiles.reduce(
    (totals, profile) => ({
      ...totals,
      [profile.status]: (totals[profile.status] || 0) + 1,
    }),
    {},
  );

  function changeMember(profile, updates) {
    updateMember({
      userId: profile.user_id,
      role: updates.role || profile.role,
      status: updates.status || profile.status,
    });
  }

  function handleRemove(profile) {
    const confirmed = window.confirm(
      `${profile.full_name || profile.email || "Bu kullanıcı"} ekipten çıkarılsın mı? Hesap giriş yapabilir ancak yönetim paneline erişemez.`,
    );

    if (confirmed) changeMember(profile, { status: "rejected" });
  }

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Ekip ve yetkiler</Heading>
          <MutedText>
            Yönetim paneline kimlerin erişebileceğini, rollerini ve hesap
            durumlarını buradan yönetin.
          </MutedText>
        </HeaderCopy>
      </PageHeader>

      <InfoPanel>
        <InfoIcon>
          <HiOutlineShieldCheck />
        </InfoIcon>
        <div>
          <Heading as="h2">Owner koruması etkin</Heading>
          <MutedText>
            Yalnızca aktif işletme sahipleri ekip hesaplarını yönetebilir.
            Sistemdeki son aktif Owner kaldırılamaz veya pasifleştirilemez.
          </MutedText>
        </div>
      </InfoPanel>

      <StatsGrid>
        <StatCard>
          <StatIcon><HiOutlineUserGroup /></StatIcon>
          <div><MutedText>Toplam ekip</MutedText><StatValue>{profiles.length}</StatValue></div>
        </StatCard>
        <StatCard>
          <StatIcon><HiOutlineCheckCircle /></StatIcon>
          <div><MutedText>Aktif</MutedText><StatValue>{counts.active || 0}</StatValue></div>
        </StatCard>
        <StatCard>
          <StatIcon><HiOutlineClock /></StatIcon>
          <div><MutedText>Onay bekleyen</MutedText><StatValue>{counts.pending || 0}</StatValue></div>
        </StatCard>
        <StatCard>
          <StatIcon><HiOutlineNoSymbol /></StatIcon>
          <div><MutedText>Erişimi kapalı</MutedText><StatValue>{(counts.suspended || 0) + (counts.rejected || 0)}</StatValue></div>
        </StatCard>
      </StatsGrid>

      <Panel>
        <PanelHeader>
          <div>
            <Heading as="h2">Ekip üyeleri</Heading>
            <MutedText>Rol değişiklikleri kaydedildiği anda uygulanır.</MutedText>
          </div>
        </PanelHeader>

        {isLoading && <Spinner />}

        {isError && (
          <ErrorState>
            <strong>Ekip üyeleri okunamadı.</strong>
            <span>{error.message}</span>
          </ErrorState>
        )}

        {!isLoading && !isError && profiles.length === 0 && (
          <EmptyState>
            <strong>Henüz ekip hesabı bulunmuyor.</strong>
            <span>Yeni hesap başvuruları burada onay bekleyen olarak görünür.</span>
          </EmptyState>
        )}

        {!isLoading && !isError && profiles.length > 0 && (
          <UserList>
            {profiles.map((profile) => {
              const isCurrentUser = profile.user_id === admin?.user?.id;
              const displayName =
                profile.full_name || profile.email || "İsimsiz kullanıcı";

              return (
                <UserCard key={profile.user_id}>
                  <UserMain>
                    <UserName>{displayName}</UserName>
                    <MutedText>{profile.email || "E-posta bilgisi yok"}</MutedText>
                    <UserMeta>
                      <Badge $tone={getStatusTone(profile.status)}>
                        {STATUS_LABELS[profile.status] || profile.status}
                      </Badge>
                      <Badge>{ROLE_LABELS[profile.role] || profile.role}</Badge>
                      {isCurrentUser && <Badge>Mevcut oturum</Badge>}
                      <Badge>Kayıt: {formatDate(profile.created_at)}</Badge>
                    </UserMeta>
                  </UserMain>

                  <RoleControl>
                    Yetki rolü
                    <select
                      value={profile.role}
                      disabled={isUpdating || isCurrentUser}
                      aria-label={`${displayName} için yetki rolü`}
                      title={ROLE_DESCRIPTIONS[profile.role]}
                      onChange={(event) =>
                        changeMember(profile, { role: event.target.value })
                      }>
                      {ADMIN_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                    <MutedText>{ROLE_DESCRIPTIONS[profile.role]}</MutedText>
                  </RoleControl>

                  <Actions>
                    {profile.status !== "active" && (
                      <SmallButton
                        type="button"
                        $success
                        disabled={isUpdating || isCurrentUser}
                        onClick={() => changeMember(profile, { status: "active" })}>
                        <HiOutlineCheckCircle />
                        {profile.status === "pending" ? "Onayla" : "Etkinleştir"}
                      </SmallButton>
                    )}

                    {profile.status === "active" && (
                      <SmallButton
                        type="button"
                        disabled={isUpdating || isCurrentUser}
                        onClick={() => changeMember(profile, { status: "suspended" })}>
                        <HiOutlineNoSymbol />
                        Askıya al
                      </SmallButton>
                    )}

                    {profile.status !== "rejected" && (
                      <SmallButton
                        type="button"
                        $danger
                        disabled={isUpdating || isCurrentUser}
                        onClick={() => handleRemove(profile)}>
                        <HiOutlineUserMinus />
                        Ekipten çıkar
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
