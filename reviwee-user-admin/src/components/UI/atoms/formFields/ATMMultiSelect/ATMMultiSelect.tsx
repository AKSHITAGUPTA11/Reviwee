import React from "react";
// |-- External Dependencies --|
import Select from "react-select";
import type {
  FormatOptionLabelMeta,
  GroupBase,
  StylesConfig,
} from "react-select";
import { ErrorMessage } from "formik";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import makeAnimated from "react-select/animated";
import { IoMdAddCircle } from "react-icons/io";
import ATMFormLabel from "../ATMFormLabel";

export type Option = {
  label: string;
  value: string | number | string[];
};

type Props = {
  options: Option[] | any[];
  value?: Option[] | any[];
  onChange: (value: any) => void;
  isOptionEqualToValue?: (option: any, selected: any) => boolean;
  isSearchedOption?: (option: any, searchValue: string) => boolean;
  getOptionValue?: (option: any) => string;
  label?: string;
  required?: boolean;
  size?: "small" | "medium" | number;
  name: string;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  renderOption?: (
    option: Option | any,
    meta: FormatOptionLabelMeta<Option | any>
  ) => React.ReactNode;
  onBlur?: any;
  showAddButton?: boolean;
  onClickShareAddButton?: (newValue: boolean) => void;
}

const ATMMultiSelect = ({
  options,
  label = "",
  required = false,
  value,
  placeholder = `Select`,
  onChange,
  size = "small",
  name,
  isLoading = false,
  disabled = false,
  renderOption,
  isOptionEqualToValue,
  getOptionValue,
  isSearchedOption,
  showAddButton = false,
  onBlur,
  onClickShareAddButton
}: Props) => {
  const animatedComponents = makeAnimated();

  const customStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    option: (styles, { isDisabled, isFocused, isSelected }) => {
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

    menu: (styles) => {
      return {
        ...styles,
        minWidth: 250,
        zIndex: 10000,
      };
    },

    container: (styles) => {
      return {
        ...styles,
        minWidth: 250,
        width: "100%",
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

    valueContainer: (styles) => ({
      ...styles,
      border: "none",
      flexWrap: "nowrap",
      overflow: "scroll",
    }),

    multiValue: (styles) => ({
      ...styles,
      display: "flex",
    }),

    multiValueLabel: (styles) => ({
      ...styles,
      flex: 1,
    }),

    // Add any custom styles here if needed
  };

  return (
    <div className="relative bg-inherit">
      <div className="flex justify-between">
        <ATMFormLabel label={label} required={required} disabled={disabled} />
        {showAddButton && onClickShareAddButton && (
          <button
            type="button"
            className="ml-2 items-end font-bold text-blue-500 text-2xl cursor-pointer"
            onClick={() => {
              onClickShareAddButton(true)
            }}
          >
            <IoMdAddCircle/>
          </button>
        )}
      </div>
      <div className={label ? "mt-2" : ""}>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        isOptionSelected={isOptionEqualToValue}
        styles={customStyles}
        isMulti
        isDisabled={disabled}
        isClearable
        isLoading={isLoading}
        placeholder={placeholder}
        className="border-1 border-divider rounded "
        menuPosition="fixed"
        formatOptionLabel={renderOption}
        components={animatedComponents}
        classNamePrefix="atm-multi-select"
        getOptionValue={getOptionValue}
        filterOption={
          isSearchedOption
            ? (option, inputValue) =>
              isSearchedOption?.(option, inputValue?.toLowerCase())
            : undefined
        }
        onBlur={onBlur}
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
  );
};

export default ATMMultiSelect;
