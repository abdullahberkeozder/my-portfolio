import { useState, useRef } from "react";
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
  FaqMoreButton,
} from "../../../pages/CustomerBooking.styles";

function FaqItem({ item, index, isOpen, onToggle }) {
  const contentRef = useRef(null);

  return (
    <AccordionItem $isOpen={isOpen}>
      <AccordionHeader
        id={`faq-question-${index}`}
        type="button"
        onClick={onToggle}
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
        aria-labelledby={`faq-question-${index}`}
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}>
        <CardText style={{ fontSize: "1.4rem", margin: 0, paddingBottom: "1.4rem" }}>
          {item.answer}
        </CardText>
      </AccordionContent>
    </AccordionItem>
  );
}

FaqItem.propTypes = {
  item: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function FaqAccordion({ items, initialVisibleCount = items.length }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, initialVisibleCount);
  const hiddenCount = Math.max(items.length - initialVisibleCount, 0);

  function handleToggle(index) {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  }

  return (
    <AccordionContainer>
      {visibleItems.map((item, index) => (
        <FaqItem
          key={item.question}
          item={item}
          index={index}
          isOpen={activeIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
      {hiddenCount > 0 && (
        <FaqMoreButton
          type="button"
          $expanded={showAll}
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}>
          {showAll ? "Daha az soru göster" : `${hiddenCount} soru daha göster`}
          <HiOutlineChevronDown aria-hidden="true" />
        </FaqMoreButton>
      )}
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
  initialVisibleCount: PropTypes.number,
};

export default FaqAccordion;

