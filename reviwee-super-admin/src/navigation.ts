import type { IconType } from "react-icons";
import { FaBuilding, FaCreditCard, FaCog, FaMoneyBillWave } from "react-icons/fa";
import { MdDashboard, MdSearch, MdReceipt } from "react-icons/md";
import { IoMdList, IoMdBarcode, IoMdStar, IoMdGlobe, IoMdAnalytics } from "react-icons/io";

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
  "/customer",
  "/subscription",
] as const;

export type MobilePrimaryPath = (typeof MOBILE_PRIMARY_PATHS)[number];

/**
 * Splits permission-filtered navigation into primary (bottom nav tabs) and more (modal).
 */
export function splitNavigationForMobile(filteredNavigation: NavItemType[]): {
  primaryNav: NavItemType[];
  moreNav: NavItemType[];
} {
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
        (a as NavItemTypeWithoutChild).path as MobilePrimaryPath,
      ) -
      MOBILE_PRIMARY_PATHS.indexOf(
        (b as NavItemTypeWithoutChild).path as MobilePrimaryPath,
      ),
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
    label: "Customer",
    icon: FaBuilding,
    path: "/customer",
  },
  {
    label: "Subscription",
    path: "/subscription",
    icon: FaCreditCard,
  },
  {
    label: "Transaction",
    path: "/transaction",
    icon: MdReceipt,
  },
  {
    label: "Dues",
    path: "/admin/dues",
    icon: FaMoneyBillWave,
  },
  {
    label: "Review Feature",
    path: "/review-feature",
    icon: IoMdStar,
  },
  {
    label: "Review Feature Manage",
    path: "/review-feature/manage",
    icon: IoMdStar,
  },
  {
    label: "Review Feature Option",
    path: "/review-feature-option",
    icon: IoMdStar,
  },
  {
    label: "SEO Keywords",
    path: "/seo-keywords",
    icon: MdSearch,
  },
  {
    label: "Configuration",
    icon: FaCog,
    children: [
      {
        label: "Category",
        path: "/category",
        icon: IoMdList,
      },
      {
        label: "Subcategory",
        path: "/subcategory",
        icon: IoMdBarcode,
      },
      {
        label: "Language",
        path: "/language",
        icon: IoMdGlobe,
      },
      {
        label: "Credit Config",
        path: "/credit-config",
        icon: IoMdAnalytics,
      },
    ],
  },
];

export const useNavigationConfig = (): NavItemType[] => {
  return navigation;
};
