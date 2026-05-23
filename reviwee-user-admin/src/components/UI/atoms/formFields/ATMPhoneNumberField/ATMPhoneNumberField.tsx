import React from "react";
import Select from "react-select";
import type { Options } from "react-select";
import { ErrorMessage } from "formik";
import ATMFormLabel from "../ATMFormLabel";

type CountryOption = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  required?: boolean;
  name: string;
  numberName: string;
  options: Options<CountryOption | any>;
  valueCountry: string;
  valueNumber: string;
  placeholder?: string;
  onCountryChange: (selectedOption: CountryOption | any) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
onNumberBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

};

const ATMPhoneNumberField: React.FC<Props> = ({
  label = "Phone number",
  required = false,
  name,
  numberName,
  options,
  valueCountry,
  valueNumber,
  placeholder = "Enter phone number",
  onCountryChange,
  onNumberChange,
  onNumberBlur,
  ...rest
}) => {
  // const { setFieldValue } = useFormikContext<any>();

  return (
    <div className="mb-4">
      <ATMFormLabel label={label} required={required} />

      <div className={`${label ? "mt-2 " : ""}form-field-focus flex w-full px-2 h-[42px] text-slate-700 border border-[var(--divider)] rounded-[var(--radius-sm)]`}>
        {/* Country Selector */}
        <div className="w-fit">
          <Select
            name={name}
            options={options}
            value={valueCountry}
            onChange={(option: any) => onCountryChange(option)}
            isSearchable
            classNamePrefix="react-select"
            menuPlacement="bottom"
            menuPosition="absolute"
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            className="text-slate-700"
            styles={{
              control: (base) => ({
                ...base,
                border: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                minHeight: "40px",
                height: "100%",
              }),
              valueContainer: (base) => ({
                ...base,
                padding: "0 8px",
              }),
              menu: (base) => ({
                ...base,
                width: "140px",
                zIndex: 9999,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-400 my-auto"></div>

        {/* Phone Number Field */}
        <div className="flex-1">
          <input
            name={numberName}
            value={valueNumber}
            onChange={(e) => {
              onNumberChange(e);
            }}
            placeholder={placeholder}
            onBlur={onNumberBlur}
            className="px-2 py-2 outline-none text-sm w-full placeholder-[#ADADAD] text-slate-700 bg-white"
            {...rest}
          />
        </div>
      </div>

      {/* Error messages */}
      <div className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
        {name && <ErrorMessage name={name} component="div" />}
        {numberName && <ErrorMessage name={numberName} component="div" />}
      </div>
    </div>
  );
};

export default ATMPhoneNumberField;
