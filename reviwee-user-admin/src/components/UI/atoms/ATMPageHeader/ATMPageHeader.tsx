import { useMediaQuery } from "@mui/material";
import { BiFilter, BiSearch, BiX } from "react-icons/bi";
import ATMLoadingButton from "../ATMLoadingButton/ATMLoadingButton";
import ATMFab from "../ATMFab";
import ATMInputAdormant from "../formFields/ATMInputAdormant/ATMInputAdormant";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { usePermission } from "src/hooks/usePermission";
import { useDebouncedCallback } from "src/hooks/useDebouncedCallback";
type Props = {
  pageTitle: string;
  searchValue?: string;
  moduleName: string;
  altText?: string;
  onSearchChange?: (
    newValue: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  buttonProps?: { btnName?: string; onClick: () => void; className?: string };
  extraButtonProps?: {
    btnName?: string;
    onClick: () => void;
    className?: string;
  }[];
  extraButton?: boolean;
  hideAddButton?: boolean;
  hideSearchBox?: boolean;
  isFilter?: boolean;
  onFilterClick?: () => void;
  debounceMs?: number;
  /** When true, only the search/actions row is shown (no page title row). */
  toolbarOnly?: boolean;
};
const ATMPageHeader = ({
  pageTitle,
  searchValue = "",
  moduleName,
  altText = "Actions ▾",
  extraButton = false,
  onSearchChange,
  hideAddButton = false,
  extraButtonProps = [{ btnName: "", onClick: () => { }, className: "" }],
  buttonProps = { btnName: "Add New", onClick: () => { }, className: "" },
  hideSearchBox = false,
  isFilter = false,
  onFilterClick = () => { },
  debounceMs,
  toolbarOnly = false,
}: Props) => {
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(searchValue);

  const { debouncedCallback: debouncedOnSearchChange, cancel: cancelDebounce } =
    useDebouncedCallback(
      (value: string) =>
        onSearchChange?.(value, {} as ChangeEvent<HTMLInputElement>),
      debounceMs ?? 300
    );

  useEffect(() => {
    setDisplayValue(searchValue);
  }, [searchValue]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    if (debounceMs != null) {
      debouncedOnSearchChange(value);
    } else {
      onSearchChange?.(value, e);
    }
  };

  const handleClearSearch = () => {
    if (debounceMs != null) {
      cancelDebounce();
    }
    setDisplayValue("");
    onSearchChange?.("", {} as ChangeEvent<HTMLInputElement>);
  };

  const effectiveSearchValue = debounceMs != null ? displayValue : searchValue;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExtraDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const canAddUser = usePermission(moduleName?.toLocaleUpperCase(), "ADD");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const searchWidthClass = toolbarOnly
    ? "w-full max-w-md min-h-[44px] md:min-h-0"
    : "w-full md:w-[300px] min-h-[44px] md:min-h-0";

  const rightSection = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2 ">
      {/* Filter Button (DESKTOP ONLY) */}
      {isFilter && (
        <button
          onClick={onFilterClick}
          className="hidden md:flex bg-white shadow px-2 py-2 items-center justify-center rounded border"
        >
          <BiFilter className="text-2xl text-slate-600" />
        </button>
      )}

      {/* Search Box */}
      {!hideSearchBox && (
        <div className={`flex items-center gap-1 ${searchWidthClass}`}>
            <div className="flex-1 min-w-0">
              <ATMInputAdormant
                name=""
                value={effectiveSearchValue}
                onChange={handleSearchChange}
                adormant={<BiSearch />}
                adormantProps={{
                  position: "start",
                  extraClasses: "bg-white border-0",
                }}
                inputProps={{ className: "bg-white" }}
                placeholder="Search..."
              />
            </div>
            {effectiveSearchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="shrink-0 p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Clear search"
              >
                <BiX className="text-xl" />
              </button>
            )}
          </div>
        )}
      {/* Buttons */}
      <div className="flex gap-2 relative">
          {extraButton && extraButtonProps?.length === 1 && (
            <ATMLoadingButton
              onClick={extraButtonProps[0].onClick}
              className={extraButtonProps[0].className}
            >
              {" "}
              {extraButtonProps[0].btnName}{" "}
            </ATMLoadingButton>
          )}
          {/* Extra Buttons */}
          {extraButton && extraButtonProps?.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <ATMLoadingButton
                onClick={() => setShowExtraDropdown((prev) => !prev)}
                className="flex w-36 items-center gap-1 hover:bg-hover"
              >
                {altText}
              </ATMLoadingButton>

              {showExtraDropdown && (
                <div className="absolute right-0 mt-2 z-50 p-2 space-y-2 inline-block border rounded bg-white shadow">
                  {extraButtonProps.map((btn, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        btn.onClick();
                        setShowExtraDropdown(false);
                      }}
                      className="block whitespace-nowrap px-3 py-2 text-sm rounded-md bg-primary-main text-white hover:bg-primary-hover active:bg-primary-active transition"
                    >
                      {btn.btnName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Button - Desktop: Add New only; Mobile: FAB only */}
          {!hideAddButton && canAddUser && buttonProps?.onClick && (
            <>
              {isDesktop ? (
                <ATMLoadingButton onClick={buttonProps.onClick}>
                  {buttonProps?.btnName || "Add New"}
                </ATMLoadingButton>
              ) : (
                <ATMFab
                  onClick={buttonProps.onClick}
                  ariaLabel={buttonProps?.btnName || "Add"}
                  storageKey={`fab-${moduleName?.toLowerCase().replace(/_/g, "-")}`}
                />
              )}
            </>
          )}
        </div>
    </div>
  );

  if (toolbarOnly) {
    return (
      <div className="flex w-full flex-col items-stretch sm:items-end">
        {rightSection}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Page Title + Mobile Filter */}
      <div className="text-lg flex items-center justify-between md:text-xl font-medium text-slate-700">
        {pageTitle}

        {/* Filter Button (MOBILE ONLY) */}
        {isFilter && (
          <button
            onClick={onFilterClick}
            className="md:hidden bg-white shadow px-2 py-2 flex items-center justify-center rounded border"
          >
            <BiFilter className="text-2xl text-slate-600" />
          </button>
        )}
      </div>

      {rightSection}
    </div>
  );
};
export default ATMPageHeader;
