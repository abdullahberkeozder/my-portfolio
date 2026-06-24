import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  validateGalleryImage,
} from "../services/apiGallery";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Boya ve badana",
  "Kaynak ve metal",
  "Bahçe ve peyzaj",
  "İnşaat ve tadilat",
  "Genel",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  location: "",
  before_label: "Öncesi",
  after_label: "Sonrası",
  points: "",
  price_tagline: "",
  sort_order: 0,
  is_published: true,
};

// ─── STYLED COMPONENTS ──────────────────────────────────────────────────────

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

const StatLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
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
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) =>
    props.$primary
      ? css`
          color: var(--color-grey-0);
          background: var(--color-action-primary);
          border: 1px solid var(--color-action-primary);

          &:hover {
            background: var(--color-action-primary-hover);
            border-color: var(--color-action-primary-hover);
          }
        `
      : css`
          color: var(--color-grey-700);
          background: var(--color-grey-0);
          border: 1px solid var(--color-grey-200);

          &:hover {
            background: var(--color-grey-50);
            border-color: var(--color-grey-300);
          }
        `}

  ${(props) =>
    props.$danger &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-50);
      border: 1px solid var(--color-red-100);

      &:hover {
        background: var(--color-red-100);
        border-color: var(--color-red-700);
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 1.4rem;
`;

const ItemCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: grid;
  grid-template-rows: 18rem auto;
  background: var(--color-grey-50);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-sm);
  }
`;

const CardImage = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--color-grey-200);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PublishBadge = styled.span`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 800;
  z-index: 1;

  ${(props) =>
    props.$published
      ? css`
          color: var(--color-green-700);
          background: var(--color-green-100);
        `
      : css`
          color: var(--color-grey-600);
          background: var(--color-grey-100);
        `}
`;

const CardBody = styled.div`
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
`;

const CardTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Pill = styled.span`
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 1.1rem;
  font-weight: 800;

  ${(props) =>
    props.$tone === "green"
      ? css`
          color: var(--color-brand-700);
          background: var(--color-brand-50);
        `
      : css`
          color: var(--color-grey-600);
          background: var(--color-grey-100);
        `}
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const SmallButton = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-grey-600);
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: var(--color-grey-800);
    border-color: var(--color-grey-300);
    background: var(--color-grey-50);
  }

  ${(props) =>
    props.$danger &&
    css`
      &:hover {
        color: var(--color-red-700);
        border-color: var(--color-red-700);
        background: var(--color-red-50);
      }
    `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

// ─── FORM MODAL STYLES ──────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  padding: 2rem;
  overflow-y: auto;
`;

const Modal = styled.div`
  width: min(100%, 64rem);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 2rem 2.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-100);
`;

const ModalTitle = styled.h2`
  color: var(--color-grey-900);
  font-size: 1.8rem;
  font-weight: 800;
`;

const CloseButton = styled.button`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: var(--border-radius-sm);
  display: grid;
  place-items: center;
  color: var(--color-grey-500);
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--color-grey-800);
    background: var(--color-grey-50);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const ModalBody = styled.div`
  padding: 2.4rem;
  display: grid;
  gap: 2rem;
`;

const ModalFooter = styled.footer`
  padding: 1.6rem 2.4rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--color-grey-100);
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 700;
`;

const TextInput = styled.input`
  min-height: 4.4rem;
  width: 100%;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0 1.2rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font: inherit;
  font-size: 1.4rem;

  &:focus-visible {
    outline: 3px solid var(--color-focus-ring, rgba(13, 128, 80, 0.25));
    outline-offset: 2px;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font: inherit;
  font-size: 1.4rem;
  resize: vertical;

  &:focus-visible {
    outline: 3px solid var(--color-focus-ring, rgba(13, 128, 80, 0.25));
    outline-offset: 2px;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  min-height: 4.4rem;
  width: 100%;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0 3.6rem 0 1.2rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font: inherit;
  font-size: 1.4rem;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid var(--color-focus-ring, rgba(13, 128, 80, 0.25));
    outline-offset: 2px;
  }
`;

const FileDropZone = styled.label`
  min-height: 14rem;
  border: 2px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  display: grid;
  place-items: center;
  gap: 0.8rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: var(--color-brand-500);
    background: var(--color-brand-50);
  }

  ${(props) =>
    props.$hasPreview &&
    css`
      min-height: auto;
      padding: 1rem;
    `}

  & input {
    display: none;
  }

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: var(--color-grey-400);
  }
`;

const DropLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.3rem;
  font-weight: 600;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 16rem;
  border-radius: var(--border-radius-sm);
  object-fit: contain;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;

  & input {
    width: 1.8rem;
    height: 1.8rem;
    accent-color: var(--color-action-primary);
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  display: grid;
  place-items: center;
  gap: 1.2rem;
  color: var(--color-grey-400);

  & svg {
    width: 4.8rem;
    height: 4.8rem;
  }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  padding: 2rem;
`;

