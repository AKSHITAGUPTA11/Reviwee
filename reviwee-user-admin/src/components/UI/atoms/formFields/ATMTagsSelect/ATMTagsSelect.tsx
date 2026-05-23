import { useMemo } from "react";
import ATMFormLabel from "../ATMFormLabel";

export type TagsSelectOption = {
  label: string;
  value: string;
};

export type ATMTagsSelectProps = {
  /** Option values may be strings or numbers at runtime (API); they are coerced to string. */
  options: TagsSelectOption[] | { label?: unknown; value?: unknown }[];
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  max?: number;
  maxContainerHeight?: number;
};

const asTrimmed = (x: unknown) => String(x ?? "").trim();

const pillDisplay = (stored: unknown, options: TagsSelectOption[]) => {
  const st = asTrimmed(stored);
  const match = options.find((o) => {
    const ov = asTrimmed(o.value);
    const ol = asTrimmed(o.label);
    return ov === st || ol.toLowerCase() === st.toLowerCase();
  });
  return match?.label ?? st;
};

const optionIsUsed = (stored: unknown[], o: TagsSelectOption) => {
  const ol = asTrimmed(o.label);
  const ov = asTrimmed(o.value);
  return stored.some((v) => {
    const vt = asTrimmed(v);
    if (!vt) return false;
    if (vt === ov) return true;
    if (vt.toLowerCase() === ol.toLowerCase()) return true;
    if (vt.toLowerCase() === ov.toLowerCase()) return true;
    return false;
  });
};

const normalizeOptions = (
  raw: ATMTagsSelectProps["options"]
): TagsSelectOption[] =>
  raw
    .map((o) => {
      const row = o as { label?: unknown; value?: unknown };
      const label = asTrimmed(row.label);
      const value = asTrimmed(row.value);
      return {
        label: label || value,
        value: value || label,
      };
    })
    .filter((o) => o.value);

const ATMTagsSelect = ({
  options,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  placeholder = "Select to add",
  isLoading = false,
  max = Infinity,
  maxContainerHeight = 150,
}: ATMTagsSelectProps) => {
  const safeOptions = useMemo(() => normalizeOptions(options), [options]);

  const availableOptions = useMemo(
    () => safeOptions.filter((o) => !optionIsUsed(value, o)),
    [safeOptions, value]
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addValue = (v: string) => {
    if (!v || value.length >= max) return;
    const opt = safeOptions.find((o) => o.value === v);
    if (opt && optionIsUsed(value, opt)) return;
    onChange([...value, v]);
  };

  /** Do not disable when there are no choices left — user should still open the list (e.g. "All selected" / empty API). */
  const selectDisabled = disabled || isLoading;

  return (
    <>
      <ATMFormLabel
        label={label}
        required={required}
        extraClasses="text-slate-500"
      />
      <div
        className={`min-h-[42px] flex flex-wrap gap-2 border border-(--divider) rounded(--radius-sm) p-2 overflow-y-auto overflow-x-hidden w-full items-start ${label ? "mt-2" : ""} ${disabled ? "opacity-60" : ""}`}
        style={{ maxHeight: maxContainerHeight }}
      >
        {value.map((v, index) => (
          <div
            key={`${asTrimmed(v)}-${index}`}
            className="flex gap-3 items-center rounded-full bg-slate-300 p-1 px-2 text-sm h-[25px]"
          >
            <div>{pillDisplay(v, safeOptions)}</div>
            <button
              type="button"
              aria-label="Remove"
              disabled={disabled}
              onClick={() => !disabled && removeAt(index)}
              className={`${!disabled ? "cursor-pointer" : ""} h-[20px] w-[20px] flex justify-center items-center rounded-full bg-slate-100 border-0 p-0 text-sm leading-none`}
            >
              x
            </button>
          </div>
        ))}

        {!disabled && (
          <div className="flex flex-auto min-w-[120px] max-w-full">
            <select
              className="border-none outline-none flex-1 w-full min-w-0 bg-transparent py-1 px-0 text-sm text-slate-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              value=""
              disabled={selectDisabled}
              onChange={(e) => {
                const v = e.target.value;
                if (v) {
                  addValue(v);
                  e.target.value = "";
                }
              }}
            >
              <option value="">
                {isLoading
                  ? "Loading..."
                  : availableOptions.length === 0
                    ? value.length > 0
                      ? "All selected"
                      : placeholder
                    : placeholder}
              </option>
              {availableOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};

export default ATMTagsSelect;
