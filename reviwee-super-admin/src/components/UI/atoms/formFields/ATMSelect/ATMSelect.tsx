import type { ReactNode } from "react";
import { ErrorMessage } from "formik";
import Select from "react-select";
import type {
  StylesConfig,
  GroupBase,
  FormatOptionLabelMeta,
  Options,
  PropsValue,
} from "react-select";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import ATMFormLabel from "../ATMFormLabel";
type Option = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  required?: boolean;
  size?: "small" | "medium";
  name: string;
  isLoading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  extraClasses?: string;
  renderValue?: (selected: any) => ReactNode;
  getValue?: (selected: any) => any;
  isOptionEqualToValue?: (option: any, selected: any) => boolean;
  isSearchedOption?: (option: any, searchValue: string) => boolean;
  showAddButton?: boolean;
  onAddNew?: (formValues: any, closeForm: () => void) => void;
  readonly?: boolean;
  onBlur?: any;

  options: Options<Option | any>;
  onChange: (selectedOption: Option | any) => void;
  renderOption?: (
    option: Option | any,
    meta: FormatOptionLabelMeta<Option | any>
  ) => React.ReactNode;
  disabled?: boolean;
  value: PropsValue<Option | any>;
  isOptionSelected?: (option: any, selectedValue: any) => boolean;
  menuPlacement?: "auto" | "top" | "bottom";
  menuPosition?: "fixed" | "absolute";
};

const ATMSelect = ({
  label = "",
  name,
  options,
  value,
  onChange,
  required = false,
  renderOption,
  isLoading = false,
  isOptionEqualToValue,
  disabled = false,
  menuPlacement = "bottom",
  isSearchedOption,
  placeholder = "Select",
  size = "small",
  onBlur,
  menuPosition = "fixed",

  searchable: _searchable = false,
  extraClasses: _extraClasses,
  renderValue: _renderValue = (selected) => selected?.label,
  getValue: _getValue = (selected) => selected?.value,
  showAddButton: _showAddButton = false,
  onAddNew: _onAddNew,
  readonly: _readonly = false,
}: Props) => {
  const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
    option: (styles: Record<string, unknown>, { isDisabled, isFocused, isSelected }: { isDisabled?: boolean; isFocused?: boolean; isSelected?: boolean }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? "var(--surface-dark)"
          : isFocused
          ? "var(--surface)"
          : undefined,

        color: isDisabled
          ? undefined
          : isSelected
          ? "black"
          : isFocused
          ? undefined
          : undefined,
      };
    },

    menu: (styles: any) => {
      return {
        ...styles,
        minWidth: 20,
        zIndex: 10000,
      };
    },
    menuPortal: (styles: any) => {
      return {
        ...styles,
        zIndex: 10000,
      };
    },

    container: (styles: Record<string, unknown>) => {
      return {
        ...styles,
        minWidth: 20,
        height: getInputHeight(size, true),
      };
    },

    control: (
      styles: Record<string, unknown>,
      { isFocused, menuIsOpen }: { isFocused?: boolean; menuIsOpen?: boolean }
    ) => {
      const isActive = isFocused || menuIsOpen;
      return {
        ...styles,
        height: "100%",
        minHeight: "42px",
        boxSizing: "border-box",
        borderRadius: "var(--radius-sm)",
        border: isActive
          ? "1px solid var(--focus-ring)"
          : "1px solid var(--divider)",
        boxShadow: isActive ? "var(--control-focus-shadow)" : "none",
      };
    },

    // Add any custom styles here if needed
  };

  return (
    <>
      <div className="relative bg-inherit " id="select-container">
        <ATMFormLabel label={label} required={required} disabled={disabled} />

        <div className={label ? "mt-2" : ""}>
        <Select
          isMulti={false}
          options={options}
          value={value}
          onChange={(option: any) => onChange(option)}
          styles={customStyles}
          formatOptionLabel={renderOption}
          isDisabled={disabled}
          isOptionSelected={isOptionEqualToValue}
          menuPlacement={menuPlacement}
          isLoading={isLoading}
          placeholder={placeholder}
          filterOption={
            isSearchedOption
              ? (option: any, inputValue: any) =>
                  isSearchedOption?.(option, inputValue?.toLowerCase())
              : undefined
          }
          className="atm-select-field"
          classNamePrefix="atm-select"
          onBlur={onBlur}
          isClearable
          menuPosition={menuPosition}
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : undefined
          }
        />
        </div>

        {name && (
          <ErrorMessage name={name}>
            {(errMsg) => (
              <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
                {errMsg}
              </p>
            )}
          </ErrorMessage>
        )}
      </div>
    </>
  );
};
export default ATMSelect;
