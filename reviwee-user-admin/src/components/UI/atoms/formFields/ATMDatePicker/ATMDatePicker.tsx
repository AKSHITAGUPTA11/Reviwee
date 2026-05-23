import { ErrorMessage } from "formik";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import type { Size } from "src/utils/formUtils/getInputHeight";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, isValid } from "date-fns";
import ATMFormLabel from "../ATMFormLabel";

const toDate = (v: string | Date | undefined): Date | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) return isValid(v) ? v : undefined;
  const parsed = parseISO(v);
  return isValid(parsed) ? parsed : new Date(v);
};

type Props = {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  format?: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  size?: Size;
  minDate?: string | Date;
  maxDate?: string;
};

const ATMDatePicker = ({
  label,
  name,
  required = false,
  value,
  onChange,
  format = "MM/dd/yyyy",
  size = "small",
  minDate,
  disabled = false,
  maxDate,
}: Props) => {
  return (
    <div className="relative">
      <ATMFormLabel label={label} required={required} />

      <div className={`${label ? "mt-2 " : ""}${getInputHeight(size)} flex items-center`}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
            disabled={disabled}
            format={format}
            value={toDate(value)}
            onChange={onChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className: "bg-white",
              },
            }}
            minDate={toDate(minDate)}
            maxDate={toDate(maxDate)}
          />
        </LocalizationProvider>
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

export default ATMDatePicker;
