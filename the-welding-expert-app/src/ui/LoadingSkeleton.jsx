import styled, { keyframes } from "styled-components";

const skeletonEnter = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const SkeletonBlock = styled.div`
  width: ${(props) => props.$width || "100%"};
  height: ${(props) => props.$height || "1.6rem"};
  border-radius: ${(props) => props.$radius || "var(--border-radius-tiny)"};
  background: var(--color-grey-100);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-grey-200) 58%, transparent);
  animation: ${skeletonEnter} var(--motion-base) var(--ease-out) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Status = styled.div`
  display: grid;
  gap: 2rem;
  width: 100%;
`;

const Header = styled.div`
  display: grid;
  gap: 1rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns || 3}, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  min-height: ${(props) => props.$height || "18rem"};
  padding: 1.6rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  display: grid;
  align-content: start;
  gap: 1.2rem;
`;

function ContentSkeleton({ label = "İçerik yükleniyor", columns = 3 }) {
  return (
    <Status role="status" aria-label={label} aria-live="polite">
      <Header>
        <SkeletonBlock $width="16rem" $height="1.2rem" />
        <SkeletonBlock $width="min(42rem, 82%)" $height="3rem" />
        <SkeletonBlock $width="min(56rem, 94%)" />
      </Header>
      <CardGrid $columns={columns}>
        {Array.from({ length: columns }, (_, index) => (
          <Card key={index}>
            <SkeletonBlock $height="8rem" $radius="var(--border-radius-sm)" />
            <SkeletonBlock $width="70%" $height="1.8rem" />
            <SkeletonBlock $width="92%" />
            <SkeletonBlock $width="58%" />
          </Card>
        ))}
      </CardGrid>
    </Status>
  );
}

export default ContentSkeleton;
