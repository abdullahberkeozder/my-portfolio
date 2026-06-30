import { useState } from "react";
import PropTypes from "prop-types";
import { HiOutlineChevronDown } from "react-icons/hi2";

import {
  AccordionContainer,
  AccordionItem,
  AccordionHeader,
  AccordionContent,
  AccordionIcon,
  CardTitle,
  CardText,
} from "../../../pages/CustomerBooking.styles";

function FaqAccordion({ items }) {
  const [activeIndex, setActiveIndex] = useState(null);

  function handleToggle(index) {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  }

  return (
    <AccordionContainer>
      {items.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <AccordionItem key={item.question} $isOpen={isOpen}>
            <AccordionHeader
              type="button"
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}>
              <CardTitle style={{ fontSize: "1.5rem", margin: 0 }}>
                {item.question}
              </CardTitle>
              <AccordionIcon $isOpen={isOpen}>
                <HiOutlineChevronDown />
              </AccordionIcon>
            </AccordionHeader>

            <AccordionContent
              id={`faq-answer-${index}`}
              $isOpen={isOpen}
              role="region"
              aria-labelledby={`faq-question-${index}`}>
              <CardText style={{ fontSize: "1.4rem", margin: 0, paddingBottom: "1.4rem" }}>
                {item.answer}
              </CardText>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </AccordionContainer>
  );
}

FaqAccordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default FaqAccordion;
