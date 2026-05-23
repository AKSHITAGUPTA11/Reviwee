import { ErrorMessage } from "formik";
import { twMerge } from "tailwind-merge";

type Props = {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean, value: string) => void;
  value?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  extraClasses?: string;
  inputClasses?: string;
};

const ATMCheckbox = ({
  name,
  checked,
  onChange,
  value,
  label,
  disabled = false,
  required: _required = false,
  extraClasses = "",
  inputClasses = "",
}: Props) => {
  return (
    <div className={twMerge(`relative ${extraClasses}`)}>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          value={value}
          onChange={(e) => onChange(e.target.checked, e.target.value)}
          className={twMerge(`w-5 h-5 rounded ${inputClasses} cursor-pointer`)}
          disabled={disabled}
        />
        {label && (
          <span
            className={twMerge(
              `ml-2 mobile-typo-small-labels ${disabled ? "text-slate-300" : "text-slate-600"}`
            )}
          >
            {label}
          </span>
        )}
      </label>

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

export default ATMCheckbox;
