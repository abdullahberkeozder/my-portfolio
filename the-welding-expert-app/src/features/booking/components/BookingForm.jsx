import PropTypes from "prop-types";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineUser,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";

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
  ConfirmLayout,
  FormBlock,
  FieldGrid,
  Field,
  Input,
  Textarea,
  DirectContactBlock,
  ChannelGrid,
  ChannelLink,
  WizardActions,
} from "../../../pages/CustomerBooking.styles";

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
            Randevunuzu tamamlamak için iletişim bilgilerinizi doldurun veya hızlı paylaşım seçeneklerini kullanın.
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

      <ConfirmLayout>
        <FormBlock>
          <Heading as="h3" style={{ fontSize: "1.6rem", marginBottom: "1.2rem" }}>
            Sistem Kayıt Formu
          </Heading>
          <MutedText style={{ marginBottom: "1.6rem" }}>
            Sisteme doğrudan talep bırakmak için aşağıdaki alanları doldurun.
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
              />
            </Field>
            <Field>
              E-posta
              <Input
                value={customerEmail}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="ornek@email.com"
              />
            </Field>
            <Field>
              İşle ilgili notunuz
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
            variation="cta"
            style={{ width: "100%", marginTop: "2rem" }}
            disabled={!canSubmitToSystem || isLoading}
            onClick={onSystemSubmit}>
            {isLoading ? "Kaydediliyor..." : "Randevu Talebi Oluştur"}
          </Button>
        </FormBlock>

        <DirectContactBlock>
          <Heading as="h3" style={{ fontSize: "1.6rem", marginBottom: "1.2rem" }}>
            Hızlı İletişim Seçenekleri
          </Heading>
          <MutedText style={{ marginBottom: "1.6rem" }}>
            Bilgilerinizi sisteme kaydetmeden, doğrudan WhatsApp veya E-posta üzerinden randevulu mesaj hazırlayabilirsiniz.
          </MutedText>

          <ChannelGrid>
            <ChannelLink
              href={quickWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              $color="var(--color-channel-whatsapp)">
              <FaWhatsapp />
              Doğrudan Soru Sor / Fotoğraf Gönder
            </ChannelLink>
            <ChannelLink
              href={canSend ? whatsappUrl : undefined}
              target="_blank"
              rel="noreferrer"
              $color="var(--color-brand-600)"
              $disabled={!canSend}>
              <HiOutlinePhone />
              {"Seçili Randevu ile WhatsApp'tan Yaz"}
            </ChannelLink>
            <ChannelLink
              href={canSend ? mailUrl : undefined}
              $color="var(--color-brand-700)"
              $disabled={!canSend}>
              <HiOutlineEnvelope />
              Seçili Randevu ile E-posta Gönder
            </ChannelLink>
          </ChannelGrid>

          <div style={{ marginTop: "2.4rem", display: "flex", gap: "1rem", alignItems: "start" }}>
            <HiOutlineUser style={{ width: "2rem", height: "2rem", color: "var(--color-brand-600)", flexShrink: 0 }} />
            <span style={{ fontSize: "1.2rem", color: "var(--color-grey-500)", lineHeight: "1.4" }}>
              WhatsApp ve e-posta seçenekleri, seçtiğiniz tarih ve saatle hazırlanmış bir mesaj açar. Sistem kaydı için ad ve telefon bilgisi gerekir.
            </span>
          </div>
        </DirectContactBlock>
      </ConfirmLayout>

      <WizardActions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onStepChange(2)}>
          ← Tarih & Saat Seçimine Geri Dön
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
