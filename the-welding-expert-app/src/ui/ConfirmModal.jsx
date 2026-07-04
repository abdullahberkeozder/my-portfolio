import { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import Button from "./Button";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(17, 24, 39, 0.48);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledModal = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.3s;
  width: min(90vw, 48rem);
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
`;

const IconWrapper = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-red-700);
  background-color: var(--color-red-100);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const Message = styled.p`
  font-size: 1.5rem;
  color: var(--color-grey-500);
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  disabled = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <Overlay onClick={onCancel}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <IconWrapper>
            <HiOutlineExclamationTriangle />
          </IconWrapper>
          <Title>{title}</Title>
        </ModalHeader>
        <Message>{message}</Message>
        <Actions>
          <Button
            type="button"
            variation="secondary"
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variation="danger"
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </Actions>
      </StyledModal>
    </Overlay>
  );
}

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ConfirmModal;
