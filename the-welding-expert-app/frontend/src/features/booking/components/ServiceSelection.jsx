import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineHomeModern,
  HiOutlineKey,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import styled from "styled-components";

import { ANALYTICS_EVENTS } from "../../../analytics/events";
import {
  getServiceGroupByKey,
  getServiceGroupKey,
  isDiscoveryService,
  SERVICE_GROUPS,
} from "../../../config/serviceTaxonomy";
import { logEvent } from "../../../services/apiAnalytics";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { Panel, PanelHeader, MutedText } from "./booking.styles";

const SERVICE_GROUP_ICONS = {
  finish: HiOutlineHomeModern,
  metal: HiOutlineWrenchScrewdriver,
  access: HiOutlineKey,
  outdoor: HiOutlineSparkles,
};

const UNSURE_SERVICE = {
  title: "Yerinde keşif ve teklif",
  serviceType: "Yerinde keşif ve teklif",
  problem: "İşin türünü veya kapsamını birlikte belirleyelim",
  priceTagline: "Ön inceleme sonrası kapsam netleşir",
};

function getServiceValue(service) {
  return service.service_key || service.serviceType || service.title;
}

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$single ? "minmax(0, 56rem)" : "repeat(2, minmax(0, 1fr))"};
  justify-content: center;
  gap: var(--wizard-control-gap, 1rem);

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const UnsureAction = styled.button`
  min-height: 4.8rem;
  width: 100%;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-control);
  padding: 1rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-text-body);
  background: var(--color-surface-subtle);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);

  &:hover {
    border-color: var(--color-selection);
    color: var(--color-selection-strong);
  }

  & span {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    flex-shrink: 0;
  }
`;

const GroupOption = styled.button`
  min-height: 9.6rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-component);
  padding: 1.6rem;
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr) 2rem;
  align-items: center;
  gap: 1.2rem;
  color: var(--color-grey-800);
  background: var(--color-surface-raised);
  text-align: left;

  &:hover {
    border-color: var(--color-selection);
    background: var(--color-selection-soft);
  }

  & svg:last-child {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
  }

  @media (max-width: 640px) {
    min-height: 9.2rem;
    padding: 1.2rem;
  }
`;

const GroupBackButton = styled.button`
  min-height: 4.4rem;
  width: fit-content;
  border: 0;
  padding: 0.4rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--color-brand-700);
  background: transparent;
  font-weight: var(--font-weight-semibold);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const ServiceOption = styled.button`
  min-height: 8.8rem;
  border: 1px solid
    ${(props) => props.$active ? "var(--color-selection)" : "var(--color-grey-200)"};
  border-radius: var(--radius-component);
  padding: 1.2rem;
  display: grid;
  grid-template-columns: 3.8rem minmax(0, 1fr) 2rem;
  align-items: center;
  gap: 1rem;
  color: var(--color-grey-800);
  background: ${(props) => props.$active ? "var(--color-selection-soft)" : "var(--color-surface-raised)"};
  text-align: left;

  &:hover {
    border-color: var(--color-selection);
    background: var(--color-selection-soft);
  }

  @media (max-width: 420px) {
    grid-template-columns: 3.6rem minmax(0, 1fr) 1.8rem;
    padding: 1rem;
  }
`;

const ServiceIcon = styled.span`
  width: 3.8rem;
  height: 3.8rem;
  border-radius: var(--border-radius-sm);
  display: grid;
  place-items: center;
  color: ${(props) => props.$active ? "var(--color-text-inverse)" : "var(--color-brand-700)"};
  background: ${(props) => props.$active ? "var(--color-selection)" : "var(--color-brand-50)"};

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const ServiceCopy = styled.span`
  min-width: 0;
  display: grid;
  gap: 0.35rem;
`;

const ServiceTitle = styled.strong`
  color: var(--color-grey-900);
  font-size: var(--font-size-sm);
  line-height: 1.3;
`;

const ServiceProblem = styled.span`
  color: var(--color-grey-600);
  font-size: var(--font-size-xs);
  line-height: 1.35;
`;

const Check = styled(HiOutlineCheckCircle)`
  width: 2rem;
  height: 2rem;
  color: var(--color-selection);
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--wizard-control-gap, 1rem);
  padding-top: var(--wizard-section-gap, 1.6rem);
  border-top: 1px solid var(--color-grey-100);

  @media (max-width: 520px) {
    align-items: stretch;
    flex-direction: column;

    & button {
      width: 100%;
    }
  }
`;

