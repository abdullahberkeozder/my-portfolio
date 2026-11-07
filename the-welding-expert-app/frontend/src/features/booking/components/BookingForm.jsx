import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  HiOutlineShieldCheck,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import styled, { css, keyframes } from "styled-components";

import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import AppointmentPhotoPicker from "./AppointmentPhotoPicker";
import { logEvent } from "../../../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../../../analytics/events";
import {
  ErrorSummary,
  ContactLayout,
  ContactSummaryPanel,
  ContactSummaryTitle,
  Field,
  FieldError,
  FieldGrid,
  FormBlock,
  HorizontalSummary,
  Input,
  MutedText,
  Panel,
  PanelHeader,
  PrivacyRow,
  SavedDetailsNotice,
  SummaryContent,
  SummaryEditButton,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  Textarea,
} from "./booking.styles";

const buttonSpin = keyframes`
  to { transform: rotate(1turn); }
`;

const ButtonContent = styled.span`
  width: min(21rem, 100%);
  min-height: 2rem;
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) 2rem;
  align-items: center;
  gap: 0.8rem;
`;

const ButtonSpinner = styled.span`
  width: 2rem;
  height: 2rem;
  border: 3px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 50%;
  border-top-color: currentColor;
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  ${(props) =>
    props.$visible &&
    css`
      animation: ${buttonSpin} 850ms linear infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border-color: currentColor;
  }
`;

const ButtonBalance = styled.span`
  width: 2rem;
  height: 2rem;
`;

const RequiredMark = styled.span`
  color: var(--color-red-700);
`;

const CharacterCount = styled.span`
  justify-self: end;
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold);
`;

const OptionalDetailsButton = styled.button`
  min-height: 4.4rem;
  width: fit-content;
  border: 0;
  padding: 0.8rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-brand-700);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    transition: transform var(--motion-base) var(--ease-standard);
    transform: rotate(${(props) => (props.$open ? "180deg" : "0")});
  }
`;

const OptionalDetails = styled.div`
  display: grid;
  gap: 1rem;
`;

const SubmissionNote = styled.p`
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr);
  gap: 0.8rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-grey-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-700);
  }
