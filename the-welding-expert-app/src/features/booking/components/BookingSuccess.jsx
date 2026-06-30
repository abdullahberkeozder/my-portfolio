import PropTypes from "prop-types";
import { HiOutlineCheckCircle, HiOutlineCalendarDays, HiOutlineClock, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import styled from "styled-components";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";

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
  margin: 2.8rem 0;
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  max-width: 36rem;
  margin-top: 1rem;
`;

function BookingSuccess({
  selectedDay,
  selectedSlot,
  selectedService,
  whatsappUrl,
  onReset,
}) {
  return (
    <SuccessPanel>
      <SuccessIconWrapper>
        <HiOutlineCheckCircle />
      </SuccessIconWrapper>
      <Heading as="h1" style={{ fontSize: "2.4rem", fontWeight: 800 }}>
        Randevu Talebiniz Alındı!
      </Heading>
      <SuccessSubtitle>
        Umut Usta en kısa sürede (genellikle 1-2 saat içinde) verdiğiniz telefon numarası üzerinden sizinle WhatsApp veya arama yoluyla iletişime geçecektir.
      </SuccessSubtitle>

      <SuccessDetails>
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
      </SuccessDetails>

      <ButtonGroup>
        <Button
          as="a"
          href={whatsappUrl}
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
          WhatsApp ile Hemen Bildir (Teyit Al)
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
  whatsappUrl: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default BookingSuccess;
