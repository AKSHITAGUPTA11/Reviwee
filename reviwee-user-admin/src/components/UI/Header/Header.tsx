import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";
// import { IoNotifications } from "react-icons/io5";
// import NotificationCard from "./NotificationCard/NotificationCard";
import UserProfileCard from "./UserProfileCard/UserProfileCard";
import { Tooltip } from "@mui/material";

interface Props {
  toggleCollapse: () => void;
  isCollapsed: boolean;
  entityName?: React.ReactNode;
}

const Header = ({ toggleCollapse, isCollapsed, entityName }: Props) => {
  const [isShowProfileCard, setIsShowProfileCard] = useState(false);
  const location = useLocation();
  // const [isShowNotification, setIsShowNotification] = useState(false);
  // const [isNewNotificationsAvailable, setIsNewNotificationsAvailable] =
  //   useState(true);

  let userData: {
    name?: string;
    email?: string;
    mobile?: string;
    memberId?: string;
  } = {};
  try {
    userData = JSON.parse(localStorage.getItem("userData") || "{}");
  } catch {
    userData = {};
  }

  const resolvedUserData = {
    name: userData?.name || localStorage.getItem("userName") || "User",
    email: userData?.email || localStorage.getItem("email") || "",
    mobile: userData?.mobile || localStorage.getItem("mobile") || "",
    memberId: userData?.memberId || localStorage.getItem("memberId") || "",
  };

  const mobileTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/business-profile": "Business Profile",
    "/subscription": "Manage Credits",
    "/review": "Review",
  };

  const pathRoot = `/${location.pathname.split("/")[1] || ""}`;
  const mobileTitle = mobileTitleMap[pathRoot] || "Review ";

  return (
    <div className="grid grid-cols-2 w-full h-full border-b border-gray-300 bg-white px-4">
      {/* Menu Icon */}
      <div className="h-full flex items-center">
        <Tooltip title="Alt + T">
          <button
            type="button"
            onClick={toggleCollapse}
            className={`text-xl text-slate-500 px-3 block h-full max-lg:hidden ${
              !isCollapsed && "lg:hidden"
            }`}
          >
            <FiMenu />
          </button>
        </Tooltip>

        <div className="lg:hidden font-semibold text-sm text-[var(--primary-main)]">
          {mobileTitle}
        </div>
        <div className="hidden lg:block">{entityName}</div>
      </div>
      {/* Right Section */}
      <div className="relative flex gap-4 col-start-2 justify-end items-center h-full">
        {/* <button
          onClick={() => {
            setIsShowNotification((isShowNotification) => !isShowNotification);
            setIsNewNotificationsAvailable(false);
          }}
          className="relative text-lg text-slate-700 transition-all duration-[800ms] hover:bg-slate-200 px-3 rounded-full"
        >
          <IoNotifications className="" />
          {isNewNotificationsAvailable ? (
            <span className="flex h-[7px] w-[7px] absolute -top-[1px] right-[11px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-100"></span>
              <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-red-600"></span>
            </span>
          ) : null}
        </button> */}

    

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsShowProfileCard((prev) => !prev);
          }}
          className="flex items-center justify-center rounded-full p-1 hover:bg-slate-100"
          aria-label="Open profile menu"
        >
          <div className="h-[32px] w-[32px] flex justify-center items-center font-bold bg-[var(--primary-main)] text-white text-[13px] rounded-full border border-[var(--primary-border)] shadow-sm">
            {resolvedUserData?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </button>
        {isShowProfileCard && (
          <UserProfileCard
            onClickAway={() => setIsShowProfileCard(false)}
            userData={resolvedUserData}
          />
        )}
      
{/* 
        {isShowNotification && (
          <NotificationCard onClickAway={() => setIsShowNotification(false)} />
        )} */}
      </div>
    </div>
  );
};

export default Header;
