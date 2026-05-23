import { ErrorMessage } from "formik";
import type React from "react";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import ATMFormLabel from "../ATMFormLabel";

export type ATMTextFieldPropTypes = {
  name: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
} & Omit<React.ComponentProps<"input">, "size">;

const ATMTextField = ({
  name,
  value,
  className = "bg-white",
  onChange,
  label,
  required,
  disabled = false,
  size = "small",
  ...rest
}: ATMTextFieldPropTypes) => {
  return (
    <div className="relative">
      <ATMFormLabel label={label} required={required} disabled={disabled} />
      <div className={label ? "mt-2" : ""}>
        <input
          disabled={disabled}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
          className={`${getInputHeight(
            size
          )} app-input px-2 w-full ${
            disabled && "opacity-70 bg-zinc-200 text-gray-950	"
          } ${className}`}
          {...rest}
        />
      </div>
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

export default ATMTextField;
