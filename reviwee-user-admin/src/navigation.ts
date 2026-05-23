import type { IconType } from "react-icons";
import { FaBuilding, FaCreditCard } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

type NavItemTypeWithoutChild = {
  label: string;
  path: string;
  icon: IconType;
  children?: never;
};

type NavItemTypeWithChild = {
  label: string;
  path?: never;
  icon: IconType;
  children?: {
    label: string;
    path: string;
    icon: IconType;
  }[];
};

export type NavItemType = NavItemTypeWithChild | NavItemTypeWithoutChild;

/** Paths shown as primary tabs in mobile bottom nav (order preserved). */
export const MOBILE_PRIMARY_PATHS = [
  "/dashboard",
  "/business-profile",
  "/subscription",
] as const;

export type MobilePrimaryPath = (typeof MOBILE_PRIMARY_PATHS)[number];

/**
 * Splits permission-filtered navigation into primary (bottom nav tabs) and more (modal).
 */
export function splitNavigationForMobile(
  filteredNavigation: NavItemType[]
): { primaryNav: NavItemType[]; moreNav: NavItemType[] } {
  const primarySet = new Set<string>(MOBILE_PRIMARY_PATHS);
  const primaryNav: NavItemType[] = [];
  const moreNav: NavItemType[] = [];

  for (const item of filteredNavigation) {
    if ("path" in item && item.path && primarySet.has(item.path)) {
      primaryNav.push(item);
    } else {
      moreNav.push(item);
    }
  }

  // Keep primary order as defined in MOBILE_PRIMARY_PATHS.
  primaryNav.sort(
    (a, b) =>
      MOBILE_PRIMARY_PATHS.indexOf(
        (a as NavItemTypeWithoutChild).path as MobilePrimaryPath
      ) -
      MOBILE_PRIMARY_PATHS.indexOf(
        (b as NavItemTypeWithoutChild).path as MobilePrimaryPath
      )
  );

  return { primaryNav, moreNav };
}

export const navigation: NavItemType[] = [
  {
    label: "Dashboard",
    icon: MdDashboard,
    path: "/dashboard",
  },
  {
    label: "Business Profile",
    icon: FaBuilding,
    path: "/business-profile",
  },
  {
    label: "Manage Credits",
    path: "/subscription",
    icon: FaCreditCard,
  },
];

export const useNavigationConfig = (): NavItemType[] => {
  return navigation;
};
