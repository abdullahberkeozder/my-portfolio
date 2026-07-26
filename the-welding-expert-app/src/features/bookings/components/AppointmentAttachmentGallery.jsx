import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { HiOutlinePhoto, HiOutlineXMark } from "react-icons/hi2";
import styled from "styled-components";

const Section = styled.section`
  display: grid;
  gap: 0.7rem;
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-grey-800);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;

  svg {
    width: 1.7rem;
    height: 1.7rem;
    color: var(--color-brand-600);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 8rem));
  gap: 0.7rem;
`;

const ThumbnailButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0;
  overflow: hidden;
  background: var(--color-grey-50);

  &:focus-visible {
    outline: 3px solid var(--color-brand-400);
    outline-offset: 2px;
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
`;

const DialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 1.6rem;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 78%);
`;

const Dialog = styled.div`
  position: relative;
  width: min(92vw, 90rem);
  max-height: 92vh;
  display: grid;
  place-items: center;

  img {
    max-width: 100%;
    max-height: 88vh;
    border-radius: var(--border-radius-sm);
    object-fit: contain;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 4.4rem;
  height: 4.4rem;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: white;
  background: rgb(0 0 0 / 70%);

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

function AppointmentAttachmentGallery({ attachments }) {
  const [activeAttachment, setActiveAttachment] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!activeAttachment) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveAttachment(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeAttachment]);

  if (!attachments.length) return null;

  return (
    <Section aria-label="Müşteri fotoğrafları">
      <Title>
        <HiOutlinePhoto aria-hidden="true" />
        Fotoğraflar ({attachments.length})
      </Title>
      <Grid>
        {attachments.map((attachment, index) => (
          <ThumbnailButton
            key={attachment.id}
            type="button"
            aria-label={`Fotoğraf ${index + 1} büyük görüntüle`}
            onClick={() => setActiveAttachment(attachment)}>
            <img
              src={attachment.signedUrl}
              alt={`Müşterinin eklediği iş fotoğrafı ${index + 1}`}
            />
          </ThumbnailButton>
        ))}
      </Grid>

      {activeAttachment && (
        <DialogBackdrop
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveAttachment(null);
          }}>
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-label="İş fotoğrafı önizlemesi">
            <img src={activeAttachment.signedUrl} alt="İş fotoğrafı büyük önizleme" />
            <CloseButton
              ref={closeButtonRef}
              type="button"
              aria-label="Önizlemeyi kapat"
              onClick={() => setActiveAttachment(null)}>
              <HiOutlineXMark aria-hidden="true" />
            </CloseButton>
          </Dialog>
        </DialogBackdrop>
      )}
    </Section>
  );
}

AppointmentAttachmentGallery.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      signedUrl: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default AppointmentAttachmentGallery;

