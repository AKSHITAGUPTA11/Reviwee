import { ErrorMessage } from "formik";
import ATMFormLabel from "../ATMFormLabel";

type Props = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  minRows?: number;
  name?: string;
  disabled?:boolean
};

const ATMTextArea = ({
  label,
  required = false,
  value,
  onChange,
  className,
  placeholder,
  minRows = 2,
  name = "",
  disabled=false
}: Props) => {
  return (
    <div className="relative ">
      <ATMFormLabel label={label} required={required} disabled={disabled} />
      <textarea 
      disabled={disabled}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={minRows}
        className={`app-textarea w-full p-2 bg-white text-slate-700 ${disabled && "opacity-40 bg-gray-300"} ${
          label ? "mt-2" : ""
        } ${className || ""}`}
        placeholder={placeholder}
      />

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

export default ATMTextArea;
