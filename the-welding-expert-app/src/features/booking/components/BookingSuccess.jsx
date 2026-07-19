import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  HiOutlineCalendarDays,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineClipboard,
  HiOutlinePhone,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import styled from "styled-components";

import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { BUSINESS_WHATSAPP_NUMBER } from "../../../config/business";
import { logEvent } from "../../../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../../../analytics/events";
import { getResponseExpectation } from "../../../utils/businessHours";

const SuccessPanel = styled.section`
  display: grid;
  justify-items: center;
  gap: 1.6rem;
  padding: 1.6rem 0 0;
  text-align: center;
  animation: success-enter var(--motion-base) var(--ease-out) both;

  @keyframes success-enter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SuccessIcon = styled.div`
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius-component);
  display: grid;
  place-items: center;
  color: var(--color-status-success-text);
  background: var(--color-status-success-bg);

  & svg {
    width: 2.8rem;
    height: 2.8rem;
  }
`;

const SuccessLead = styled.p`
  max-width: 48rem;
  color: var(--color-text-body);
  font-size: 1.5rem;
  line-height: 1.6;
`;

const RequestStatus = styled.p`
  min-height: 3.2rem;
  border: 1px solid var(--color-yellow-100);
  border-radius: var(--radius-control);
  padding: 0.6rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-status-warning-text);
  background: var(--color-status-warning-bg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);

  &::before {
    content: "";
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    background: currentColor;
  }
`;

const SuccessDetails = styled.dl`
  width: 100%;
  max-width: 54rem;
  border-block: 1px solid var(--color-border-subtle);
  display: grid;
  text-align: left;
`;

const DetailItem = styled.div`
  min-width: 0;
  padding: 1rem 0;
  display: grid;
  grid-template-columns: 2rem minmax(9rem, 0.7fr) minmax(0, 1.3fr);
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);

  &:last-child {
    border-bottom: 0;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-700);
  }

  @media (max-width: 480px) {
    grid-template-columns: 2rem minmax(0, 1fr);

    dd {
      grid-column: 2;
    }
  }
`;

const DetailLabel = styled.dt`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
`;

const DetailValue = styled.dd`
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  overflow-wrap: anywhere;
`;

const TrackingValue = styled(DetailValue)`
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  color: var(--color-selection-strong);
  font-size: 1.5rem;
`;

const NextStep = styled.div`
  width: 100%;
  max-width: 54rem;
  border-left: 3px solid var(--color-brand-600);
  padding: 1.2rem 1.4rem;
  display: grid;
  gap: 0.4rem;
  color: var(--color-text-body);
  background: var(--color-surface-subtle);
  text-align: left;
  font-size: var(--font-size-xs);

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }
`;

const ButtonGroup = styled.div`
  width: 100%;
  max-width: 40rem;
  margin-top: 0.4rem;
  display: grid;
  gap: 0.8rem;
`;

function maskPhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 7) return phone;
  return `${clean.slice(0, 2)}** *** ${clean.slice(-4)}`;
}

function BookingSuccess({
  selectedDay,
  selectedSlot,
  selectedService,
  customerPhone,
  bookingId,
  publicToken,
  onReset,
}) {
  const panelRef = useRef(null);
  const maskedPhone = maskPhone(customerPhone);
  const responseExpectation = getResponseExpectation();

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const trackingCode = bookingId
    ? `UU-${bookingId.slice(0, 8).toUpperCase()}`
    : "UU-YENI";

  const messageText = `Merhaba Umut Usta, web sitenizden randevu talebi oluşturdum:

Takip Kodu: ${trackingCode}
Hizmet: ${selectedService}
Tarih: ${selectedDay ? selectedDay.fullDate : "-"}
Saat: ${selectedSlot?.label || "-"}
Telefon: ${customerPhone || ""}

Talebime fotoğraf veya ek bilgi iletmek istiyorum. Teşekkürler.`;

  const customizedWhatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

  return (
    <SuccessPanel ref={panelRef} tabIndex="-1" aria-labelledby="booking-success-title">
      <SuccessIcon aria-hidden="true"><HiOutlineCheck /></SuccessIcon>
      <Heading id="booking-success-title" as="h2">Talebiniz alındı</Heading>
      <SuccessLead>Hizmet ve zaman tercihiniz ekibe iletildi.</SuccessLead>
      <RequestStatus>Uygunluk teyidi bekleniyor</RequestStatus>

      <SuccessDetails aria-label="Talep özeti">
        <DetailItem>
          <HiOutlineClipboard aria-hidden="true" />
          <DetailLabel>Takip kodu</DetailLabel>
          <TrackingValue>{trackingCode}</TrackingValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineWrenchScrewdriver aria-hidden="true" />
          <DetailLabel>Hizmet</DetailLabel>
          <DetailValue>{selectedService}</DetailValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineCalendarDays aria-hidden="true" />
          <DetailLabel>Tarih</DetailLabel>
          <DetailValue>{selectedDay ? selectedDay.fullDate : "-"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <HiOutlineClock aria-hidden="true" />
          <DetailLabel>Saat</DetailLabel>
          <DetailValue>{selectedSlot?.label || "-"}</DetailValue>
        </DetailItem>
        {maskedPhone && (
          <DetailItem>
            <HiOutlinePhone aria-hidden="true" />
            <DetailLabel>Telefon</DetailLabel>
            <DetailValue>{maskedPhone}</DetailValue>
          </DetailItem>
        )}
      </SuccessDetails>

      <NextStep>
        <strong>{responseExpectation.title}</strong>
        <span>{responseExpectation.message} Sizi arayacağız veya WhatsApp&apos;tan yazacağız.</span>
      </NextStep>

      <ButtonGroup>
        {publicToken && (
          <Button as="a" href={`/appointment/track/${publicToken}`} variation="cta" size="large">
            Talebi Takip Et
          </Button>
        )}
        <Button
          as="a"
          href={customizedWhatsappUrl}
          target="_blank"
          rel="noreferrer"
          variation={publicToken ? "secondary" : "cta"}
          size="large"
          onClick={() => logEvent(ANALYTICS_EVENTS.BOOKING_SUCCESS_WHATSAPP_CLICKED, {
            service_type: selectedService,
          })}>
          <FaWhatsapp aria-hidden="true" />
          Fotoğraf veya Detay Ekle
        </Button>
        <Button type="button" variation="ghost" size="large" onClick={onReset}>
          Yeni Talep Oluştur
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
  bookingId: PropTypes.string,
  publicToken: PropTypes.string,
  onReset: PropTypes.func.isRequired,
};

export default BookingSuccess;
