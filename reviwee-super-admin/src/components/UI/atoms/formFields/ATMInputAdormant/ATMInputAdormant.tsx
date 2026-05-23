import { ErrorMessage } from "formik";
import React, { useState } from "react";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import type { Size } from "src/utils/formUtils/getInputHeight";
import { twMerge } from "tailwind-merge";
import ATMFormLabel from "../ATMFormLabel";

export interface ATMInputAdormantPropTypes {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  adormant: string | React.ReactNode;
  adormantProps: {
    position?: "start" | "end";
    onClick?: () => void;
    extraClasses?: string;
  };
  type?: "text" | "password" | "number";
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  size?: Size;
  inputProps?: { className: string };
}

const ATMInputAdormant = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  label,
  required = false,
  disabled = false,
  readonly = false,
  adormant,
  adormantProps = {
    position: "start",
  },
  size = "small",
  inputProps,
}: ATMInputAdormantPropTypes) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <div className="">
      <ATMFormLabel label={label} required={required} extraClasses="text-slate-500" />

      <div
        className={twMerge(
          `${getInputHeight(size)} w-full border border-[var(--divider)] rounded-[var(--radius-sm)] ${
            label ? "mt-2" : ""
          } flex ${isFocus ? "!border-[var(--focus-ring)] !shadow-[var(--control-focus-shadow)]" : ""} ${className} `
        )}
      >
        {adormantProps.position === "start" && (
          <div
            onClick={() => adormantProps.onClick && adormantProps.onClick()}
            className={twMerge(
              `w-[15%] h-full flex justify-center items-center bg-slate-300 rounded-l ${
                adormantProps.onClick && "cursor-pointer"
              } ${adormantProps.extraClasses}`
            )}
          >
            {adormant}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
          placeholder={placeholder}
          className={`w-full h-full p-1 text-slate-700 border-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 rounded ${inputProps?.className} `}
          disabled={disabled}
          readOnly={readonly}
          onFocus={() => {
            setIsFocus(true);
          }}
          onBlur={() => {
            setIsFocus(false);
          }}
        />

        {adormantProps.position === "end" && (
          <div
            onClick={() => adormantProps.onClick && adormantProps.onClick()}
            className={twMerge(
              `w-[15%] h-full flex justify-center items-center bg-slate-300 rounded-r ${
                adormantProps.onClick && "cursor-pointer"
              }  ${adormantProps.extraClasses}`
            )}
          >
            {adormant}
          </div>
        )}
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

export default ATMInputAdormant;
