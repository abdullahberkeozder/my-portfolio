import styled from "styled-components";

import Spinner from "./Spinner";

const FullPage = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--color-grey-50);
`;

function RouteFallback() {
  return (
    <FullPage role="status" aria-label="Sayfa yükleniyor">
      <Spinner />
    </FullPage>
  );
}

export default RouteFallback;
