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
        transparent 0%,
        ${(props) => props.$bg || "var(--color-grey-50)"} 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  }
`;
export const Panel = styled.section`
  min-width: 0;
  background: transparent;
  border: 0;
  padding: 0;
  display: grid;
  gap: ${(props) => props.$compact ? "1.4rem" : "var(--wizard-section-gap, 1.6rem)"};

  @media (max-width: 640px) {
    gap: ${(props) => props.$compact ? "1.2rem" : "1.6rem"};
  }
`;

export const PanelHeader = styled.div`
  width: 100%;
  max-width: ${(props) => props.$constrained ? "84rem" : "none"};
  margin-inline: ${(props) => props.$constrained ? "auto" : "0"};
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 1.6rem;
  align-items: end;

  & h2 {
    font-size: ${(props) => props.$constrained ? "2.2rem" : "inherit"};
    line-height: 1.25;
  }

  & [tabindex="-1"]:focus {
    outline: none;
  }

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
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding: 0;
  border: 0;
  background: transparent;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const WeekControls = styled.div`
  width: auto;
  display: grid;
  grid-template-columns: 4.4rem auto 4.4rem;
  align-items: center;
  justify-content: end;
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

export const CalendarPanel = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 1.6rem;
  padding: 2rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-component);
  background: var(--color-surface-raised);

  @media (max-width: 720px) {
    padding: 1.6rem;
  }

  @media (max-width: 420px) {
    padding: 1.4rem;
  }
`;

export const ScheduleBoard = styled.div`
  width: 100%;
  max-width: 84rem;
  min-width: 0;
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.6rem;
`;

export const ScheduleKicker = styled.span`
  display: block;
  margin-bottom: 0.3rem;
  color: var(--color-brand-700);
  font-size: 1.1rem;
  font-weight: 800;
`;

export const ScheduleTitle = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.5rem;
  line-height: 1.3;
`;

export const ScheduleSectionHeader = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.3rem;

  & h3 {
    font-size: 1.8rem;
    line-height: 1.35;
  }
`;

export const ScheduleEmptyIcon = styled.span`
  width: 4.4rem;
  height: 4.4rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-control);
  color: var(--color-brand-700);
  background: var(--color-selection-soft);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

export const ScheduleSlotContent = styled.div`
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 1.2rem;
  animation: slideUpSchedule var(--motion-base) var(--ease-out) both;

  @keyframes slideUpSchedule {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SelectionNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--color-grey-600);
  font-size: 1.2rem;
  font-weight: 700;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
    flex: 0 0 auto;
    color: var(--color-brand-700);
  }
`;

export const SelectedServiceBar = styled.div`
  width: 100%;
  max-width: 84rem;
  min-width: 0;
  margin-inline: auto;
  border: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.6rem;
  color: var(--color-grey-600);
  font-size: 1.3rem;
  font-weight: 700;

  & > div {
    min-width: 0;
    display: grid;
    gap: 0.2rem;
  }

  & span {
    color: var(--color-grey-500);
    font-size: 1.1rem;
  }

  & strong {
    min-width: 0;
    color: var(--color-grey-900);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  & button {
    min-height: 4.4rem;
    border: 1px solid var(--color-brand-300);
    border-radius: var(--radius-control);
    padding: 0.8rem 1.2rem;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-brand-700);
    background: var(--color-selection-soft);
    font-weight: 800;
    transition:
      border-color var(--motion-fast),
      background-color var(--motion-fast),
      color var(--motion-fast);
  }

  & button:hover {
    border-color: var(--color-selection);
    color: var(--color-selection-strong);
    background: var(--color-brand-100);
  }

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;

    & button {
      justify-self: start;
    }
  }
`;

export const TimeColumnLabel = styled.span`
  color: var(--color-grey-600);
  font-size: 1.2rem;
  font-weight: 800;
`;

export const TimeEmptyState = styled.div`
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  text-align: center;

  & h3 {
    font-size: 1.7rem;
  }

  & p {
    max-width: 28rem;
    margin-top: 0.3rem;
    color: var(--color-grey-500);
    font-size: 1.3rem;
    line-height: 1.45;
  }

  @media (max-width: 720px) {
    min-height: 8rem;
    padding: 1rem;
  }
`;

export const WeekGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 860px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }
`;

export const DayButton = styled.button`
  min-width: 0;
  min-height: 11.2rem;
  border: 1px solid
    ${(props) =>
      props.$selected ? "var(--color-selection)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  text-align: left;
  background: ${(props) =>
    props.$selected ? "var(--color-selection-soft)" : "var(--color-surface-raised)"};
  box-shadow: ${(props) =>
    props.$selected ? "inset 0 3px 0 var(--color-selection)" : "none"};
  transition: border-color var(--motion-fast), background var(--motion-fast);

  &:hover:not(:disabled) {
    border-color: var(--color-selection);
    background: var(--color-selection-soft);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--color-surface-subtle);
  }

  &:disabled:hover {
    border-color: var(--color-grey-100);
  }

  @media (max-width: 640px) {
    min-height: 10.4rem;
    padding: 1rem;
  }
`;

