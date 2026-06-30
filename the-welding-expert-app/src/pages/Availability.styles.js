import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

export const Page = styled.div`
  display: grid;
  gap: 2.4rem;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const HeaderCopy = styled.div`
  display: grid;
  gap: 0.6rem;
`;

export const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

export const PublicLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  font-size: 1.4rem;
  font-weight: 800;

  & svg {
    width: 1.9rem;
    height: 1.9rem;
  }
`;

export const InfoPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 0.8rem;
`;

export const CalendarPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

export const CalendarToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;

  @media (max-width: 760px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const WeekTitle = styled.div`
  display: grid;
  gap: 0.2rem;
`;

export const WeekRange = styled.p`
  color: var(--color-grey-900);
  font-size: 1.8rem;
  font-weight: 800;
`;

export const ToolbarActions = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

export const ToolbarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }
`;

export const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(12.8rem, 1fr));
  gap: 1rem;

  @media (max-width: 1180px) {
    overflow-x: auto;
    padding-bottom: 0.6rem;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    overflow-x: visible;
  }
`;

export const DayCard = styled.article`
  border: 1px solid
    ${(props) =>
      props.$closed ? "var(--color-red-100)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-md);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
  align-content: start;
  background: ${(props) =>
    props.$closed ? "var(--color-status-danger-bg)" : "var(--color-grey-0)"};
`;

export const DayTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
`;

export const DayTitleCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.2rem;
`;

export const DayName = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.35rem;
  font-weight: 800;
  text-transform: capitalize;
`;

export const DayDate = styled.p`
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
`;

export const StatusBadge = styled.span`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  color: var(--color-green-700);
  background: var(--color-green-100);
  font-size: 1rem;
  font-weight: 800;
  white-space: nowrap;

  & svg {
    width: 1.3rem;
    height: 1.3rem;
  }

  ${(props) =>
    props.$tone === "amber" &&
    css`
      color: var(--color-status-warning-text);
      background: var(--color-status-warning-bg);
    `}

  ${(props) =>
    props.$tone === "red" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}
`;

export const Select = styled.select`
  width: 100%;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.7rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.2rem;
  font-weight: 800;
`;

export const NoteArea = styled.textarea`
  width: 100%;
  min-height: 5.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.2rem;
  line-height: 1.5;
`;

export const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const SmallButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.55rem 0.65rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;

  ${(props) =>
    props.$danger &&
    css`
      color: var(--color-red-700);
      border-color: var(--color-red-100);
      background: var(--color-status-danger-bg);
    `}

  ${(props) =>
    props.$success &&
    css`
      color: var(--color-green-700);
      border-color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

export const SlotList = styled.div`
  display: grid;
  gap: 0.5rem;
`;

export const SlotRow = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 0.5rem;
`;

export const SlotSelect = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$selected ? "var(--color-surface-dark)" : "var(--color-grey-200)"};
  color: ${(props) =>
    props.$selected ? "var(--color-grey-0)" : "var(--color-grey-500)"};
  background: ${(props) =>
    props.$selected ? "var(--color-surface-dark)" : "var(--color-grey-0)"};
  box-shadow: ${(props) =>
    props.$selected
      ? "inset 0 -3px 0 var(--color-action-primary)"
      : "none"};
  font-size: 1.1rem;
  font-weight: 900;
  cursor: pointer;
`;

export const SlotToggle = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$available ? "var(--color-green-700)" : "var(--color-grey-300)"};
  padding: 0.55rem 0.65rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  color: ${(props) =>
    props.$available ? "var(--color-green-700)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$available ? "var(--color-green-100)" : "var(--color-grey-100)"};
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;

  ${(props) =>
    !props.$available &&
    css`
      text-decoration: line-through;
    `}

  & svg {
    width: 1.45rem;
    height: 1.45rem;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

export const DaySummary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
`;

export const AdvancedControls = styled.details`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-50);

  & summary {
    min-height: 4.4rem;
    padding: 0.7rem 0.8rem;
    color: var(--color-grey-700);
    font-size: 1.15rem;
    font-weight: 800;
    cursor: pointer;
  }
`;

export const AdvancedBody = styled.div`
  display: grid;
  gap: 0.8rem;
  padding: 0 0.8rem 0.8rem;
`;

export const EmptyState = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 0.8rem;
  color: var(--color-grey-500);
  background: var(--color-grey-50);
`;
