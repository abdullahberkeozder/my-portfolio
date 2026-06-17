import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import Heading from "../ui/Heading";

const weekAvailability = [
  {
    day: "Monday",
    date: "17 Jun",
    status: "Limited",
    slots: ["18:00", "20:00", "22:00"],
  },
  {
    day: "Tuesday",
    date: "18 Jun",
    status: "Busy",
    slots: ["Full day field work"],
  },
  {
    day: "Wednesday",
    date: "19 Jun",
    status: "Limited",
    slots: ["18:00", "20:00", "22:00"],
  },
  {
    day: "Thursday",
    date: "20 Jun",
    status: "Limited",
    slots: ["18:00", "20:00", "22:00"],
  },
  {
    day: "Friday",
    date: "21 Jun",
    status: "Limited",
    slots: ["09:30", "12:00", "14:30"],
  },
  {
    day: "Saturday",
    date: "22 Jun",
    status: "Available",
    slots: ["18:00", "20:00", "22:00"],
  },
  {
    day: "Sunday",
    date: "23 Jun",
    status: "Closed",
    slots: ["Emergency only"],
  },
];

const recentRequests = [
  {
    customer: "Murat Demir",
    work: "Balcony railing repair",
    time: "Today, 14:30",
    status: "Confirmed",
  },
  {
    customer: "Elif Kaya",
    work: "Steel door hinge welding",
    time: "Tomorrow, 10:00",
    status: "Waiting",
  },
  {
    customer: "Atlas Workshop",
    work: "Custom table frame",
    time: "Friday, 12:00",
    status: "Quote needed",
  },
];

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const Hero = styled.section`
  background: linear-gradient(
    135deg,
    #111827 0%,
    #374151 55%,
    #92400e 100%
  );
  color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(
      28rem,
      0.8fr
    );
  gap: 3.2rem;
  align-items: center;
  box-shadow: var(--shadow-md);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Eyebrow = styled.p`
  color: #facc15;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  max-width: 72rem;
  font-size: 4rem;
  line-height: 1.1;
  font-weight: 700;

  @media (max-width: 560px) {
    font-size: 3rem;
  }
`;

const HeroText = styled.p`
  max-width: 62rem;
  color: #e5e7eb;
  font-size: 1.7rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 4.4rem;
  padding: 1.1rem 1.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) =>
    props.$secondary ? "#f9fafb" : "#111827"};
  background: ${(props) =>
    props.$secondary
      ? "rgba(255, 255, 255, 0.12)"
      : "#facc15"};
  border: 1px solid
    ${(props) =>
      props.$secondary
        ? "rgba(255, 255, 255, 0.24)"
        : "#facc15"};

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const HeroPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

const HeroPanelItem = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 1.2rem;
  align-items: center;

  & svg {
    width: 4.4rem;
    height: 4.4rem;
    padding: 1rem;
    border-radius: 50%;
    color: #facc15;
    background: rgba(255, 255, 255, 0.12);
  }
`;

const PanelLabel = styled.span`
  display: block;
  color: #d1d5db;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const PanelValue = styled.strong`
  display: block;
  color: var(--color-grey-0);
  font-size: 1.8rem;
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 1020px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  grid-template-columns: 4.8rem 1fr;
  gap: 1.2rem;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-${(props) => props.$color}-700);
  background: var(--color-${(props) => props.$color}-100);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const StatLabel = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const StatValue = styled.p`
  color: var(--color-grey-800);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1.1;
`;

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(
      32rem,
      0.85fr
    );
  gap: 2.4rem;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 2rem;
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1.2rem;
  padding-bottom: 0.4rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(7, minmax(14rem, 1fr));
    overflow-x: auto;
  }
`;

const DayCard = styled.article`
  min-width: 0;
  min-height: 18rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${(props) =>
    props.$closed
      ? "var(--color-grey-50)"
      : "var(--color-grey-0)"};
`;

const DayName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-grey-800);
  overflow-wrap: normal;
  hyphens: none;
`;

const DayDate = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;

const StatusBadge = styled.span`
  align-self: flex-start;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) =>
    props.$status === "Available"
      ? "var(--color-green-700)"
      : props.$status === "Limited"
        ? "var(--color-yellow-700)"
        : props.$status === "Busy"
          ? "var(--color-blue-700)"
          : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$status === "Available"
      ? "var(--color-green-100)"
      : props.$status === "Limited"
        ? "var(--color-yellow-100)"
        : props.$status === "Busy"
          ? "var(--color-blue-100)"
          : "var(--color-grey-100)"};
`;