function ServiceSelection({ services, selectedService, onServiceSelect, onStepChange }) {
  const normalizedServices = useMemo(() => {
    const hasUnsureService = services.some(isDiscoveryService);
    return hasUnsureService ? services : [...services, UNSURE_SERVICE];
  }, [services]);
  const [activeGroup, setActiveGroup] = useState(null);
  const selected = normalizedServices.find(
    (service) => selectedService === getServiceValue(service),
  );
  const visibleServices = useMemo(
    () => normalizedServices.filter((service) => (
      activeGroup === "unsure"
        ? isDiscoveryService(service)
        : !isDiscoveryService(service) && getServiceGroupKey(service) === activeGroup
    )),
    [activeGroup, normalizedServices],
  );
  const group = getServiceGroupByKey(activeGroup);

  function handleGroupSelect(nextGroup) {
    const serviceCount = normalizedServices.filter(
      (service) =>
        !isDiscoveryService(service) &&
        getServiceGroupKey(service) === nextGroup,
    ).length;
    setActiveGroup(nextGroup);
    logEvent(ANALYTICS_EVENTS.BOOKING_SERVICE_GROUP_SELECTED, {
      group: nextGroup,
      visible_services: serviceCount,
    });
  }

  function handleUnsureSelect() {
    const unsureService = normalizedServices.find(isDiscoveryService);
    const value = getServiceValue(unsureService);
    setActiveGroup("unsure");
    onServiceSelect(value);
    logEvent(ANALYTICS_EVENTS.BOOKING_SERVICE_GROUP_SELECTED, {
      group: "unsure",
      visible_services: 1,
    });
  }

  function handleGroupBack() {
    logEvent(ANALYTICS_EVENTS.BOOKING_SERVICE_GROUP_BACK_CLICKED, { group: activeGroup });
    onServiceSelect("");
    setActiveGroup(null);
  }

  function handleServiceKeyDown(event, currentIndex) {
    const lastIndex = visibleServices.length - 1;
    let nextIndex;

    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    const options = event.currentTarget.parentElement.querySelectorAll('[role="radio"]');
    options[nextIndex]?.focus();
    onServiceSelect(getServiceValue(visibleServices[nextIndex]));
  }

  return (
    <Panel aria-labelledby="booking-service-title">
      <PanelHeader>
        <div>
          <Heading as="h2" id="booking-service-title" tabIndex="-1">
            {activeGroup === "unsure"
              ? "Keşif talebi"
              : activeGroup ? "Hangi işe daha yakın?" : "Ne yaptırmak istiyorsunuz?"}
          </Heading>
          <MutedText>
            {activeGroup === "unsure"
              ? "İşi yerinde inceleyip kapsamı birlikte netleştirelim."
              : activeGroup
              ? group?.title
              : "İşinize en yakın başlığı seçin."}
          </MutedText>
        </div>
      </PanelHeader>

      {!activeGroup ? (
        <>
          <ServiceGrid role="group" aria-label="İş türleri">
            {SERVICE_GROUPS.map((item) => {
              const Icon = SERVICE_GROUP_ICONS[item.key];
              const serviceCount = normalizedServices.filter(
                (service) =>
                  !isDiscoveryService(service) &&
                  getServiceGroupKey(service) === item.key,
              ).length;
              if (serviceCount === 0) return null;

              return (
                <GroupOption key={item.key} type="button" onClick={() => handleGroupSelect(item.key)}>
                  <ServiceIcon aria-hidden="true"><Icon /></ServiceIcon>
                  <ServiceCopy>
                    <ServiceTitle>{item.title}</ServiceTitle>
                    <ServiceProblem>{item.description}</ServiceProblem>
                  </ServiceCopy>
                  <HiOutlineChevronRight aria-hidden="true" />
                </GroupOption>
              );
            })}
          </ServiceGrid>
          <UnsureAction type="button" onClick={handleUnsureSelect}>
            <span><HiOutlineSparkles aria-hidden="true" />Hangi hizmet olduğunu bilmiyor musunuz?</span>
            <strong>Birlikte belirleyelim</strong>
          </UnsureAction>
        </>
      ) : (
        <>
          <GroupBackButton type="button" onClick={handleGroupBack}>
            <HiOutlineArrowLeft aria-hidden="true" />
            İş türlerine dön
          </GroupBackButton>
          <ServiceGrid
            role="radiogroup"
            aria-label="Hizmet seçenekleri"
            $single={visibleServices.length === 1}>
            {visibleServices.map((service, index) => {
              const value = getServiceValue(service);
              const isActive = selectedService === value;

              return (
                <ServiceOption
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive || (!selected && index === 0) ? 0 : -1}
                  $active={isActive}
                  onClick={() => onServiceSelect(value)}
                  onKeyDown={(event) => handleServiceKeyDown(event, index)}>
                  <ServiceIcon $active={isActive} aria-hidden="true">
                    <HiOutlineWrenchScrewdriver />
                  </ServiceIcon>
                  <ServiceCopy>
                    <ServiceTitle>{service.title}</ServiceTitle>
                    <ServiceProblem>
                      {service.problem || service.description || service.text}
                    </ServiceProblem>
                  </ServiceCopy>
                  {isActive ? <Check aria-hidden="true" /> : <span aria-hidden="true" />}
                </ServiceOption>
              );
            })}
          </ServiceGrid>
        </>
      )}

      {activeGroup && (
        <ActionRow>
          <Button
            type="button"
            variation="cta"
            size="large"
            disabled={!selectedService}
            onClick={() => onStepChange(2)}>
            Zaman Tercihini Seç
            <HiOutlineChevronRight aria-hidden="true" />
          </Button>
        </ActionRow>
      )}
    </Panel>
  );
}

ServiceSelection.propTypes = {
  services: PropTypes.array.isRequired,
  selectedService: PropTypes.string.isRequired,
  onServiceSelect: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default ServiceSelection;