const ConfirmBox = styled.div`
  width: min(100%, 42rem);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 1.6rem;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-lg);
`;

const ConfirmTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  font-weight: 800;
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function GalleryAdmin() {
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState(null); // null | "create" | "edit"
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [beforeImageFile, setBeforeImageFile] = useState(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [removeBeforeImage, setRemoveBeforeImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const mainFileRef = useRef(null);
  const beforeFileRef = useRef(null);

  useEffect(() => {
    if (!modalMode && !deleteTarget) return undefined;

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      if (deleteTarget) setDeleteTarget(null);
      else closeModal();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modalMode, deleteTarget]);

  // ── Queries ──────────────────────────────────────────────────────────

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: () => getGalleryItems(),
  });

  // ── Mutations ────────────────────────────────────────────────────────

  const { mutate: mutateCreate, isLoading: isCreating } = useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () => {
      toast.success("Galeri öğesi eklendi.");
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-items-public"] });
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: mutateUpdate, isLoading: isUpdating } = useMutation({
    mutationFn: updateGalleryItem,
    onSuccess: () => {
      toast.success("Galeri öğesi güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-items-public"] });
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: mutateDelete, isLoading: isDeleting } = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      toast.success("Galeri öğesi silindi.");
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-items-public"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: mutateToggle } = useMutation({
    mutationFn: updateGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-items-public"] });
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const published = items.filter((i) => i.is_published).length;
    const draft = items.length - published;
    const categories = new Set(items.map((i) => i.category)).size;
    return { total: items.length, published, draft, categories };
  }, [items]);

  // ── Modal handlers ──────────────────────────────────────────────────

  function openCreate() {
    setFormData(EMPTY_FORM);
    setMainImageFile(null);
    setMainImagePreview(null);
    setBeforeImageFile(null);
    setBeforeImagePreview(null);
    setRemoveBeforeImage(false);
    setEditingItem(null);
    setModalMode("create");
  }

  function openEdit(item) {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || CATEGORIES[0],
      location: item.location || "",
      before_label: item.before_label || "Öncesi",
      after_label: item.after_label || "Sonrası",
      points: (item.points || []).join(", "),
      price_tagline: item.price_tagline || "",
      sort_order: item.sort_order ?? 0,
      is_published: item.is_published ?? true,
    });
    setMainImageFile(null);
    setMainImagePreview(item.image_url || null);
    setBeforeImageFile(null);
    setBeforeImagePreview(item.before_image_url || null);
    setRemoveBeforeImage(false);
    setEditingItem(item);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setMainImageFile(null);
    setMainImagePreview(null);
    setBeforeImageFile(null);
    setBeforeImagePreview(null);
    setRemoveBeforeImage(false);
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleMainImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateGalleryImage(file);
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    } catch (error) {
      toast.error(error.message);
      e.target.value = "";
    }
  }

  function handleBeforeImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateGalleryImage(file);
      setBeforeImageFile(file);
      setBeforeImagePreview(URL.createObjectURL(file));
      setRemoveBeforeImage(false);
    } catch (error) {
      toast.error(error.message);
      e.target.value = "";
    }
  }

  function handleRemoveBeforeImage() {
    setBeforeImageFile(null);
    setBeforeImagePreview(null);
    setRemoveBeforeImage(Boolean(editingItem?.before_image_url));
    if (beforeFileRef.current) beforeFileRef.current.value = "";
  }

  const handleSubmit = useCallback(
    function handleSubmit() {
      if (!formData.title.trim()) {
        toast.error("Başlık zorunludur.");
        return;
      }

      if (modalMode === "create" && !mainImageFile) {
        toast.error("Ana görsel zorunludur.");
        return;
      }

      const pointsArray = formData.points
        .split(",")
        .map((point) => point.trim())
        .filter(Boolean);
      const item = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        location: formData.location.trim() || null,
        before_label: formData.before_label.trim() || "Öncesi",
        after_label: formData.after_label.trim() || "Sonrası",
        points: pointsArray.length > 0 ? pointsArray : null,
        price_tagline: formData.price_tagline.trim() || null,
        sort_order: Math.max(0, Number(formData.sort_order) || 0),
        is_published: formData.is_published,
      };

      if (modalMode === "create") {
        mutateCreate({ item, mainImageFile, beforeImageFile });
      } else {
        mutateUpdate({
          id: editingItem.id,
          updates: item,
          currentItem: editingItem,
          mainImageFile,
          beforeImageFile,
          removeBeforeImage,
        });
      }
    },
    [
      formData,
      mainImageFile,
      beforeImageFile,
      modalMode,
      editingItem,
      removeBeforeImage,
      mutateCreate,
      mutateUpdate,
    ],
  );

  function handleTogglePublish(item) {
    mutateToggle({
      id: item.id,
      updates: { is_published: !item.is_published },
      currentItem: item,
    });
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (isLoading) return <Spinner />;
  if (error) return <MutedText>Galeri yüklenirken hata oluştu.</MutedText>;

  const isSaving = isCreating || isUpdating;

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">İş Galerisi Yönetimi</Heading>
          <MutedText>
            Galeri görsellerini ekleyin, düzenleyin veya kaldırın. Yayınlanan
            öğeler müşteri sayfasında görünür.
          </MutedText>
        </HeaderCopy>
        <ActionButton $primary onClick={openCreate}>
          <HiOutlinePlusCircle />
          Yeni ekle
        </ActionButton>
      </PageHeader>

      {/* Stats */}
      <StatsGrid aria-label="Galeri istatistikleri">
        <StatCard>
          <StatIcon>
            <HiOutlinePhoto />
          </StatIcon>
          <div>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Toplam öğe</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon>
            <HiOutlineEye />
          </StatIcon>
          <div>
            <StatValue>{stats.published}</StatValue>
            <StatLabel>Yayında</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon>
            <HiOutlineEyeSlash />
          </StatIcon>
          <div>
            <StatValue>{stats.draft}</StatValue>
            <StatLabel>Taslak</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon>
            <HiOutlineCheckCircle />
          </StatIcon>
          <div>
            <StatValue>{stats.categories}</StatValue>
            <StatLabel>Kategori</StatLabel>
          </div>
        </StatCard>
      </StatsGrid>

      {/* Gallery Grid */}
      <Panel>
        <PanelHeader>
          <Heading as="h2">Galeri öğeleri</Heading>
          <MutedText>{items.length} öğe</MutedText>
        </PanelHeader>

        {items.length === 0 ? (
          <EmptyState>
            <HiOutlinePhoto />
            <MutedText>
              Henüz galeri öğesi eklenmedi. Yeni bir öğe ekleyerek başlayın.
            </MutedText>
          </EmptyState>
        ) : (
          <ItemGrid>
            {items.map((item) => (
              <ItemCard key={item.id}>
                <CardImage>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <PublishBadge $published={item.is_published}>
                    {item.is_published ? "Yayında" : "Taslak"}
                  </PublishBadge>
                </CardImage>
                <CardBody>
                  <CardTitle>{item.title}</CardTitle>
                  <CardMeta>
                    <Pill $tone="green">{item.category}</Pill>
                    {item.location && <Pill>{item.location}</Pill>}
                    <Pill>Sıra: {item.sort_order}</Pill>
                  </CardMeta>
                  <CardActions>
                    <SmallButton onClick={() => openEdit(item)}>
                      <HiOutlinePencilSquare />
                      Düzenle
                    </SmallButton>
                    <SmallButton
                      onClick={() => handleTogglePublish(item)}
                    >
                      {item.is_published ? (
                        <>
                          <HiOutlineEyeSlash />
                          Gizle
                        </>
                      ) : (
                        <>
                          <HiOutlineEye />
                          Yayınla
                        </>
                      )}
                    </SmallButton>
                    <SmallButton
                      $danger
                      onClick={() => setDeleteTarget(item)}
                    >
                      <HiOutlineTrash />
                      Sil
                    </SmallButton>
                  </CardActions>
                </CardBody>
              </ItemCard>
            ))}
          </ItemGrid>
        )}
      </Panel>

      {/* Create/Edit Modal */}
      {modalMode && (
        <Overlay onClick={closeModal}>
          <Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
            onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle id="gallery-modal-title">
                {modalMode === "create"
                  ? "Yeni galeri öğesi"
                  : "Galeri öğesini düzenle"}
              </ModalTitle>
              <CloseButton
                type="button"
                aria-label="Pencereyi kapat"
                onClick={closeModal}>
                <HiOutlineXMark />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Title */}
              <FieldGroup>
                <Label htmlFor="gf-title">Başlık *</Label>
                <TextInput
                  id="gf-title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="ör. Bahçe korkuluk kaynak tamiri"
                />
              </FieldGroup>

              {/* Category + Location */}
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="gf-category">Kategori *</Label>
                  <Select
                    id="gf-category"
                    value={formData.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gf-location">Konum</Label>
                  <TextInput
                    id="gf-location"
                    value={formData.location}
                    onChange={(e) =>
                      handleFieldChange("location", e.target.value)
                    }
                    placeholder="ör. Çankaya / Ankara"
                  />
                </FieldGroup>
              </FieldRow>

              {/* Description */}
              <FieldGroup>
                <Label htmlFor="gf-description">Açıklama</Label>
                <TextArea
                  id="gf-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="İşin kısa açıklaması..."
                />
              </FieldGroup>

              {/* Main Image Upload */}
              <FieldGroup>
                <Label>
                  Ana görsel (sonuç/sonrası) {modalMode === "create" && "*"}
                </Label>
                <FileDropZone $hasPreview={!!mainImagePreview}>
                  <input
                    ref={mainFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMainImageSelect}
                  />
                  {mainImagePreview ? (
                    <PreviewImage src={mainImagePreview} alt="Ana görsel önizleme" />
                  ) : (
                    <>
                      <HiOutlinePhoto />
                      <DropLabel>
                        Görsel seçmek için tıklayın veya sürükleyin
                      </DropLabel>
                    </>
                  )}
                </FileDropZone>
              </FieldGroup>

              {/* Before Image Upload (optional) */}
              <FieldGroup>
                <Label>Öncesi görseli (opsiyonel)</Label>
                <FileDropZone $hasPreview={!!beforeImagePreview}>
                  <input
                    ref={beforeFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBeforeImageSelect}
                  />
                  {beforeImagePreview ? (
                    <PreviewImage
                      src={beforeImagePreview}
                      alt="Öncesi görsel önizleme"
                    />
                  ) : (
                    <>
                      <HiOutlinePhoto />
                      <DropLabel>
                        Öncesi görseli seçmek için tıklayın (opsiyonel)
                      </DropLabel>
                    </>
                  )}
                </FileDropZone>
                {beforeImagePreview && (
                  <SmallButton
                    type="button"
                    $danger
                    onClick={handleRemoveBeforeImage}>
                    <HiOutlineTrash />
                    Öncesi görselini kaldır
                  </SmallButton>
                )}
              </FieldGroup>

              {/* Before / After labels */}
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="gf-before-label">Öncesi etiketi</Label>
                  <TextInput
                    id="gf-before-label"
                    value={formData.before_label}
                    onChange={(e) =>
                      handleFieldChange("before_label", e.target.value)
                    }
                    placeholder="ör. Öncesi"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gf-after-label">Sonrası etiketi</Label>
                  <TextInput
                    id="gf-after-label"
                    value={formData.after_label}
                    onChange={(e) =>
                      handleFieldChange("after_label", e.target.value)
                    }
                    placeholder="ör. Sonrası"
                  />
                </FieldGroup>
              </FieldRow>

              {/* Points */}
              <FieldGroup>
                <Label htmlFor="gf-points">
                  Özellikler (virgülle ayırın)
                </Label>
                <TextInput
                  id="gf-points"
                  value={formData.points}
                  onChange={(e) =>
                    handleFieldChange("points", e.target.value)
                  }
                  placeholder="ör. Yüzey zımparalama, Astar çekilmesi, Temiz boyama"
                />
              </FieldGroup>

              {/* Price + Sort */}
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="gf-price">Fiyat bilgisi</Label>
                  <TextInput
                    id="gf-price"
                    value={formData.price_tagline}
                    onChange={(e) =>
                      handleFieldChange("price_tagline", e.target.value)
                    }
                    placeholder="ör. 750 TL'den başlayan fiyatlar"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gf-sort">Sıralama</Label>
                  <TextInput
                    id="gf-sort"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      handleFieldChange("sort_order", e.target.value)
                    }
                    min="0"
                  />
                </FieldGroup>
              </FieldRow>

              {/* Published toggle */}
              <CheckRow>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    handleFieldChange("is_published", e.target.checked)
                  }
                />
                Yayınla (müşteriler görebilsin)
              </CheckRow>
            </ModalBody>

            <ModalFooter>
              <ActionButton
                type="button"
                onClick={closeModal}
                disabled={isSaving}>
                İptal
              </ActionButton>
              <ActionButton
                type="button"
                $primary
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving
                  ? "Kaydediliyor…"
                  : modalMode === "create"
                    ? "Ekle"
                    : "Güncelle"}
              </ActionButton>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmOverlay onClick={() => setDeleteTarget(null)}>
          <ConfirmBox
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gallery-delete-title"
            onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle id="gallery-delete-title">
              Galeri öğesini sil
            </ConfirmTitle>
            <MutedText>
              &quot;{deleteTarget.title}&quot; öğesini silmek istediğinize emin
              misiniz? Bu işlem geri alınamaz ve ilişkili görseller de
              kaldırılır.
            </MutedText>
            <ConfirmActions>
              <ActionButton
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                İptal
              </ActionButton>
              <ActionButton
                type="button"
                $danger
                onClick={() => mutateDelete(deleteTarget.id)}
                disabled={isDeleting}
              >
                <HiOutlineTrash />
                {isDeleting ? "Siliniyor…" : "Evet, sil"}
              </ActionButton>
            </ConfirmActions>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </Page>
  );
}

export default GalleryAdmin;
