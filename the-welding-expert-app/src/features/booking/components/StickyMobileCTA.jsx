import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { logEvent } from "../../../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../../../analytics/events";

import {
  StickyCTAContainer,
  StickyCTAButton,
  StickyCTAIconButton,
} from "../../../pages/CustomerBooking.styles";

function StickyMobileCTA({ quickWhatsappUrl, onScrollToCalendar }) {
  return (
    <StickyCTAContainer aria-label="Hızlı işlem seçenekleri">
      <StickyCTAButton
        as="button"
        type="button"
        onClick={() => {
          logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
            channel: "appointment",
            placement: "sticky_mobile",
          });
          onScrollToCalendar();
        }}>
        <HiOutlineCalendarDays aria-hidden="true" />
        Randevu Al
      </StickyCTAButton>

      <StickyCTAIconButton
        href={quickWhatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Fotoğrafla danış"
        title="Fotoğrafla danış"
        onClick={() => {
          logEvent(ANALYTICS_EVENTS.BOOKING_WHATSAPP_CLICKED, { channel: "sticky_mobile" });
          logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
            channel: "whatsapp",
            placement: "sticky_mobile",
          });
        }}
        >
        <FaWhatsapp aria-hidden="true" />
      </StickyCTAIconButton>
    </StickyCTAContainer>
  );
}

StickyMobileCTA.propTypes = {
  quickWhatsappUrl: PropTypes.string.isRequired,
  onScrollToCalendar: PropTypes.func.isRequired,
};

export default StickyMobileCTA;
