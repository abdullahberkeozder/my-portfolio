import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styled from "styled-components";

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  grid-template-columns: 26rem minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-areas:
      "header"
      "main";
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Main = styled.main`
  grid-area: main;
  background-color: var(--color-grey-50);
  padding: 4rem 4.8rem 6.4rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;

  @media (max-width: 900px) {
    padding: 3.2rem 2.4rem 5.6rem;
  }

  @media (max-width: 560px) {
    padding: 2.4rem 1.6rem 4rem;
  }
`;

const Container = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
  min-width: 0;
`;

const RouteSurface = styled.div`
  min-width: 0;
  animation: route-enter var(--motion-slow) var(--ease-out) both;
`;

function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsNavigationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isNavigationOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsNavigationOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isNavigationOpen]);

  return (
    <StyledAppLayout>
      <Header
        isNavigationOpen={isNavigationOpen}
        onToggleNavigation={() => setIsNavigationOpen((open) => !open)}
      />
      <Sidebar
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
      />
      <Main>
        <Container>
          <RouteSurface key={location.pathname} data-route-surface>
            <Outlet />
          </RouteSurface>
        </Container>
      </Main>
    </StyledAppLayout>
  );
}

export default AppLayout;
