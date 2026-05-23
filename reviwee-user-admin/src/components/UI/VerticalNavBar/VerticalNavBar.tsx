import React, { useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { BiChevronRight } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { NavItemType } from "../../../navigation";
import { setExpandedIndex } from "../../../redux/slices/SideNavLayoutSlice";

type Props = {
  toggleCollapse: () => void;
  isCollapsed: boolean;
  navigation: NavItemType[];
  isPathEqualtoNavItem?: (navItem: any) => boolean;
};

const VerticalNavBar = ({
  toggleCollapse,
  isCollapsed,
  navigation,
  isPathEqualtoNavItem = () => false,
}: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sideNavLayoutState: any = useSelector(
    (state: RootState) => state.sideNavLayout
  );
  const { expandedIndex } = sideNavLayoutState;
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || "";
    const idx = navigation.findIndex(
      (item: any) =>
        item.children?.some((c: any) => c.path && pathname.startsWith(c.path))
    );
    if (idx >= 0 && expandedIndex !== idx) {
      dispatch(setExpandedIndex(idx));
    }
  }, [location.pathname, navigation, dispatch]);

  return (
    <div
      className={`
        fixed left-0 top-0 h-full z-40
        lg:relative lg:z-auto
        overflow-auto bg-(--primary-light)
        border-r border-(--divider)
        transition-all duration-500 shadow-sm
        ${isCollapsed
          ? "w-0 -translate-x-full lg:translate-x-0 lg:min-w-0 lg:w-0"
          : "w-60 translate-x-0 lg:min-w-60 lg:w-60"
        }
      `}
    >
      {/* Logo + Toggle */}
      <div className="flex px-4 items-center justify-between sticky top-0 py-3 h-13.75 bg-(--primary-light)">
        <div
          className={`font-semibold text-xl text-primary ${
            isCollapsed && "md:hidden"
          }`}
        >
         Reviwee
        </div>

        <Tooltip title="Collapse">
          <button
            onClick={toggleCollapse}
            className="text-xl text-primary"
          >
            <FiMenu className="hidden md:block" />
            <MdCancel className="block md:hidden text-xl" />
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <div className="flex flex-col">
        {navigation?.map((navItem: any, navIndex: number) => (
          <React.Fragment key={navIndex}>
            {/* Parent */}
            <div
              onClick={() =>
                navItem.path && !navItem.children
                  ? navigate({ pathname: navItem.path })
                  : dispatch(
                      setExpandedIndex(
                        expandedIndex === navIndex ? -1 : navIndex
                      )
                    )
              }
              className={`
                mx-2 my-1 rounded-lg py-3 px-4 cursor-pointer flex justify-between items-center text-[14px]
                text-(--text-secondary)
                transition-all duration-300
                ${
                  isPathEqualtoNavItem(navItem)
                    ? "bg-(--active-bg) text-white font-semibold"
                    : "hover:bg-(--hover) hover:text-(--primary-dark)"
                }
              `}
            >
              <div className="flex gap-2 items-center text-[14px]">
                <navItem.icon />
                {!isCollapsed && navItem.label}
              </div>

              {navItem.children && !isCollapsed && (
                <BiChevronRight
                  className={`text-xl transition-all ${
                    expandedIndex === navIndex
                      ? "rotate-90 text-(--primary-main)"
                      : "text-(--text-secondary)"
                  }`}
                />
              )}
            </div>

            {/* Child */}
            {expandedIndex === navIndex && !isCollapsed && (
              <div className="flex flex-col gap-1 pl-4">
                {navItem.children?.map((child: any, cIndex: number) => (
                  <React.Fragment key={cIndex}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        child.path && navigate({ pathname: child.path });
                      }}
                      className={`
                            mx-2 my-1 rounded-lg py-3 px-4 cursor-pointer flex gap-3 items-center
                text-primary text-[14px]
                transition-all duration-300
                        ${
                          isPathEqualtoNavItem(child)
                            ? "bg-(--active-bg) text-white font-semibold"
                            : "hover:bg-(--hover) hover:text-(--primary-dark)"
                        }
                      `}
                    >
                      <child.icon />
                      {!isCollapsed && <span>{child.label}</span>}
                    </div>

                    {/* GRAND CHILD */}
                    {child.children && isPathEqualtoNavItem(navItem) && (
                      <div className="flex flex-col pl-6">
                        {child.children.map((grand: any, gIndex: number) => (
                          <div
                            key={gIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ pathname: grand.path });
                            }}
                            className={`
                              flex items-center gap-3 py-2 pl-4 rounded-md cursor-pointer text-sm
                              ${
                                isPathEqualtoNavItem(grand)
                                  ? "bg-(--active-bg) text-(--primary-main) font-semibold"
                                  : "hover:bg-(--hover) hover:text-(--primary-dark)"
                              }
                            `}
                          >
                            <grand.icon className="text-xs" />
                            <span>{grand.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default VerticalNavBar;
