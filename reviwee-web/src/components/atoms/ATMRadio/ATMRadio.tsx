import { ErrorMessage } from "formik";
import React from "react";

interface ATMRadioProps {
  label?: string;
  name: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const ATMRadio: React.FC<ATMRadioProps> = ({
  label,
  name,
  value,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={selectedValue === value}
          onChange={() => onChange(value)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        {label && (
          <span className={`ml-2 text-sm ${disabled ? "opacity-70" : ""}`}>
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
      )}    </div>
  );
};

export default ATMRadio;
