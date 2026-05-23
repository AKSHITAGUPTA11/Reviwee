import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import { MdClose } from "react-icons/md";
import { format, parseISO, isValid } from "date-fns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ATMFormLabel from "../formFields/ATMFormLabel";
import ATMLoadingButton from "../ATMLoadingButton/ATMLoadingButton";

const toDate = (v: string | Date | undefined): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return isValid(v) ? v : null;
  const parsed = parseISO(v);
  return isValid(parsed) ? parsed : null;
};

export type DateFilterValue = {
  startDate: string;
  endDate: string;
  dateFilterKey: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
  onClear?: () => void;
};

const DateFilterModal = ({
  open,
  onClose,
  startDate,
  endDate,
  onApply,
  onClear,
}: Props) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  useEffect(() => {
    if (open) {
      setLocalStartDate(startDate);
      setLocalEndDate(endDate);
    }
  }, [open, startDate, endDate]);

  const handleStartDateChange = (value: Date | null) => {
    setLocalStartDate(value ? format(value, "yyyy-MM-dd") : "");
  };

  const handleEndDateChange = (value: Date | null) => {
    setLocalEndDate(value ? format(value, "yyyy-MM-dd") : "");
  };

  const handleApply = () => {
    onApply(localStartDate, localEndDate);
    onClose();
  };

  const handleClear = () => {
    onClear?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-lg p-4",
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Date Filter</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 text-slate-500 hover:text-slate-700"
            aria-label="Close"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <ATMFormLabel label="Start Date" />
            <div className="mt-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  format="MM/dd/yyyy"
                  value={toDate(localStartDate)}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      className: "bg-white",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div>
            <ATMFormLabel label="End Date" />
            <div className="mt-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  format="MM/dd/yyyy"
                  value={toDate(localEndDate)}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      className: "bg-white",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {onClear && (
            <ATMLoadingButton
              onClick={handleClear}
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Clear
            </ATMLoadingButton>
          )}
          <ATMLoadingButton onClick={handleApply}>Apply</ATMLoadingButton>
        </div>
      </div>
    </Dialog>
  );
};

export default DateFilterModal;