export const DayName = styled.span`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: capitalize;
`;

export const DayDate = styled.span`
  display: block;
  margin-top: 0.2rem;
  color: var(--color-grey-700);
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
  padding: 0.35rem 0.7rem;
  font-size: 1.1rem;
  font-weight: 800;

  &::before {
    content: "";
    width: 0.7rem;
    height: 0.7rem;
    flex: 0 0 auto;
    border-radius: 50%;
    background: currentColor;
  }

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
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-grey-700);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;

  & svg {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-selection);
  }
`;

export const SlotPanel = styled.div`
  width: 100%;
  min-width: 0;
  padding: 2rem;
  display: grid;
  align-content: start;
  gap: 1.2rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-component);
  background: var(--color-surface-raised);

  @media (max-width: 720px) {
    padding: 1.6rem;
  }

  @media (max-width: 420px) {
    padding: 1.4rem;
  }
`;

export const SlotContent = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.8rem;
`;

export const SlotGrid = styled.div`
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }
`;

export const SlotButton = styled.button`
  min-height: 4.8rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: border-color var(--motion-fast), background var(--motion-fast);

  &:hover:not(:disabled) {
    border-color: var(--color-selection);
    background: ${(props) =>
      props.$active
        ? "var(--color-surface-dark)"
        : "var(--color-selection-soft)"};
    box-shadow: none;
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    text-decoration: line-through;
    cursor: not-allowed;
  }
`;

export const EmptyWeekNotice = styled.div`
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-component);
  padding: 1.6rem;
  display: grid;
  gap: 1.2rem;
  background: var(--color-surface-subtle);

  & > div:first-child {
    display: grid;
    grid-template-columns: 2.2rem minmax(0, 1fr);
    gap: 1rem;
  }

  & > div:first-child > svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-700);
  }

  h3 {
    font-size: 1.5rem;
  }
`;

export const EmptyWeekActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;

  & a {
    min-height: 4.4rem;
    padding: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--color-text-body);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  & a svg {
    color: var(--color-channel-whatsapp);
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

export const ContactLayout = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--wizard-section-gap, 1.6rem);
  align-items: start;
`;

export const ContactSummaryPanel = styled.aside`
  width: 100%;
  max-width: 84rem;
  min-width: 0;
  margin-inline: auto;
  display: grid;
  gap: 0.8rem;
`;

export const ContactSummaryTitle = styled.span`
  color: var(--color-grey-600);
  font-size: 1.2rem;
  font-weight: 800;
`;

export const HorizontalSummary = styled.div`
  width: 100%;
  max-width: 84rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0;
  background: var(--color-surface-subtle);
  border-block: 1px solid var(--color-border-subtle);
  padding: 1rem 0;
  margin-top: 0.4rem;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0;
  }
`;

export const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 1.2rem;
  border-right: 1px solid var(--color-border-subtle);

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 768px) {
    grid-column: 1;
    border-right: 0;

    &:not(:nth-child(3)) {
      border-bottom: 1px solid var(--color-border-subtle);
    }
  }
