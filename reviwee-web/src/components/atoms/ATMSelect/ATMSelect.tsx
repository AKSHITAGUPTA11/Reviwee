import { ErrorMessage } from "formik";
import type { ReactNode } from "react";
import Select from "react-select";
import type {
  SingleValue,
  MultiValue,
  StylesConfig,
  FormatOptionLabelMeta,
} from "react-select";

export type Option = {
  value: string;
  label: string;
};

export type ATMSelectProps = {
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  value: Option | Option[] | null;
  isMulti?: boolean;
  onChange: (selected: SingleValue<Option> | MultiValue<Option>) => void;
  renderOption?: (
    option: Option,
    meta: FormatOptionLabelMeta<Option>
  ) => ReactNode;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  size?: "small" | "medium";
  onBlur?: React.FocusEventHandler;
};

const ATMSelect: React.FC<ATMSelectProps> = ({
  label,
  name,
  required = false,
  options,
  value,
  onChange,
  renderOption,
  disabled = false,
  placeholder = "Select...",
  isMulti = false,
  searchable = true,
  size = "medium",
  onBlur,
}) => {
  const customStyles: StylesConfig<Option, boolean> = {
    container: (styles) => ({
      ...styles,
      minWidth: size === "small" ? 200 : 300,
    }),
    control: (styles, { isFocused }) => ({
      ...styles,
      border: isFocused ? "2px solid var(--primary-dark)" : "1px solid #ccc",
      boxShadow: "none",
      minHeight: size === "small" ? 32 : 40,
    }),
    option: (styles, { isSelected, isFocused }) => ({
      ...styles,
      backgroundColor: isSelected
        ? "var(--primary-light)"
        : isFocused
        ? "var(--surface)"
        : "white",
      color: isSelected ? "black" : "inherit",
    }),
    menu: (styles) => ({
      ...styles,
      zIndex: 9999,
    }),
  };

  return (
    <div className="relative w-full">
      {label && (
        <label
          className={`text-slate-700 font-medium text-sm ${
            disabled && "opacity-70"
          } `}
        >
          {label} {required && <span className="text-red-500"> * </span>}
        </label>
      )}

      <Select
        name={name}
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={onChange}
        isDisabled={disabled}
        placeholder={placeholder}
        styles={customStyles}
        formatOptionLabel={renderOption}
        isClearable
        isSearchable={searchable}
        onBlur={onBlur}
      />

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
              {" "}
              {errMsg}{" "}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMSelect;
