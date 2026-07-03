import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { logEvent } from "../../../services/apiAnalytics";

import {
  StickyCTAContainer,
  StickyCTAButton,
} from "../../../pages/CustomerBooking.styles";

function StickyMobileCTA({ quickWhatsappUrl, onScrollToCalendar }) {
  return (
    <StickyCTAContainer>
      <StickyCTAButton
        href={quickWhatsappUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => logEvent("booking_whatsapp_clicked", { channel: "sticky_mobile" })}
        $whatsapp>
        <FaWhatsapp />
        Soru Sor
      </StickyCTAButton>
      <StickyCTAButton
        as="button"
        type="button"
        onClick={onScrollToCalendar}>
        <HiOutlineCalendarDays />
        Randevu Al
      </StickyCTAButton>
    </StickyCTAContainer>
  );
}

StickyMobileCTA.propTypes = {
  quickWhatsappUrl: PropTypes.string.isRequired,
  onScrollToCalendar: PropTypes.func.isRequired,
};

export default StickyMobileCTA;
