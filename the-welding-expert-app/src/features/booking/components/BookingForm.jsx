import PropTypes from "prop-types";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlineEnvelope,
  HiOutlineUser,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

import styled from "styled-components";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { logEvent } from "../../../services/apiAnalytics";
import {
  Panel,
  PanelHeader,
  MutedText,
  HorizontalSummary,
  SummaryItem,
  SummaryIcon,
  SummaryContent,
  SummaryLabel,
  SummaryValue,
  FormBlock,
  FieldGrid,
  Field,
  Input,
  Textarea,
  ChannelLink,
  WizardActions,
} from "../../../pages/CustomerBooking.styles";

const ButtonSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: button-spin 1s ease-in-out infinite;
  display: inline-block;

  @keyframes button-spin {
    to { transform: rotate(360deg); }
  }
`;

const ChannelDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin: 2rem 0;
  color: var(--color-grey-400);
  font-size: 1.3rem;
  font-weight: 600;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-grey-200);
  }
`;

const PrimaryWhatsAppButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  min-height: 5.6rem;
  border-radius: var(--border-radius-sm);
  background: var(--color-channel-whatsapp);
  color: #fff;
  font-size: 1.7rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: var(--shadow-md);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    flex-shrink: 0;
  }

  &:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChannelHint = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  margin-top: 1.2rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  line-height: 1.4;
`;

function BookingForm({
  selectedDay,
  selectedSlot,
  selectedService,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  canSubmitToSystem,
  isLoading,
  canSend,
  whatsappUrl,
  quickWhatsappUrl,
  mailUrl,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onNotesChange,
  onSystemSubmit,
  onStepChange,
}) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <Heading as="h2">İletişim ve Onay</Heading>
          <MutedText>
            Randevunuzu tamamlamak için en hızlı yöntemi seçin.
          </MutedText>
        </div>
      </PanelHeader>

      <HorizontalSummary style={{ marginTop: "0" }}>
        <SummaryItem>
          <SummaryIcon>
            <HiOutlineCalendarDays />
          </SummaryIcon>
          <SummaryContent>
            <SummaryLabel>Seçilen Tarih</SummaryLabel>
            <SummaryValue>{selectedDay ? selectedDay.fullDate : "Gün seçilmedi"}</SummaryValue>
          </SummaryContent>
        </SummaryItem>

        <SummaryItem>
          <SummaryIcon>
            <HiOutlineClock />
          </SummaryIcon>
          <SummaryContent>
            <SummaryLabel>Seçilen Saat</SummaryLabel>
            <SummaryValue>{selectedSlot?.label || "Saat seçilmedi"}</SummaryValue>
          </SummaryContent>
        </SummaryItem>

        <SummaryItem>
          <SummaryIcon>
            <HiOutlineWrenchScrewdriver />
          </SummaryIcon>
          <SummaryContent>
            <SummaryLabel>Hizmet Türü</SummaryLabel>
            <SummaryValue>{selectedService}</SummaryValue>
          </SummaryContent>
        </SummaryItem>
      </HorizontalSummary>

      {/* 1. Birincil kanal: WhatsApp */}
      <div>
        <Heading as="h3" style={{ fontSize: "1.5rem", marginBottom: "1.2rem", color: "var(--color-grey-700)" }}>
          En hızlı yanıt için WhatsApp ile gönderin
        </Heading>
        <PrimaryWhatsAppButton
          href={canSend ? whatsappUrl : quickWhatsappUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => logEvent("booking_whatsapp_clicked", {
            channel: canSend ? "wizard_form_filled" : "wizard_form_quick",
            service_type: selectedService,
          })}>
          <FaWhatsapp />
          WhatsApp ile Randevu Gönder
        </PrimaryWhatsAppButton>
        <ChannelHint>
          <HiOutlineUser style={{ width: "1.6rem", height: "1.6rem", flexShrink: 0, color: "var(--color-channel-whatsapp)", marginTop: "0.1rem" }} />
          <span>
            Seçtiğiniz tarih ve saatle hazırlanmış mesaj WhatsApp&apos;ta açılır.
            Umut Usta genellikle <strong>1-2 saat içinde</strong> yanıt verir.
          </span>
        </ChannelHint>

        {mailUrl && canSend && (
          <ChannelLink
            href={mailUrl}
            $color="var(--color-brand-700)"
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => logEvent("booking_email_clicked", {
              service_type: selectedService,
            })}>
            <HiOutlineEnvelope />
            E-posta ile Gönder
          </ChannelLink>
        )}
      </div>

      {/* Ayraç */}
      <ChannelDivider>ya da sisteme kayıt ol</ChannelDivider>

      {/* 2. İkincil kanal: Sistem formu */}
      <FormBlock style={{ background: "var(--color-grey-50)", border: "1px solid var(--color-grey-100)", borderRadius: "var(--border-radius-sm)", padding: "2rem" }}>
        <Heading as="h3" style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
          Sistem üzerinden talep oluştur
        </Heading>
        <MutedText style={{ marginBottom: "1.6rem" }}>
          Ad ve telefon numaranız sisteme kaydedilir; Umut Usta sizi arar.
        </MutedText>

        <FieldGrid>
          <Field>
            Adınız
            <Input
              value={customerName}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ad Soyad"
            />
          </Field>
          <Field>
            Telefon
            <Input
              value={customerPhone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="05xx xxx xx xx"
              maxLength={14}
            />
            {customerPhone && !/^[0][5]\d{9}$/.test(customerPhone.replace(/\D/g, "")) && (
              <span style={{ color: "var(--color-red-700)", fontSize: "1.1rem", fontWeight: "600", marginTop: "0.4rem", display: "block" }}>
                Geçersiz format. Lütfen 05xx xxx xx xx şeklinde 11 haneli numaranızı girin.
              </span>
            )}
          </Field>

          <Field>
            E-posta (isteğe bağlı)
            <Input
              value={customerEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="ornek@email.com"
            />
          </Field>
          <Field>
            İşle ilgili notunuz (isteğe bağlı)
            <Textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              maxLength={1000}
              placeholder="Örn. Balkon korkuluğu tamiri yaptırmak istiyorum."
            />
          </Field>
        </FieldGrid>

        <Button
          size="large"
          variation="secondary"
          style={{ width: "100%", marginTop: "1.6rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}
          disabled={!canSubmitToSystem || isLoading}
          onClick={onSystemSubmit}>
          {isLoading ? (
            <>
              <ButtonSpinner />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            "Randevu Talebi Oluştur"
          )}
        </Button>
      </FormBlock>

      <WizardActions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onStepChange(1)}>
          ← Tarih &amp; Saat Seçimine Geri Dön
        </Button>
        <div />
      </WizardActions>
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
  canSubmitToSystem: PropTypes.bool,
  isLoading: PropTypes.bool,
  canSend: PropTypes.bool,
  whatsappUrl: PropTypes.string,
  quickWhatsappUrl: PropTypes.string,
  mailUrl: PropTypes.string,
  onNameChange: PropTypes.func.isRequired,
  onPhoneChange: PropTypes.func.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
  onSystemSubmit: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default BookingForm;
