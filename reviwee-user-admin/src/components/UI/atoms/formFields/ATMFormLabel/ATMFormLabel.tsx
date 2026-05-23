import { twMerge } from "tailwind-merge";

type Props = {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  extraClasses?: string;
};

const ATMFormLabel = ({
  label,
  required = false,
  disabled = false,
  extraClasses = "",
}: Props) => {
  if (!label) return null;

  return (
    <label
      className={twMerge(
        "block text-slate-700 font-medium text-sm mobile-typo-small-labels",
        disabled && "opacity-70",
        extraClasses
      )}
    >
      {label} {required && <span className="text-red-500"> * </span>}
    </label>
  );
};

export default ATMFormLabel;
