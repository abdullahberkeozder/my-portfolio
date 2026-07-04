import PropTypes from "prop-types";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import styled from "styled-components";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { Panel, PanelHeader, MutedText } from "./booking.styles";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 2px solid
    ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-sm);
  padding: 1.8rem;
  background: var(--color-grey-0);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  box-shadow: ${(props) =>
    props.$active ? "var(--shadow-md)" : "var(--shadow-sm)"};

  &:hover {
    border-color: ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-brand-200)"};
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-grey-900);
`;

const CheckIcon = styled.div`
  color: var(--color-brand-600);
  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const Description = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-600);
  line-height: 1.4;
`;

const Highlights = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.4rem;
`;

const HighlightItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-700);

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-brand-500);
    flex-shrink: 0;
  }
`;

const PriceTag = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-grey-50);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-brand-700);
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

function ServiceSelection({ services, selectedService, onServiceSelect, onStepChange }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <Heading as="h2">Hizmet Seçimi</Heading>
          <MutedText>Randevu almak istediğiniz ana hizmet konusunu seçin.</MutedText>
        </div>
      </PanelHeader>

      <Grid>
        {services.map((service) => {
          const isActive = selectedService === (service.service_key || service.serviceType);
          return (
            <Card
              key={service.title}
              $active={isActive}
              onClick={() => onServiceSelect(service.service_key || service.serviceType)}
            >
              <CardHeader>
                <Title>{service.title}</Title>
                {isActive && (
                  <CheckIcon>
                    <HiOutlineCheckCircle />
                  </CheckIcon>
                )}
              </CardHeader>
              <Description>{service.text}</Description>
              
              <Highlights>
                {(service.points || []).slice(0, 3).map((point) => (
                  <HighlightItem key={point}>
                    <HiOutlineCheckCircle />
                    <span>{point}</span>
                  </HighlightItem>
                ))}
              </Highlights>

              {service.priceTagline && (
                <PriceTag>{service.priceTagline}</PriceTag>
              )}
            </Card>
          );
        })}
      </Grid>

      <ActionRow>
        <Button
          type="button"
          variation="primary"
          size="large"
          onClick={() => onStepChange(2)}
          style={{ minWidth: "20rem" }}
        >
          Tarih & Saat Seçimi →
        </Button>
      </ActionRow>
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
