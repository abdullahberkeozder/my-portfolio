import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineXMark,
} from "react-icons/hi2";

import ResponsiveImage from "../../ui/ResponsiveImage";
import { getGalleryImageAlt } from "../../utils/galleryMedia";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 2rem;
  display: grid;
  place-items: center;
  background: rgba(17, 24, 39, 0.68);
  backdrop-filter: blur(6px);

  @media (max-width: 640px) {
    padding: 0;
    align-items: end;
  }
`;

const Dialog = styled.section`
  width: min(94rem, 100%);
  max-height: min(88vh, 84rem);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  overflow: auto;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-lg);

  @media (max-width: 640px) {
    width: 100%;
    max-height: 92vh;
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 2;
  min-height: 6.4rem;
  padding: 1.2rem 1.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  border-bottom: 1px solid var(--color-grey-100);
  background: var(--color-grey-0);
`;

const Title = styled.h2`
  color: var(--color-grey-900);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-tight);
`;

const CloseButton = styled.button`
  width: 4.4rem;
  height: 4.4rem;
  flex: 0 0 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  display: grid;
  place-items: center;
  color: var(--color-grey-700);
  background: var(--color-grey-50);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const Body = styled.div`
  padding: 2rem;
  display: grid;
  gap: 2rem;
`;

const Media = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Figure = styled.figure`
  min-height: 24rem;
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-100);

  & > div {
    width: 100%;
    height: 100%;
    min-height: 24rem;
  }
`;

const Label = styled.figcaption`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  color: #fff;
  background: rgba(17, 24, 39, 0.84);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
`;

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Fact = styled.div`
  padding: 1.2rem;
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-50);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-700);
  }

  & strong {
    display: block;
    color: var(--color-grey-500);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  & span {
    display: block;
    color: var(--color-grey-800);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-extrabold);
  }
`;

const BookingLink = styled(Link)`
  min-height: 4.8rem;
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--color-text-inverse);
  background: var(--color-brand-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);

  &:hover {
    color: var(--color-text-inverse);
    background: var(--color-brand-800);
  }

  & svg {
    width: 1.9rem;
    height: 1.9rem;
  }
`;

const Copy = styled.div`
  display: grid;
  gap: 0.8rem;

  & h3 {
    color: var(--color-grey-900);
    font-size: var(--font-size-base);
  }

  & p {
    color: var(--color-grey-600);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
  }
`;

const Steps = styled.ul`
  display: grid;
  gap: 0.8rem;
`;

const Step = styled.li`
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-700);
  }
`;

function GalleryCaseDialog({ item, onBook, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const controls = dialogRef.current?.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusable = Array.from(controls || []).filter(
        (control) => !control.disabled,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <Backdrop onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-case-title">
        <Header>
          <Title id="gallery-case-title">{item.title}</Title>
          <CloseButton ref={closeRef} type="button" onClick={onClose} aria-label="Vaka detayını kapat">
            <HiOutlineXMark aria-hidden="true" />
          </CloseButton>
        </Header>

        <Body>
          <Media>
            {item.before_image_url && (
              <Figure>
                <ResponsiveImage
                  src={item.before_image_url}
                  sizes="(max-width: 560px) 100vw, 45vw"
                  alt={getGalleryImageAlt(item, "before")}
                />
                <Label>{item.before_label || "Öncesi"}</Label>
              </Figure>
            )}
            <Figure>
              <ResponsiveImage
                src={item.image_url}
                sizes="(max-width: 560px) 100vw, 45vw"
                alt={getGalleryImageAlt(item)}
              />
              <Label>{item.after_label || "Sonrası"}</Label>
            </Figure>
          </Media>

          <Facts>
            <Fact>
              <HiOutlineMapPin aria-hidden="true" />
              <div><strong>Hizmet bölgesi</strong><span>{item.location || "Paylaşılmadı"}</span></div>
            </Fact>
            <Fact>
              <HiOutlineClock aria-hidden="true" />
              <div><strong>Planlama</strong><span>İş kapsamına göre teyit edilir</span></div>
            </Fact>
            <Fact>
              <HiOutlineCheckCircle aria-hidden="true" />
              <div><strong>Fiyatlama</strong><span>{item.price_tagline || "Keşif sonrası netleşir"}</span></div>
            </Fact>
          </Facts>

          <Copy>
            <h3>Problem ve çözüm</h3>
            <p>{item.description || "Uygulama ayrıntıları ekip tarafından teyit edilir."}</p>
          </Copy>

          {item.points?.length > 0 && (
            <Copy>
              <h3>Uygulanan yaklaşım</h3>
              <Steps>
                {item.points.map((point) => (
                  <Step key={point}>
                    <HiOutlineCheckCircle aria-hidden="true" />
                    <span>{point}</span>
                  </Step>
                ))}
              </Steps>
            </Copy>
          )}

          <BookingLink to="/appointment#appointment-calendar" onClick={onBook}>
            <HiOutlineCalendarDays aria-hidden="true" />
            Benzer iş için randevu al
          </BookingLink>
        </Body>
      </Dialog>
    </Backdrop>
  );
}

GalleryCaseDialog.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    location: PropTypes.string,
    image_url: PropTypes.string.isRequired,
    before_image_url: PropTypes.string,
    before_label: PropTypes.string,
    after_label: PropTypes.string,
    price_tagline: PropTypes.string,
    points: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onBook: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GalleryCaseDialog;
