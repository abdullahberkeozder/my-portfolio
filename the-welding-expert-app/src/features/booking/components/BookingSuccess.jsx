import PropTypes from "prop-types";
import {
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlinePhone,
  HiOutlineClipboard,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import styled from "styled-components";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { BUSINESS_TELEPHONE, BUSINESS_WHATSAPP_NUMBER } from "../../../config/business";

const SuccessPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  animation: slideUpSuccess 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes slideUpSuccess {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SuccessIconWrapper = styled.div`
  color: var(--color-green-700);
  margin-bottom: 2rem;

  & svg {
    width: 6.4rem;
    height: 6.4rem;
  }
`;

const SuccessDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  max-width: 44rem;
  margin: 2.8rem 0 0;
  padding: 2rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  text-align: left;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
    flex-shrink: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: var(--color-grey-500);
  min-width: 10rem;
`;

const DetailValue = styled.span`
  font-weight: 700;
  color: var(--color-grey-900);
`;

const SuccessSubtitle = styled.p`
  color: var(--color-grey-600);
  font-size: 1.5rem;
  line-height: 1.6;
  max-width: 50rem;
  margin-top: 1rem;
`;

/* ---- Beklenti Yönetimi Timeline ---- */
const TimelineSection = styled.div`
  width: 100%;
  max-width: 44rem;
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-brand-50) 0%, var(--color-grey-50) 100%);
  border: 1px solid var(--color-brand-100);
  border-radius: var(--border-radius-sm);
  text-align: left;
`;

const TimelineTitle = styled.p`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-brand-700);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 1.4rem;
`;

const TimelineList = styled.ol`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const TimelineItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  line-height: 1.4;
`;

const TimelineBullet = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  background: ${(props) =>
    props.$done
      ? "var(--color-green-700)"
      : "var(--color-brand-600)"};
  color: #fff;
  margin-top: 0.1rem;
`;

const PhoneCallout = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.4rem;
  padding: 1.2rem 1.4rem;
  background: var(--color-brand-600);
  border-radius: var(--border-radius-sm);
  color: #fff;

  & svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  & span {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.3;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  max-width: 36rem;
  margin-top: 2rem;
`;

function maskPhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 7) return phone;
  return phone.slice(0, -4).replace(/\d(?=\d{0}$)/g, "*") + clean.slice(-4);
}

function BookingSuccess({
  selectedDay,
  selectedSlot,
  selectedService,
  customerPhone,
  whatsappUrl,
  bookingId,
  onReset,
}) {
  const maskedPhone = maskPhone(customerPhone);

  const trackingCode = bookingId
    ? `UU-${bookingId.slice(0, 8).toUpperCase()}`
    : "UU-YENI";

  const messageText = `Merhaba Umut Usta, web sitenizden randevu talebi oluşturdum:

Takip Kodu: ${trackingCode}
Hizmet: ${selectedService}
Tarih: ${selectedDay ? selectedDay.fullDate : "-"}
Saat: ${selectedSlot?.label || "-"}
Telefon: ${customerPhone || ""}

Randevuyu onaylayabilir miyiz? Teşekkürler.`;

  const customizedWhatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

  return (
    <SuccessPanel>
      <SuccessIconWrapper>
        <HiOutlineCheckCircle />
      </SuccessIconWrapper>
      <Heading as="h1" style={{ fontSize: "2.4rem", fontWeight: 800 }}>
        Randevu Talebiniz Alındı!
      </Heading>
      <SuccessSubtitle>
        Talebiniz sisteme kaydedildi. Aşağıdaki adımları takip edin.
      </SuccessSubtitle>

      <SuccessDetails>
        <DetailItem style={{ background: "var(--color-brand-50)", padding: "1.2rem 1.6rem", borderRadius: "var(--border-radius-sm)", border: "1px dashed var(--color-brand-300)", marginBottom: "1rem" }}>
          <HiOutlineClipboard />
          <DetailLabel style={{ color: "var(--color-brand-700)", fontWeight: "800" }}>Takip Kodu:</DetailLabel>
          <DetailValue style={{ fontFamily: "monospace", fontSize: "1.6rem", color: "var(--color-brand-800)", fontWeight: "900" }}>{trackingCode}</DetailValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineWrenchScrewdriver />
          <DetailLabel>Hizmet:</DetailLabel>
          <DetailValue>{selectedService}</DetailValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineCalendarDays />
          <DetailLabel>Tarih:</DetailLabel>
          <DetailValue>{selectedDay ? selectedDay.fullDate : "-"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineClock />
          <DetailLabel>Saat Aralığı:</DetailLabel>
          <DetailValue>{selectedSlot?.label || "-"}</DetailValue>
        </DetailItem>
        {maskedPhone && (
          <DetailItem>
            <HiOutlinePhone />
            <DetailLabel>Telefonunuz:</DetailLabel>
            <DetailValue>{maskedPhone}</DetailValue>
          </DetailItem>
        )}
      </SuccessDetails>

      {/* Beklenti yönetimi timeline */}
      <TimelineSection>
        <TimelineTitle>Ne bekleyin?</TimelineTitle>
        <TimelineList>
          <TimelineItem>
            <TimelineBullet $done>✓</TimelineBullet>
            <span><strong>Talep alındı</strong> — Randevu talebiniz sisteme başarıyla kaydedildi. (Takip No: {trackingCode})</span>
          </TimelineItem>
          <TimelineItem>
            <TimelineBullet>2</TimelineBullet>
            <span>
              <strong>1-2 saat içinde aranacaksınız</strong> — Umut Usta,
              {maskedPhone ? ` ${maskedPhone} numaranızı ` : " verdiğiniz numarayı "}
              arayacak veya WhatsApp&apos;tan yazacak.
            </span>
          </TimelineItem>
          <TimelineItem>
            <TimelineBullet>3</TimelineBullet>
            <span><strong>Randevu onaylanır</strong> — Detaylar netleştikten sonra randevunuz kesinleşir.</span>
          </TimelineItem>
        </TimelineList>
        <PhoneCallout>
          <HiOutlinePhone />
          <span>Doğrudan aramak için: {BUSINESS_TELEPHONE}</span>
        </PhoneCallout>
      </TimelineSection>

      <ButtonGroup>
        <Button
          as="a"
          href={customizedWhatsappUrl}
          target="_blank"
          rel="noreferrer"
          variation="cta"
          size="large"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            background: "var(--color-channel-whatsapp)",
            borderColor: "var(--color-channel-whatsapp)",
            width: "100%",
          }}
        >
          <FaWhatsapp style={{ width: "2rem", height: "2rem" }} />
          WhatsApp ile Hemen Teyit Al
        </Button>
        <Button type="button" variation="secondary" size="large" onClick={onReset}>
          Yeni Randevu Oluştur
        </Button>
      </ButtonGroup>
    </SuccessPanel>
  );
}

BookingSuccess.propTypes = {
  selectedDay: PropTypes.object,
  selectedSlot: PropTypes.object,
  selectedService: PropTypes.string.isRequired,
  customerPhone: PropTypes.string,
  whatsappUrl: PropTypes.string.isRequired,
  bookingId: PropTypes.string,
  onReset: PropTypes.func.isRequired,
};

export default BookingSuccess;
