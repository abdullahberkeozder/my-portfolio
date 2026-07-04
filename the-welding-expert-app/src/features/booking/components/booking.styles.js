import styled, { css } from "styled-components";

export const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  @media (max-width: ${(props) => props.$breakpoint || "640px"}) {
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 4rem;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        ${(props) => props.$bg || "var(--color-grey-50)"} 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  }
`;
export const Panel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 2rem;

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

export const PanelHeader = styled.div`
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 1.6rem;
  align-items: end;

  @media (max-width: 760px) {
    align-items: start;
    flex-direction: column;
  }
`;

export const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

export const AvailabilityNotice = styled.div`
  border: 1px solid
    ${(props) =>
      props.$error ? "var(--color-red-100)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: ${(props) =>
    props.$error ? "var(--color-red-700)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$error ? "var(--color-red-100)" : "var(--color-grey-50)"};
  font-size: 1.3rem;
  font-weight: 700;
`;

export const DateToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.4rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);

  @media (max-width: 640px) {
    align-items: stretch;
  }
`;

export const DatePicker = styled.label`
  display: grid;
  gap: 0.5rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 800;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const DateInput = styled.input`
  width: 100%;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  background: var(--color-grey-0);
  color: var(--color-grey-800);
  font: inherit;
`;

export const WeekControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const IconButton = styled.button`
  width: 4.4rem;
  height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-700);
  background: var(--color-grey-0);

  &:hover {
    border-color: var(--color-brand-600);
    color: var(--color-brand-700);
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

export const WeekLabel = styled.strong`
  color: var(--color-grey-800);
  font-size: 1.4rem;
`;

export const QuickDateRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;

  @media (max-width: 520px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline proximity;
    scrollbar-width: none;
    padding-bottom: 0.2rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const QuickDateButton = styled.button`
  min-height: 3.8rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-selection)" : "var(--color-grey-200)"};
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
  flex: 0 0 auto;
  color: ${(props) =>
    props.$active ? "var(--color-text-inverse)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-action-primary)" : "var(--color-grey-0)"};
  font-size: 1.3rem;
  font-weight: 800;
  box-shadow: ${(props) => (props.$active ? "var(--shadow-sm)" : "none")};
  scroll-snap-align: start;

  &:hover {
    border-color: var(--color-selection);
    background: ${(props) =>
      props.$active
        ? "var(--color-action-primary-hover)"
        : "var(--color-selection-soft)"};
  }
`;

export const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(7, minmax(min(13.6rem, calc(90vw - 3.2rem)), 1fr));
    overflow-x: auto;
    padding: 0.2rem calc((100% - min(13.6rem, calc(90vw - 3.2rem))) / 2) 0.8rem;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: calc((100% - min(13.6rem, calc(90vw - 3.2rem))) / 2);
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const DayButton = styled.button`
  min-height: 13.8rem;
  border: 1px solid
    ${(props) =>
      props.$selected ? "var(--color-selection)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-md);
  padding: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: left;
  background: ${(props) =>
    props.$selected ? "var(--color-grey-0)" : "var(--color-grey-0)"};
  box-shadow: ${(props) =>
    props.$selected
      ? "inset 0 4px 0 var(--color-action-primary), var(--shadow-md)"
      : "none"};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-400);
      background: var(--color-grey-50);
      cursor: not-allowed;
    `}

  &:hover {
    border-color: ${(props) =>
      props.$disabled ? "var(--color-grey-100)" : "var(--color-selection)"};
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.$disabled
        ? "none"
        : props.$selected
          ? "inset 0 4px 0 var(--color-action-primary), var(--shadow-sm)"
          : "var(--shadow-sm)"};
  }

  &:active {
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-1px)")};
  }

  animation: ${(props) => (props.$selected ? "pulseSelected 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "none")};

  @keyframes pulseSelected {
    0% {
      transform: scale(0.96);
      box-shadow: inset 0 4px 0 var(--color-action-primary), 0 0 0 3px rgba(13, 128, 80, 0.2);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (max-width: 980px) {
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  @media (max-width: 640px) {
    min-height: 12rem;
    padding: 1rem;
    gap: 0.5rem;
  }
`;

export const DayName = styled.span`
  color: var(--color-grey-900);
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: capitalize;
`;

export const DayDate = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
`;

export const StatusBadge = styled.span`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 800;

  ${(props) =>
    props.$status === "available" &&
    css`
      color: var(--color-status-available);
      background: var(--color-green-100);
    `}

  ${(props) =>
    props.$status === "limited" &&
    css`
      color: var(--color-yellow-700);
      background: var(--color-yellow-100);
    `}

  ${(props) =>
    props.$status === "closed" &&
    css`
      color: var(--color-grey-600);
      background: var(--color-grey-100);
    `}

  ${(props) =>
    props.$status === "unavailable" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

export const DaySlotCount = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
`;

export const SlotPanel = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 1.4rem;

  @media (max-width: 640px) {
    padding: 1.4rem;
  }
`;

export const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 760px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
  }

  @media (max-width: 380px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SlotButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-selection)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-sm);
  color: ${(props) =>
    props.$active ? "var(--color-text-inverse)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-action-primary)" : "var(--color-grey-0)"};
  box-shadow: ${(props) =>
    props.$active
      ? "inset 0 -3px 0 var(--color-action-primary)"
      : "none"};
  font-size: 1.3rem;
  font-weight: 800;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-selection);
    background: ${(props) =>
      props.$active
        ? "var(--color-surface-dark)"
        : "var(--color-selection-soft)"};
    transform: translateY(-1px);
    box-shadow: ${(props) =>
      props.$active
        ? "inset 0 -3px 0 var(--color-action-primary), var(--shadow-sm)"
        : "var(--shadow-sm)"};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  animation: ${(props) => (props.$active ? "pulseActiveSlot 0.2s cubic-bezier(0.16, 1, 0.3, 1)" : "none")};

  @keyframes pulseActiveSlot {
    0% {
      transform: scale(0.96);
    }
    100% {
      transform: scale(1);
    }
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    text-decoration: line-through;
    cursor: not-allowed;
  }
`;

export const EmptySlots = styled.div`
  min-height: 8.4rem;
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  color: var(--color-grey-500);
  display: grid;
  align-content: center;
  gap: 0.4rem;
  font-size: 1.3rem;
  font-weight: 700;
`;

export const HorizontalSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  margin-top: 1.6rem;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

export const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-brand-200);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

export const SummaryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--color-brand-50);
  color: var(--color-brand-600);
  flex-shrink: 0;

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

export const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

export const SummaryLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-grey-500);
  letter-spacing: 0.05em;
`;

export const SummaryValue = styled.span`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1.3;
`;

export const WizardContainer = styled.div`
  scroll-margin-top: 9rem;
  max-width: 90rem;
  margin: 0 auto;
  width: 100%;
  display: grid;
  gap: 2.4rem;

  &:focus {
    outline: none;
  }
`;

export const WizardProgress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  margin-bottom: 0.8rem;
  gap: 1rem;

  @media (max-width: 480px) {
    padding: 1.2rem 1rem;
    gap: 0.6rem;
  }
`;

export const WizardStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: ${(props) => (props.$active || props.$completed ? "1" : "0.5")};
  transition: opacity 0.3s ease;
`;

export const WizardStepNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.3rem;
  font-weight: 800;
  flex-shrink: 0;
  background: ${(props) =>
    props.$completed
      ? "var(--color-brand-600)"
      : props.$active
        ? "var(--color-action-primary)"
        : "var(--color-grey-200)"};
  color: ${(props) =>
    props.$completed || props.$active ? "var(--color-text-inverse)" : "var(--color-grey-600)"};

  @media (max-width: 480px) {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1.2rem;
  }
`;

export const StepLabel = styled.span`
  font-size: 1.3rem;
  font-weight: ${(props) => (props.$active ? "800" : "600")};
  color: ${(props) => (props.$active ? "var(--color-grey-900)" : "var(--color-grey-600)")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 10rem;

  @media (max-width: 520px) {
    font-size: 1.1rem;
    max-width: 7rem;
  }

  @media (max-width: 400px) {
    display: none;
  }
`;

export const StepDivider = styled.div`
  flex: 1;
  height: 2px;
  background: ${(props) => (props.$completed ? "var(--color-brand-200)" : "var(--color-grey-200)")};
  max-width: 8rem;
  min-width: 1.6rem;

  @media (max-width: 480px) {
    max-width: 3rem;
  }

  @media (max-width: 400px) {
    max-width: 2rem;
    min-width: 1rem;
  }
`;

export const ServiceSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem;
  margin: 1rem 0;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SelectionServiceCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 2rem;
  border: 2px solid
    ${(props) =>
      props.$active ? "var(--color-action-primary)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-md);
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  color: var(--color-grey-800);
  transition: all 0.2s ease;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${(props) => (props.$active ? "var(--color-action-primary)" : "var(--color-grey-300)")};
    background: ${(props) => (props.$active ? "var(--color-brand-50)" : "var(--color-grey-50)")};
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 640px) {
    padding: 1.4rem;
    gap: 1.2rem;
  }
`;

export const SelectionCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "var(--color-brand-600)" : "var(--color-brand-50)")};
  color: ${(props) => (props.$active ? "var(--color-text-inverse)" : "var(--color-brand-600)")};
  flex-shrink: 0;

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  @media (max-width: 640px) {
    width: 4rem;
    height: 4rem;

    & svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

export const SelectionCardTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-grey-900);
`;

export const SelectionCardPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent-500);
`;

export const WizardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  border-top: 1px solid var(--color-grey-100);
  padding-top: 2rem;
  gap: 1.6rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    & > button {
      width: 100%;
    }
  }
`;

export const ConfirmLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.2rem;
  margin-top: 1.6rem;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 2.4rem;
  }