const SlotList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: auto;
`;

const Slot = styled.li`
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 600;
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const RequestCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  display: grid;
  gap: 0.6rem;
`;

const RequestTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
`;

const RequestTitle = styled.h3`
  color: var(--color-grey-800);
  font-size: 1.5rem;
  font-weight: 700;
`;

const RequestStatus = styled.span`
  white-space: nowrap;
  color: var(--color-indigo-700);
  background: var(--color-indigo-100);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 700;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 1.6rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ContactLink = styled.a`
  min-height: 5.6rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  color: var(--color-grey-700);
  background: var(--color-grey-50);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-600);
  }
`;

function Dashboard() {
  return (
    <Page>
      <Hero>
        <HeroCopy>
          <Eyebrow>Admin panel</Eyebrow>
          <HeroTitle>
            Manage welding appointments from one place
          </HeroTitle>
          <HeroText>
            Review customer requests, keep the public appointment page ready,
            and follow every welding job from first contact to confirmation.
          </HeroText>
          <Actions>
            <ActionLink to="/appointment">
              <HiOutlineCalendarDays />
              Open customer page
            </ActionLink>
            <ActionLink
              to="/admin/bookings"
              $secondary>
              <HiOutlineClock />
              Review requests
            </ActionLink>
          </Actions>
        </HeroCopy>

        <HeroPanel>
          <HeroPanelItem>
            <HiOutlineMapPin />
            <div>
              <PanelLabel>Service area</PanelLabel>
              <PanelValue>
                Ankara and nearby districts
              </PanelValue>
            </div>
          </HeroPanelItem>
          <HeroPanelItem>
            <HiOutlineWrenchScrewdriver />
            <div>
              <PanelLabel>Primary jobs</PanelLabel>
              <PanelValue>
                Repairs, gates, railings, custom frames
              </PanelValue>
            </div>
          </HeroPanelItem>
        </HeroPanel>
      </Hero>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="green">
            <HiOutlineCheckCircle />
          </StatIcon>
          <div>
            <StatLabel>Open slots</StatLabel>
            <StatValue>10</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="blue">
            <HiOutlineCalendarDays />
          </StatIcon>
          <div>
            <StatLabel>This week</StatLabel>
            <StatValue>7 jobs</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="yellow">
            <HiOutlineClock />
          </StatIcon>
          <div>
            <StatLabel>Waiting quotes</StatLabel>
            <StatValue>3</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="indigo">
            <HiOutlineUserGroup />
          </StatIcon>
          <div>
            <StatLabel>Customers</StatLabel>
            <StatValue>24</StatValue>
          </div>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionHeader>
          <div>
            <Heading as="h2">Weekly availability</Heading>
            <MutedText>
              Free days and appointment windows customers
              can see.
            </MutedText>
          </div>
        </SectionHeader>

        <WeekGrid>
          {weekAvailability.map((day) => (
            <DayCard
              key={day.day}
              $closed={day.status === "Closed"}>
              <div>
                <DayName>{day.day}</DayName>
                <DayDate>{day.date}</DayDate>
              </div>
              <StatusBadge $status={day.status}>
                {day.status}
              </StatusBadge>
              <SlotList>
                {day.slots.map((slot) => (
                  <Slot key={slot}>{slot}</Slot>
                ))}
              </SlotList>
            </DayCard>
          ))}
        </WeekGrid>
      </Section>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Customer requests</Heading>
              <MutedText>
                Appointments and quote requests waiting for
                action.
              </MutedText>
            </div>
          </SectionHeader>

          <RequestList>
            {recentRequests.map((request) => (
              <RequestCard
                key={`${request.customer}-${request.time}`}>
                <RequestTop>
                  <RequestTitle>
                    {request.customer}
                  </RequestTitle>
                  <RequestStatus>
                    {request.status}
                  </RequestStatus>
                </RequestTop>
                <MutedText>{request.work}</MutedText>
                <Slot>{request.time}</Slot>
              </RequestCard>
            ))}
          </RequestList>
        </Section>

        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Contact shortcuts</Heading>
              <MutedText>
                Direct channels for fast customer
                communication.
              </MutedText>
            </div>
          </SectionHeader>

          <ContactGrid>
            <ContactLink
              href="https://wa.me/905551112233"
              target="_blank"
              rel="noreferrer">
              <HiOutlinePhone />
              WhatsApp
            </ContactLink>
            <ContactLink href="mailto:info@theweldingexpert.com">
              <HiOutlineEnvelope />
              Email
            </ContactLink>
          </ContactGrid>
        </Section>
      </ContentGrid>
    </Page>
  );
}

export default Dashboard;
