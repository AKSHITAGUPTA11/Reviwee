import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setIsCollapsed } from "../../../redux/slices/SideNavLayoutSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import Header from "../../UI/Header/Header";
import VerticalNavBar from "../../UI/VerticalNavBar/VerticalNavBar";
import MobileBottomNav from "../../UI/MobileBottomNav/MobileBottomNav";
import { useNavigationConfig, splitNavigationForMobile } from "../../../navigation";
type Props = {
  children: ReactNode;
  entityName?: ReactNode;
};

const SideNavLayout = ({ children, entityName }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const sideNavLayoutState: any = useSelector(
    (state: RootState) => state.sideNavLayout
  );
  const { isCollapsed } = sideNavLayoutState;
  const filteredNavigation = useNavigationConfig();
  const { primaryNav } = useMemo(
    () => splitNavigationForMobile(filteredNavigation),
    [filteredNavigation]
  );
  const toggleCollapse = () => {
    dispatch(setIsCollapsed(!isCollapsed));
  };
  const location = useLocation();
  const currentPath = `/${location.pathname?.split("/")[1]}`;
  const fullPath = location.pathname;

  const isPathEqualtoNavItem = (navItem: { path?: string }) =>
    !!navItem.path &&
    (navItem.path === currentPath || navItem.path === fullPath);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      dispatch(setIsCollapsed(true));
    }
  }, [location.pathname, dispatch]);

  return (
    <div
      className="relative flex h-dvh max-h-dvh w-full min-w-0 max-w-full overflow-x-hidden"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.altKey && e.key === "t") {
          toggleCollapse();
        }
      }}
    >
      {/* Side Navigation Bar */}
      <VerticalNavBar
        toggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
        navigation={filteredNavigation}
        isPathEqualtoNavItem={isPathEqualtoNavItem}
      />

      <div
        className={`h-full flex flex-col w-full transition-all duration-500 ${
          isCollapsed ? "lg:w-full" : "lg:w-[calc(100%-230px)]"
        }`}
      >
        {/* Header */}
        <div className="h-12.5">
          <Header
            toggleCollapse={toggleCollapse}
            isCollapsed={isCollapsed}
            entityName={entityName}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain pb-14 lg:pb-0">
          {children}
        </div>
      </div>
      <MobileBottomNav
        primaryNav={primaryNav}
        currentPath={currentPath}
      />
    </div>
  );
};

export default SideNavLayout;
// import { ReactNode, useEffect} from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useLocation } from "react-router-dom";
// import { navigation } from "../../../navigation";
// import { setIsCollapsed } from "../../../redux/slices/SideNavLayoutSlice";
// import { AppDispatch, RootState } from "../../../redux/store";
// import Header from "../../UI/Header/Header";
// import VerticalNavBar from "../../UI/VerticalNavBar/VerticalNavBar";

// type Props = {
//   children: ReactNode;
//   entityName?: ReactNode;
// };

// const SideNavLayout = ({ children, entityName }: Props) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const sideNavLayoutState: any = useSelector(
//     (state: RootState) => state.sideNavLayout
//   );

//   const { isCollapsed } = sideNavLayoutState;

//   const toggleCollapse = () => {
//     dispatch(setIsCollapsed(!isCollapsed));
//   };
//   const location = useLocation();
//   const currentPath = `/${location.pathname?.split("/")[1]}`;

//   // Adds useEffect to auto-collapse sidebar:
//   useEffect(() => {
//     if (window.innerWidth < 1024 && !isCollapsed) {
//       dispatch(setIsCollapsed(true));
//     }
//   }, [location.pathname, dispatch, isCollapsed]);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024) {
//         dispatch(setIsCollapsed(true));
//       }
//     };

//     handleResize(); // run once on mount
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [dispatch]);
//   return (
//     <div
//       className="flex h-screen w-screen relative"
//       tabIndex={0}
//       onKeyDown={(e) => {
//         if (e.altKey && e.key === "t") {
//           toggleCollapse();
//         }
//       }}
//     >
//       {/* Side Navigation Bar */}
//       <VerticalNavBar
//         toggleCollapse={toggleCollapse}
//         isCollapsed={isCollapsed}
//         navigation={navigation}
//         isPathEqualtoNavItem={(navItem: any) => navItem.path === currentPath}
//       />

//       <div
//         className={`h-full flex flex-col transition-all duration-500 
//     w-full lg:${isCollapsed ? "w-full" : "w-[calc(100%-230px)]"}`}
//       >
//         {/* Header */}
//         <div className="h-[50px]">
//           <Header
//             toggleCollapse={toggleCollapse}
//             isCollapsed={isCollapsed}
//             entityName={entityName}
//           />
//         </div>

//         <div className="flex-1 overflow-auto">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default SideNavLayout;
