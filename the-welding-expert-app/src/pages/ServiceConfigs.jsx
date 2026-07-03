import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import toast from "react-hot-toast";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import { getAdminProfile } from "../services/apiAuth";
import {
  getServiceConfigs,
  updateServiceConfig,
} from "../services/apiServiceConfigs";
import { ROUTE_ROLES } from "../utils/adminPermissions";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const PageHeader = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.4rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-md);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.2rem;
  border-bottom: 1px solid var(--color-grey-50);
  padding-bottom: 1.2rem;
`;

const ServiceTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.8rem;
  font-weight: 800;
`;

const KeyBadge = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  min-height: 4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  background: var(--color-grey-0);
  color: var(--color-grey-800);
  font-size: 1.4rem;

  &:focus {
    outline: 2px solid var(--color-action-primary);
    border-color: transparent;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  background: var(--color-grey-0);
  color: var(--color-grey-800);
  font-size: 1.4rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: 2px solid var(--color-action-primary);
    border-color: transparent;
  }
`;

const PointsGrid = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-grey-50);
`;

const EmptyState = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  text-align: center;
  color: var(--color-grey-500);
`;

function ServiceItem({ service, onSave, isSaving }) {
  const [price, setPrice] = useState(service.price_tagline || "");
  const [description, setDescription] = useState(service.description || "");
  const [pt1, setPt1] = useState(service.points[0] || "");
  const [pt2, setPt2] = useState(service.points[1] || "");
  const [pt3, setPt3] = useState(service.points[2] || "");

  const hasChanges =
    price !== (service.price_tagline || "") ||
    description !== (service.description || "") ||
    pt1 !== (service.points[0] || "") ||
    pt2 !== (service.points[1] || "") ||
    pt3 !== (service.points[2] || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!hasChanges) return;

    onSave({
      id: service.id,
      updates: {
        price_tagline: price.trim(),
        description: description.trim(),
        points: [pt1.trim(), pt2.trim(), pt3.trim()].filter(Boolean),
      },
    });
  }

  function handleReset() {
    setPrice(service.price_tagline || "");
    setDescription(service.description || "");
    setPt1(service.points[0] || "");
    setPt2(service.points[1] || "");
    setPt3(service.points[2] || "");
  }

  return (
    <ServiceCard>
      <CardHeader>
        <ServiceTitle>{service.title}</ServiceTitle>
        <KeyBadge>{service.sort_order}. Sıra</KeyBadge>
      </CardHeader>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Fiyat Açıklaması (Fiyat Etiketi)</Label>
          <Input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Oda başı: 950 TL'den başlayan fiyatlar"
          />
        </FormGroup>

        <FormGroup>
          <Label>Hizmet Açıklaması</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hizmetin kapsamını kısaca açıklayın..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Hizmet Özellikleri (3 Madde)</Label>
          <PointsGrid>
            <Input
              type="text"
              value={pt1}
              onChange={(e) => setPt1(e.target.value)}
              placeholder="Özellik 1"
            />
            <Input
              type="text"
              value={pt2}
              onChange={(e) => setPt2(e.target.value)}
              placeholder="Özellik 2"
            />
            <Input
              type="text"
              value={pt3}
              onChange={(e) => setPt3(e.target.value)}
              placeholder="Özellik 3"
            />
          </PointsGrid>
        </FormGroup>

        <ActionRow>
          {hasChanges && (
            <Button
              type="button"
              $secondary
              onClick={handleReset}
              disabled={isSaving}
            >
              Geri Al
            </Button>
          )}
          <Button type="submit" disabled={!hasChanges || isSaving}>
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </ActionRow>
      </Form>
    </ServiceCard>
  );
}

function ServiceConfigs() {
  const queryClient = useQueryClient();

  const { data: admin, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError,
    error,
  } = useQuery({
    queryKey: ["service-configs-admin"],
    queryFn: getServiceConfigs,
    enabled: Boolean(admin?.isAuthorized),
  });

  const { mutate: updateConfig, isLoading: isSaving } = useMutation({
    mutationFn: updateServiceConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-configs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["service-configs"] });
      toast.success("Hizmet yapılandırması başarıyla güncellendi.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isAuthorized = ROUTE_ROLES.services.includes(admin?.profile?.role);

  if (isLoadingAdmin || isLoadingServices) {
    return (
      <Page>
        <Spinner />
      </Page>
    );
  }

  if (!admin?.user || !isAuthorized) {
    return (
      <Page>
        <EmptyState>
          <strong>Hizmet yönetim yetkiniz bulunmuyor.</strong>
          <p style={{ marginTop: "0.8rem" }}>
            Bu sayfaya erişmek için işletme sahibi veya yönetici hesabı olmalıdır.
          </p>
        </EmptyState>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <EmptyState>
          <strong>Hizmet bilgileri alınamadı.</strong>
          <p style={{ marginTop: "0.8rem" }}>{error.message}</p>
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <Heading as="h1">Hizmet fiyatları ve yönetimi</Heading>
        <MutedText>
          Müşteri randevu ekranında gösterilen hizmet açıklamalarını ve başlangıç
          fiyatlarını düzenleyin.
        </MutedText>
      </PageHeader>

      <ServicesGrid>
        {services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            onSave={updateConfig}
            isSaving={isSaving}
          />
        ))}
      </ServicesGrid>
    </Page>
  );
}

export default ServiceConfigs;
