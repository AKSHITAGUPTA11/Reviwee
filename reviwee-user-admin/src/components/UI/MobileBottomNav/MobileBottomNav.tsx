import { useNavigate } from "react-router-dom";
import type { NavItemType } from "../../../navigation";

type Props = {
  primaryNav: NavItemType[];
  currentPath: string;
};

const MobileBottomNav = ({
  primaryNav,
  currentPath,
}: Props) => {
  const navigate = useNavigate();

  const isPathEqual = (path: string) => {
    return path === currentPath;
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-14 safe-area-pb bg-white border-t border-[var(--divider)] flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {primaryNav.map((item) => {
        if (!("path" in item) || !item.path) return null;
        const isActive = isPathEqual(item.path);
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate({ pathname: item.path })}
            className={`
              flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1 px-1
              text-[12px] transition-all duration-200
              ${isActive ? "text-[var(--primary-main)] font-semibold" : "text-[var(--text-secondary)]"}
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="text-[22px] shrink-0 mb-0.5" />
            <span className="truncate max-w-full">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
