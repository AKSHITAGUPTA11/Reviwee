import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { MdClose } from "react-icons/md";
import { BiChevronRight } from "react-icons/bi";
import type { NavItemType } from "../../../navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  navigation: NavItemType[];
  currentPath: string;
};

const NAV_DESCRIPTIONS: Record<string, string> = {
  "Staff Management": "Manage staff members and roles",
  "Clinic-Doctor Schedule":
    "Set and view schedules for clinics and doctors",
  "Clinic-Doctor-Treatment":
    "Manage treatments and assign to doctors",
  Configuration: "General system settings and configurations",
};

const MoreMenuModal = ({
  open,
  onClose,
  navigation,
  currentPath,
}: Props) => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);

  const isPathEqual = (path: string) => path === currentPath;

  const handleNav = (path: string) => {
    navigate({ pathname: path });
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        "& .MuiDrawer-paper": {
          maxHeight: "100vh",
          height: "100vh",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
      }}
    >
      <div className=" flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            More
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 text-[var(--text-secondary)]"
            aria-label="Close"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
          {navigation.map((navItem: any, navIndex: number) => {
            const description: string | undefined =
              NAV_DESCRIPTIONS[navItem.label];

            // Simple item with direct path
            if (navItem.path && !navItem.children) {
              const isActive = isPathEqual(navItem.path);
              return (
                <div
                  key={navIndex}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav(navItem.path)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleNav(navItem.path)
                  }
                  className={`
                    bg-white rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer
                    shadow-sm transition-transform duration-200 active:scale-[0.98]
                    ${isActive ? "ring-1 ring-[var(--primary-main)]" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f2f6ff] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                      <navItem.icon className="text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {navItem.label}
                      </span>
                      {description && (
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {description}
                        </span>
                      )}
                    </div>
                  </div>
                  <BiChevronRight className="text-xl text-[var(--divider)]" />
                </div>
              );
            }

            // Item with children (expandable)
            const isExpanded = expandedIndex === navIndex;

            return (
              <div key={navIndex} className="space-y-2">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setExpandedIndex(isExpanded ? -1 : navIndex)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setExpandedIndex(isExpanded ? -1 : navIndex)
                  }
                  className={`
                    bg-white rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer
                    shadow-sm transition-transform duration-200 active:scale-[0.98]
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f2f6ff] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                      <navItem.icon className="text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {navItem.label}
                      </span>
                      {description && (
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {description}
                        </span>
                      )}
                    </div>
                  </div>
                  <BiChevronRight
                    className={`text-xl text-[var(--divider)] transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {isExpanded && navItem.children && (
                  <div className="space-y-2 pl-4">
                    {navItem.children.map((child: any, cIndex: number) => {
                      const childActive =
                        child.path && isPathEqual(child.path);

                      return (
                        <div
                          key={cIndex}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            child.path && handleNav(child.path);
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            child.path &&
                            handleNav(child.path)
                          }
                          className={`
                            bg-white rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer
                            shadow-sm transition-transform duration-200 active:scale-[0.98]
                            ${childActive ? "ring-1 ring-[var(--primary-main)]" : ""}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-[#f2f6ff] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                              <child.icon className="text-base" />
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {child.label}
                            </span>
                          </div>
                          <BiChevronRight className="text-lg text-[var(--divider)]" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};

export default MoreMenuModal;
