import styled from "styled-components";

import appNavItems from "./appNavItems";
import useActiveSection, { getSectionId } from "./useActiveSection";

const Rail = styled.nav`
  position: fixed;
  right: 1.6rem;
  top: 50%;
  z-index: 30;
  transform: translateY(-50%);
  border: 1px solid var(--color-grey-100);
  border-radius: 999px;
  padding: 1.2rem 0.8rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);

  @media (max-width: 1180px) {
    display: none;
  }
`;

const RailList = styled.ul`
  position: relative;
  display: grid;
  gap: 1.2rem;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 1.1rem;
    bottom: 1.1rem;
    width: 0.2rem;
    transform: translateX(-50%);
    border-radius: 999px;
    background: var(--color-grey-200);
  }
`;

const ProgressLine = styled.span`
  position: absolute;
  left: 50%;
  top: 1.1rem;
  width: 0.2rem;
  height: ${(props) => props.$height}%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--color-brand-600);
  transition: height 0.2s ease;
`;

const RailItem = styled.li`
  position: relative;
  z-index: 1;
`;

const RailLink = styled.a`
  width: 3.4rem;
  height: 3.4rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-grey-200)"};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.$active ? "var(--color-grey-0)" : "var(--color-brand-600)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "var(--color-grey-0)"};
  box-shadow: ${(props) => (props.$active ? "var(--shadow-sm)" : "none")};

  &:hover {
    color: var(--color-grey-0);
    background: var(--color-brand-600);
    border-color: var(--color-brand-600);
  }

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }
`;

const Label = styled.span`
  position: absolute;
  right: 4.4rem;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.9rem;
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  background: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  font-size: 1.2rem;
  font-weight: 800;
  white-space: nowrap;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.2s ease;

  ${RailItem}:hover & {
    opacity: 1;
  }
`;

function AppScrollRail() {
  const activeId = useActiveSection(appNavItems);

  const activeIndex = appNavItems.findIndex(
    (item) => getSectionId(item) === activeId,
  );
  const progressHeight =
    appNavItems.length <= 1
      ? 0
      : (Math.max(activeIndex, 0) / (appNavItems.length - 1)) * 100;

  return (
    <Rail aria-label="Sayfa konumu">
      <RailList>
        <ProgressLine $height={progressHeight} />
        {appNavItems.map((item) => {
          const sectionId = getSectionId(item);
          const isActive = sectionId === activeId;

          return (
            <RailItem key={item.href}>
              <RailLink
                href={item.href}
                $active={isActive}
                aria-current={isActive ? "location" : undefined}>
                <item.Icon />
              </RailLink>
              <Label $active={isActive}>{item.label}</Label>
            </RailItem>
          );
        })}
      </RailList>
    </Rail>
  );
}

export default AppScrollRail;
