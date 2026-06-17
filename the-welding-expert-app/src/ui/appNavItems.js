import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

const appNavItems = [
  {
    href: "#about",
    label: "Biz kimiz",
    Icon: HiOutlineShieldCheck,
  },
  {
    href: "#services",
    label: "Hizmetler",
    Icon: HiOutlineWrenchScrewdriver,
  },
  {
    href: "#process",
    label: "Surec",
    Icon: HiOutlineClock,
  },
  {
    href: "#appointment-calendar",
    label: "Randevu",
    Icon: HiOutlineCalendarDays,
  },
  {
    href: "#location",
    label: "Adres",
    Icon: HiOutlineMapPin,
  },
  {
    href: "#faq",
    label: "SSS",
    Icon: HiOutlineInformationCircle,
  },
];

export default appNavItems;