`;

function BookingForm({
  selectedDay,
  selectedSlot,
  selectedService,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  attachmentFiles = [],
  isLoading,
  submissionProgressLabel,
  canSend,
  fieldErrors,
  submissionError,
  rememberDetails,
  hasSavedDetails,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onNotesChange,
  onAttachmentFilesChange = () => {},
  onRememberDetailsChange,
  onClearSavedDetails,
  onSystemSubmit,
  onStepChange,
}) {
  const [showOptionalDetails, setShowOptionalDetails] = useState(() =>
    Boolean(
      customerEmail ||
      notes ||
      attachmentFiles.length ||
      fieldErrors.customerEmail,
    ),
  );
  const errorSummaryRef = useRef(null);
  const hasErrors =
    Object.values(fieldErrors).some(Boolean) || Boolean(submissionError);

  useEffect(() => {
    if (hasErrors) errorSummaryRef.current?.focus();
  }, [fieldErrors, hasErrors, submissionError]);

  useEffect(() => {
    if (fieldErrors.customerEmail) setShowOptionalDetails(true);
  }, [fieldErrors.customerEmail]);

  function handleOptionalDetailsToggle() {
    setShowOptionalDetails((isOpen) => {
      const expanded = !isOpen;
      logEvent(ANALYTICS_EVENTS.BOOKING_OPTIONAL_DETAILS_TOGGLED, {
        expanded,
        step: 3,
      });
      return expanded;
    });
  }

  return (
    <Panel aria-labelledby="booking-contact-title">
      <PanelHeader $constrained>
        <div>
          <Heading as="h2" id="booking-contact-title" tabIndex="-1">İletişim bilgileri</Heading>
          <MutedText>
            Uygunluğu teyit etmek için sizi arayalım veya WhatsApp&apos;tan yazalım.
          </MutedText>
        </div>
      </PanelHeader>

      <ContactLayout data-contact-layout="true">
        <FormBlock as="form" noValidate onSubmit={onSystemSubmit} aria-busy={isLoading} aria-labelledby="booking-contact-title">
        {hasErrors && (
          <ErrorSummary ref={errorSummaryRef} role="alert" tabIndex="-1">
            <strong>Talep henüz gönderilmedi.</strong>
            {submissionError && <span>{submissionError}</span>}
            {fieldErrors.customerName && <a href="#customerName">Ad soyad alanını kontrol edin.</a>}
            {fieldErrors.customerPhone && <a href="#customerPhone">Telefon alanını kontrol edin.</a>}
            {fieldErrors.customerEmail && <a href="#customerEmail">E-posta alanını kontrol edin.</a>}
          </ErrorSummary>
        )}

        {hasSavedDetails && (
          <SavedDetailsNotice>
            <span>Bu cihazda daha önce kaydedilen iletişim bilgileri dolduruldu.</span>
            <button type="button" onClick={onClearSavedDetails}>Kayıtlı bilgileri sil</button>
          </SavedDetailsNotice>
        )}

        <FieldGrid>
          <Field htmlFor="customerName">
            <span>Ad soyad <RequiredMark aria-hidden="true">*</RequiredMark></span>
            <Input
              id="customerName"
              name="customerName"
              autoComplete="name"
              required
              value={customerName}
              aria-invalid={Boolean(fieldErrors.customerName)}
              aria-describedby={fieldErrors.customerName ? "customerName-error" : undefined}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ad Soyad"
            />
            {fieldErrors.customerName && (
              <FieldError id="customerName-error">{fieldErrors.customerName}</FieldError>
            )}
          </Field>

          <Field htmlFor="customerPhone">
            <span>Telefon numarası <RequiredMark aria-hidden="true">*</RequiredMark></span>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={customerPhone}
              aria-invalid={Boolean(fieldErrors.customerPhone)}
              aria-describedby={fieldErrors.customerPhone ? "customerPhone-error" : undefined}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="05xx xxx xx xx"
              maxLength={14}
            />
            {fieldErrors.customerPhone && (
              <FieldError id="customerPhone-error">{fieldErrors.customerPhone}</FieldError>
            )}
          </Field>

          <OptionalDetailsButton
            type="button"
            $open={showOptionalDetails}
            aria-expanded={showOptionalDetails}
            aria-controls="booking-optional-details"
            onClick={handleOptionalDetailsToggle}>
            Ek bilgi ekle
            <HiOutlineChevronDown aria-hidden="true" />
          </OptionalDetailsButton>

          {showOptionalDetails && (
            <OptionalDetails id="booking-optional-details">
              <Field htmlFor="customerEmail">
                <span>E-posta <small>(isteğe bağlı)</small></span>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={customerEmail}
                  aria-invalid={Boolean(fieldErrors.customerEmail)}
                  aria-describedby={fieldErrors.customerEmail ? "customerEmail-error" : undefined}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="ornek@email.com"
                />
                {fieldErrors.customerEmail && (
                  <FieldError id="customerEmail-error">{fieldErrors.customerEmail}</FieldError>
                )}
              </Field>

              <Field htmlFor="customerNotes">
                <span>İşle ilgili not <small>(isteğe bağlı)</small></span>
                <Textarea
                  id="customerNotes"
                  name="customerNotes"
                  value={notes}
                  onChange={(event) => onNotesChange(event.target.value)}
                  maxLength={1000}
                  placeholder="Örn. Balkon korkuluğu tamiri yaptırmak istiyorum."
                />
                <CharacterCount>{notes.length}/1000</CharacterCount>
              </Field>

              <AppointmentPhotoPicker
                files={attachmentFiles}
                onChange={onAttachmentFilesChange}
                disabled={isLoading}
              />
            </OptionalDetails>
          )}
        </FieldGrid>

        <PrivacyRow>
          <input
            type="checkbox"
            checked={rememberDetails}
            onChange={(event) => onRememberDetailsChange(event.target.checked)}
          />
          <span>Bilgilerimi bu cihazda hatırla.</span>
        </PrivacyRow>

        <ContactSummaryPanel data-contact-summary-panel="true">
          <ContactSummaryTitle>Talep özeti</ContactSummaryTitle>
          <HorizontalSummary aria-label="Talep özeti" data-booking-summary="true">
            <SummaryItem>
              <SummaryContent>
                <SummaryLabel>Tarih tercihi</SummaryLabel>
                <SummaryValue>{selectedDay?.fullDate || "Gün seçilmedi"}</SummaryValue>
              </SummaryContent>
            </SummaryItem>
            <SummaryItem>
              <SummaryContent>
                <SummaryLabel>Saat tercihi</SummaryLabel>
                <SummaryValue>{selectedSlot?.label || "Saat seçilmedi"}</SummaryValue>
              </SummaryContent>
            </SummaryItem>
            <SummaryItem>
              <SummaryContent>
                <SummaryLabel>Hizmet</SummaryLabel>
                <SummaryValue>{selectedService}</SummaryValue>
              </SummaryContent>
            </SummaryItem>
            <SummaryEditButton type="button" onClick={() => onStepChange(2)}>
              Değiştir
            </SummaryEditButton>
          </HorizontalSummary>
        </ContactSummaryPanel>

        <SubmissionNote>
          <HiOutlineShieldCheck aria-hidden="true" />
          <span>Bilgileriniz yalnızca talebinize dönüş yapmak için kullanılır.</span>
        </SubmissionNote>

        <Button
          type="submit"
          size="large"
          variation="cta"
          disabled={!canSend || isLoading}
          style={{ width: "100%" }}>
          <ButtonContent>
            <ButtonSpinner $visible={isLoading} aria-hidden="true" />
            <span>
              {isLoading
                ? submissionProgressLabel || "Talep gönderiliyor"
                : "Talebi Gönder"}
            </span>
            <ButtonBalance aria-hidden="true" />
          </ButtonContent>
        </Button>
        </FormBlock>
      </ContactLayout>

    </Panel>
  );
}

BookingForm.propTypes = {
  selectedDay: PropTypes.object,
  selectedSlot: PropTypes.object,
  selectedService: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  customerPhone: PropTypes.string.isRequired,
  customerEmail: PropTypes.string.isRequired,
  notes: PropTypes.string.isRequired,
  attachmentFiles: PropTypes.arrayOf(PropTypes.instanceOf(File)),
  isLoading: PropTypes.bool,
  submissionProgressLabel: PropTypes.string,
  canSend: PropTypes.bool,
  fieldErrors: PropTypes.object.isRequired,
  submissionError: PropTypes.string,
  rememberDetails: PropTypes.bool.isRequired,
  hasSavedDetails: PropTypes.bool.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onPhoneChange: PropTypes.func.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
  onAttachmentFilesChange: PropTypes.func,
  onRememberDetailsChange: PropTypes.func.isRequired,
  onClearSavedDetails: PropTypes.func.isRequired,
  onSystemSubmit: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default BookingForm;