`;

export const FormBlock = styled.div`
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
`;

export const DirectContactBlock = styled.div`
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
`;

export const FieldGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

export const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 700;
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
`;

export const Textarea = styled.textarea`
  min-height: 8.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
`;

export const ChannelGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

export const ChannelLink = styled.a`
  min-height: 4.6rem;
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) =>
    props.$disabled ? "var(--color-grey-500)" : "var(--color-text-inverse)"};
  background: ${(props) =>
    props.$disabled ? "var(--color-grey-200)" : props.$color};
  font-size: 1.4rem;
  font-weight: 800;
  pointer-events: ${(props) => (props.$disabled ? "none" : "auto")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  line-height: 1.3;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    font-size: 1.3rem;
    padding: 1rem 1.2rem;
    gap: 0.6rem;
  }

  @media (max-width: 380px) {
    font-size: 1.2rem;
    min-height: 4.4rem;
  }
`;

export const SelectedLine = styled.div`
  display: grid;
  grid-template-columns: 2.2rem 1fr;
  gap: 1rem;
  align-items: start;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 600;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

export const StepAnimationWrapper = styled.div`
  animation: slideUpWizard 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes slideUpWizard {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ScrollHint = styled.div`
  display: none;
  font-size: 1.1rem;
  color: var(--color-grey-500);
  font-weight: 700;
  text-align: center;
  margin: -0.5rem 0 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 980px) {
    display: block;
  }
`;
