import { ErrorMessage } from "formik";
import { useState } from "react";
import type { ComponentProps } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { twMerge } from "tailwind-merge";
import { getInputHeight } from "../../../../../utils/formUtils/getInputHeight";
import ATMFormLabel from "../ATMFormLabel";

type Props = {
  name: string;
  extraClasses?: string;
  label?: string;
  inputProps?: {
    extraClasses?: string;
  };
  iconProps?: {
    extraClasses?: string;
  };
  size?: "small" | "medium" | "large";
} & Omit<ComponentProps<"input">, "size">;

const ATMPassword = ({
  name,
  extraClasses = "",
  label,
  inputProps,
  iconProps,
  size = "small",
  ...rest
}: Props) => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isFocussed, setIsFocussed] = useState(false);

  return (
    <div className="relative">
      <ATMFormLabel label={label} required={rest.required} />

      <div
        className={twMerge(
          `${label ? "mt-2 " : ""}${getInputHeight(size)} flex items-center gap-2 app-input px-2 ${extraClasses} ${isFocussed ? "border-(--focus-ring)! shadow-(--control-focus-shadow)!" : ""}`,
        )}
      >
        <input
          name={name}
          type={isShowPassword ? "text" : "password"}
          className={twMerge(` border 
    outline-none 
    border-transparent ring-0
    focus:outline-none 
    focus:ring-0 
    focus:border-transparent
    rounded 
    h-full 
    flex-1 min-w-0 ${inputProps?.extraClasses}`)}
          onFocus={() => setIsFocussed(true)}
          onBlur={() => setIsFocussed(false)}
          {...rest}
        />

        <div
          onClick={() => setIsShowPassword((prev) => !prev)}
          className={twMerge(
            `shrink-0 text-xl text-slate-500 cursor-pointer ${iconProps?.extraClasses}`,
          )}
        >
          {isShowPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </div>
      </div>

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="mt-1 text-xs leading-snug text-red-500 wrap-break-word">
              {errMsg}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMPassword;
