import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  HiOutlineCamera,
  HiOutlinePhoto,
  HiOutlineTrash,
} from "react-icons/hi2";
import styled from "styled-components";

import {
  APPOINTMENT_ATTACHMENT_LIMITS,
  formatAttachmentSize,
  validateAppointmentAttachments,
} from "../../../utils/appointmentAttachments";

const Picker = styled.div`
  display: grid;
  gap: 1rem;
`;

const PickerHeader = styled.div`
  display: grid;
  gap: 0.3rem;

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }
`;

const PickerActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const PickButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-control);
  padding: 0.8rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  color: var(--color-brand-700);
  background: var(--color-surface);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);

  svg {
    width: 1.9rem;
    height: 1.9rem;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
`;

const PreviewList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 420px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const PreviewItem = styled.li`
  min-width: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-control);
  overflow: hidden;
  background: var(--color-surface-subtle);
`;

const PreviewImage = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
  object-fit: cover;
`;

const PreviewMeta = styled.div`
  min-width: 0;
  padding: 0.7rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3.6rem;
  gap: 0.4rem;
  align-items: center;

  div {
    min-width: 0;
    display: grid;
  }

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--color-text-primary);
    font-size: 1.1rem;
  }

  span {
    color: var(--color-text-muted);
    font-size: 1rem;
  }
`;

const RemoveButton = styled.button`
  width: 3.6rem;
  height: 3.6rem;
  border: 0;
  border-radius: var(--radius-control);
  display: grid;
  place-items: center;
  color: var(--color-status-danger-text);
  background: var(--color-status-danger-bg);

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const PickerError = styled.div`
  border-left: 3px solid var(--color-red-600);
  padding: 0.8rem 1rem;
  display: grid;
  gap: 0.3rem;
  color: var(--color-status-danger-text);
  background: var(--color-status-danger-bg);
  font-size: var(--font-size-xs);
`;

function AppointmentPhotoPicker({ files, onChange, disabled = false }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [errors, setErrors] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files]);

  function handleFiles(selectedFiles) {
    const result = validateAppointmentAttachments(selectedFiles, files.length);
    setErrors(result.errors);
    if (result.accepted.length) onChange([...files, ...result.accepted]);
  }

  function removeFile(index) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
    setErrors([]);
  }

  const limitReached =
    files.length >= APPOINTMENT_ATTACHMENT_LIMITS.maxCount;

  return (
    <Picker>
      <PickerHeader>
        <strong>İşin fotoğrafları <small>(isteğe bağlı)</small></strong>
        <span>
          Sorunu daha hızlı anlamamız için en fazla 3 fotoğraf ekleyin. Her dosya
          en fazla 5 MB olabilir.
        </span>
      </PickerHeader>

      <PickerActions>
        <PickButton
          type="button"
          disabled={disabled || limitReached}
          onClick={() => cameraInputRef.current?.click()}>
          <HiOutlineCamera aria-hidden="true" />
          Fotoğraf çek
        </PickButton>
        <PickButton
          type="button"
          disabled={disabled || limitReached}
          onClick={() => galleryInputRef.current?.click()}>
          <HiOutlinePhoto aria-hidden="true" />
          Galeriden seç
        </PickButton>
      </PickerActions>

      <HiddenInput
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        aria-label="Kamerayla fotoğraf çek"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <HiddenInput
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label="Galeriden fotoğraf seç"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {errors.length > 0 && (
        <PickerError role="alert">
          {errors.map((error) => <span key={error}>{error}</span>)}
        </PickerError>
      )}

      {previews.length > 0 && (
        <PreviewList aria-label="Seçilen fotoğraflar">
          {previews.map(({ file, url }, index) => (
            <PreviewItem key={`${file.name}-${file.lastModified}`}>
              <PreviewImage src={url} alt={`Seçilen fotoğraf ${index + 1}`} />
              <PreviewMeta>
                <div>
                  <strong>{file.name}</strong>
                  <span>{formatAttachmentSize(file.size)}</span>
                </div>
                <RemoveButton
                  type="button"
                  aria-label={`${file.name} fotoğrafını kaldır`}
                  onClick={() => removeFile(index)}>
                  <HiOutlineTrash aria-hidden="true" />
                </RemoveButton>
              </PreviewMeta>
            </PreviewItem>
          ))}
        </PreviewList>
      )}
    </Picker>
  );
}

AppointmentPhotoPicker.propTypes = {
  files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AppointmentPhotoPicker;

