import styled from "styled-components";
import Spinner from "./Spinner";

const FullPage = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 2.4rem;
  background: var(--color-grey-50);
`;

const Status = styled.div`
  width: min(28rem, 82vw);
  display: grid;
  justify-items: center;
  gap: 1.4rem;
  color: var(--color-grey-900);
  text-align: center;
`;

const Label = styled.span`
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
`;

function RouteFallback() {
  return (
    <FullPage>
      <Status role="status" aria-live="polite">
        <Spinner $compact aria-hidden="true" />
        <Label>Sayfa hazırlanıyor</Label>
      </Status>
    </FullPage>
  );
}

export default RouteFallback;