`;

export const SummaryEditButton = styled.button`
  min-width: 4.8rem;
  min-height: 4.4rem;
  align-self: center;
  border: 0;
  border-left: 1px solid var(--color-border-subtle);
  padding: 0.8rem 1.2rem;
  color: var(--color-brand-700);
  background: transparent;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);

  &:hover {
    color: var(--color-selection-strong);
    background: var(--color-selection-soft);
  }

  @media (max-width: 768px) {
    grid-column: 2;
    grid-row: 1 / span 3;
    height: 100%;
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
  color: var(--color-grey-500);
  letter-spacing: 0;
`;

export const SummaryValue = styled.span`
  min-width: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const WizardContainer = styled.div`
  --wizard-section-gap: 1.6rem;
  --wizard-control-gap: 1rem;
  scroll-margin-top: 9rem;
  max-width: 118rem;
  margin: 0 auto;
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 86%, transparent);
  border-radius: var(--radius-component);
  padding: clamp(2.4rem, 2.2vw, 3.2rem);
  background: var(--color-surface-raised);
  display: grid;
  gap: var(--wizard-section-gap);
  box-shadow: 0 1.8rem 4.8rem color-mix(in srgb, var(--color-grey-900) 6%, transparent);

  &:focus {
    outline: none;
  }

  @media (max-width: 640px) {
    --wizard-section-gap: 1.4rem;
    --wizard-control-gap: 0.8rem;
    width: calc(100% + 3.2rem);
    margin-inline: -1.6rem;
    padding: 1.8rem 1.6rem 2rem;
    border-inline: 0;
    border-radius: 0;
    gap: var(--wizard-section-gap);
    box-shadow: none;
  }

  @media (max-width: 380px) {
    width: calc(100% + 2.4rem);
    margin-inline: -1.2rem;
    padding-inline: 1.6rem;
  }
`;

export const WizardProgress = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 0 0 1.2rem;
  margin-bottom: 0;
  gap: 0;

  &::before {
    content: "";
    position: absolute;
    top: 1.4rem;
    left: 16.666%;
    right: 16.666%;
    height: 1px;
    background: var(--color-border-subtle);
  }

  @media (max-width: 480px) {
    padding: 0 0 1rem;
  }
`;

export const WizardStatus = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const WizardStep = styled.div`
  position: relative;
  min-width: 0;
  display: grid;
  justify-items: center;
  list-style: none;
  z-index: 1;
`;

export const WizardStepButton = styled.button`
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-rows: 2.8rem auto;
  justify-items: center;
  align-content: start;
  gap: 0.5rem;
  opacity: 1;
  min-height: 5rem;
  min-width: 0;
  border: 0;
  border-radius: var(--radius-control);
  padding: 0 0.6rem 0.2rem;
  color: inherit;
  background: transparent;
  text-align: center;
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    opacity var(--motion-fast) var(--ease-standard);

  &:hover:not(:disabled) {
    background: var(--color-selection-soft);
  }

  &:hover:not(:disabled) > span:first-child {
    box-shadow: 0 0 0 3px var(--color-selection-soft);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &[aria-current="step"] {
    cursor: default;
  }

  @media (max-width: 480px) {
    grid-template-rows: 2.6rem auto;
    min-height: 4.8rem;
    padding-inline: 0.3rem;
  }
`;

export const WizardStepNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--radius-control);
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
  transition:
    color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard);

  @media (max-width: 480px) {
    width: 2.6rem;
    height: 2.6rem;
    font-size: 1.2rem;
  }
`;

export const StepLabel = styled.span`
  font-size: 1.3rem;
  font-weight: ${(props) => (props.$active ? "800" : "600")};
  color: ${(props) => (props.$active ? "var(--color-grey-900)" : "var(--color-grey-700)")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition:
    color var(--motion-base) var(--ease-standard),
    font-weight var(--motion-base) var(--ease-standard);

  @media (max-width: 520px) {
    font-size: 1.1rem;
    max-width: 8.4rem;
    white-space: normal;
    line-height: 1.2;
  }
`;

export const ServiceSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--wizard-control-gap, 1rem);
  margin: 0;

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
  transition:
    border-color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
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
  width: 100%;
  display: grid;
  align-items: stretch;
  margin-top: ${(props) => props.$compact ? "0.2rem" : "2rem"};
  border-top: 1px solid var(--color-grey-100);
  padding-top: ${(props) => props.$compact ? "1.2rem" : "2rem"};
  gap: var(--wizard-control-gap, 1rem);

  & > button {
    width: 100%;
  }
`;

export const ActionHint = styled.span`
  display: block;
  color: var(--color-status-warning-text);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-align: left;
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
  width: 100%;
  min-width: 0;
  max-width: 84rem;
  margin-inline: auto;
  display: grid;
  gap: 1.4rem;
  background: transparent;
  border: 0;
  padding: 0;

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
  min-height: 4.6rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
  color: var(--color-grey-900);
  font: inherit;
  font-size: 1.6rem;

  &[aria-invalid="true"] {
    border-color: var(--color-red-700);
  }
`;

export const Textarea = styled.textarea`
  min-height: 8.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
  color: var(--color-grey-900);
  font: inherit;
  font-size: 1.6rem;

  &[aria-invalid="true"] {
    border-color: var(--color-red-700);
  }
`;

export const FieldError = styled.span`
  color: var(--color-red-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
`;

export const ErrorSummary = styled.div`
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  display: grid;
  gap: 0.5rem;
  color: var(--color-red-800);
  background: var(--color-red-100);
  font-size: var(--font-size-sm);

  & strong {
    color: inherit;
  }

  & a {
    color: inherit;
    text-decoration: underline;
  }
`;

export const PrivacyRow = styled.label`
  min-height: 4.4rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  color: var(--color-grey-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);

  & input {
    width: 1.8rem;
    height: 1.8rem;
    margin-top: 0.1rem;
    accent-color: var(--color-selection);
  }
`;

export const SavedDetailsNotice = styled.div`
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-grey-600);
  background: var(--color-grey-0);
  font-size: var(--font-size-xs);

  & button {
    min-height: 4.4rem;
    border: 0;
    padding: 0.8rem;
    color: var(--color-brand-700);
    background: transparent;
    font-weight: var(--font-weight-bold);
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
  min-width: 0;
  animation: slideUpWizard var(--motion-base) var(--ease-out) both;

  @keyframes slideUpWizard {
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

export const SlotLoadingState = styled.div`
  min-height: 9.4rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 1.6rem;
  display: grid;
  align-content: center;
  gap: 1rem;
  background: var(--color-grey-0);
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
