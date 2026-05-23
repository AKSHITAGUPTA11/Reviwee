import { ErrorMessage } from "formik";
import {
  getHours,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import { useRef, useEffect, useState } from "react";
import ATMFormLabel from "../ATMFormLabel";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const AMPM_OPTIONS = ["AM", "PM"];

type ATMTimePickerPropType = {
  label?: string;
  value: Date | null;
  onChange: (e: Date | null) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  showSeconds?: boolean;
};

const ScrollPicker = ({
  options,
  value,
  onChange,
}: {
  options: (string | number)[];
  value: string | number;
  onChange: (val: string | number) => void;
}) => {
  return (
    <div className="max-h-[180px] overflow-y-auto min-w-[60px]">
      {options.map((opt) => (
        <div
          key={opt}
          className={`py-2 text-center cursor-pointer hover:bg-blue-100 ${
            String(opt) === String(value)
              ? "bg-blue-200 font-medium"
              : ""
          }`}
          onClick={() => onChange(opt)}
        >
          {String(opt).padStart(2, "0")}
        </div>
      ))}
    </div>
  );
};

const ATMTimePicker = ({
  label = "",
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  name,
  showSeconds = false,
}: ATMTimePickerPropType) => {
  const [openPicker, setOpenPicker] = useState<
    "hour" | "minute" | "second" | "ampm" | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Outside click close
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPicker(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const getParsedValues = () => {
    if (!value) {
      return {
        hour: 12,
        minute: "00",
        second: "00",
        ampm: "AM",
      };
    }

    const d = new Date(value);
    const hour24 = getHours(d);
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    return {
      hour: hour12,
      minute: String(getMinutes(d)).padStart(2, "0"),
      second: String(getSeconds(d)).padStart(2, "0"),
      ampm: hour24 >= 12 ? "PM" : "AM",
    };
  };

  const parsed = getParsedValues();

  const buildDate = (
    hour: number,
    minute: string,
    second: string,
    ampm: string
  ): Date => {
    let hour24 = hour;

    if (ampm === "PM" && hour !== 12) hour24 += 12;
    if (ampm === "AM" && hour === 12) hour24 = 0;

    const base = value ? new Date(value) : new Date();
    return setSeconds(
      setMinutes(setHours(base, hour24), parseInt(minute, 10)),
      parseInt(second, 10)
    );
  };

  const handleChange = (
    field: "hour" | "minute" | "second" | "ampm",
    val: string | number
  ) => {
    if (disabled || readOnly) return;

    const newHour = field === "hour" ? Number(val) : parsed.hour;
    const newMinute =
      field === "minute" ? String(val) : parsed.minute;
    const newSecond =
      field === "second" ? String(val) : parsed.second;
    const newAmpm =
      field === "ampm" ? String(val) : parsed.ampm;

    const newDate = buildDate(
      newHour,
      newMinute,
      newSecond,
      newAmpm
    );

    onChange(newDate);
    setOpenPicker(null);
  };

  const isDisabled = disabled || readOnly;

  return (
    <div className="relative w-full" ref={containerRef}>
      <ATMFormLabel label={label} required={required} />

      <div className={`${label ? "mt-2 " : ""}flex items-center border border-[var(--divider)] rounded-[var(--radius-sm)] px-2 h-[42px] bg-white gap-1`}>
        {/* Hour */}
        <div className="relative w-[50px]">
          <button
            type="button"
            disabled={isDisabled}
            className="w-full text-left"
            onClick={() =>
              setOpenPicker(openPicker === "hour" ? null : "hour")
            }
          >
            {String(parsed.hour).padStart(2, "0")}
          </button>

          {openPicker === "hour" && (
            <div className="absolute top-full mt-1 bg-white border rounded shadow z-50">
              <ScrollPicker
                options={HOUR_OPTIONS}
                value={parsed.hour}
                onChange={(v) => handleChange("hour", v)}
              />
            </div>
          )}
        </div>

        <span>:</span>

        {/* Minute */}
        <div className="relative w-[60px]">
          <button
            type="button"
            disabled={isDisabled}
            className="w-full text-left"
            onClick={() =>
              setOpenPicker(openPicker === "minute" ? null : "minute")
            }
          >
            {parsed.minute}
          </button>

          {openPicker === "minute" && (
            <div className="absolute top-full mt-1 bg-white border rounded shadow z-50">
              <ScrollPicker
                options={MINUTE_OPTIONS}
                value={parsed.minute}
                onChange={(v) => handleChange("minute", v)}
              />
            </div>
          )}
        </div>

        {showSeconds && (
          <>
            <span>:</span>
            <div className="relative w-[60px]">
              <button
                type="button"
                disabled={isDisabled}
                className="w-full text-left"
                onClick={() =>
                  setOpenPicker(openPicker === "second" ? null : "second")
                }
              >
                {parsed.second}
              </button>

              {openPicker === "second" && (
                <div className="absolute top-full mt-1 bg-white border rounded shadow z-50">
                  <ScrollPicker
                    options={SECOND_OPTIONS}
                    value={parsed.second}
                    onChange={(v) =>
                      handleChange("second", v)
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* AMPM */}
        <div className="relative w-[70px] ml-2">
          <button
            type="button"
            disabled={isDisabled}
            className="w-full text-left"
            onClick={() =>
              setOpenPicker(openPicker === "ampm" ? null : "ampm")
            }
          >
            {parsed.ampm}
          </button>

          {openPicker === "ampm" && (
            <div className="absolute top-full mt-1 bg-white border rounded shadow z-50">
              <ScrollPicker
                options={AMPM_OPTIONS}
                value={parsed.ampm}
                onChange={(v) =>
                  handleChange("ampm", v)
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Absolute Positioned Error */}
      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="absolute text-red-500 text-sm mt-1">
              {errMsg}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMTimePicker;
