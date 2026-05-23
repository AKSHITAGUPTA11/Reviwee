import { useMemo } from "react";
import { FormikProvider, useFormik } from "formik";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import useStateList from "src/hooks/useState";
import type { BillingDetailsFormValues } from "src/models/Profile.model";

type Props = {
  open: boolean;
  initialValues: BillingDetailsFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: BillingDetailsFormValues) => Promise<void> | void;
};

type FieldKey = keyof BillingDetailsFormValues;

const FIELD_ORDER: FieldKey[] = [
  "gst_billing_name",
  "gst_number",
  "email",
  "mobile",
  "address_line1",
  "state",
  "city",
  "pincode",
];

const LABELS: Record<FieldKey, string> = {
  gst_billing_name: "Billing name",
  gst_number: "GST number (optional)",
  email: "Email",
  mobile: "Mobile",
  address_line1: "Address line 1",
  state: "State",
  city: "City",
  pincode: "Pincode",
};

const PLACEHOLDERS: Record<FieldKey, string> = {
  gst_billing_name: "Enter billing name",
  gst_number: "Enter GST number",
  email: "Enter email",
  mobile: "Enter mobile number",
  address_line1: "Enter billing address",
  state: "Enter state",
  city: "Enter city",
  pincode: "Enter pincode",
};

const BillingDetailsModal = ({
  open,
  initialValues,
  loading,
  onClose,
  onSubmit,
}: Props) => {
  const { state: stateList, isDataLoading } = useStateList();
  const formik = useFormik<BillingDetailsFormValues>({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const stateOptions = useMemo(
    () =>
      stateList.map((item) => {
        const optionValue = String(item?.key ?? item?.state ?? "").trim();
        return {
          label: optionValue,
          value: optionValue,
        };
      }).filter((option) => option.value),
    [stateList],
  );
  const selectedStateOption = stateOptions.find(
    (option) => option.value === formik.values.state,
  );

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 1800,
        "& .MuiBackdrop-root": { zIndex: 1799 },
        "& .MuiDialog-paper": { zIndex: 1800 },
      }}
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
        <DialogTitle className="pb-2">Billing details for GST invoice</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" className="mb-3 text-slate-600">
            We use these details for invoice generation after successful payment.
          </Typography>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELD_ORDER.map((fieldKey) => (
              <div
                key={fieldKey}
                className={fieldKey === "address_line1" ? "sm:col-span-2" : undefined}
              >
                {fieldKey === "state" ? (
                  <ATMSelect
                    name="state"
                    label={LABELS[fieldKey]}
                    placeholder="Select state"
                    options={stateOptions}
                    value={selectedStateOption ?? null}
                    onChange={(option) =>
                      formik.setFieldValue(fieldKey, option?.value ?? "")
                    }
                    isLoading={isDataLoading}
                    disabled={isDataLoading}
                  />
                ) : (
                  <ATMTextField
                    name={fieldKey}
                    label={LABELS[fieldKey]}
                    placeholder={PLACEHOLDERS[fieldKey]}
                    value={formik.values[fieldKey]}
                    onChange={(e) => formik.setFieldValue(fieldKey, e.target.value)}
                    onBlur={formik.handleBlur}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "var(--primary-main)", "&:hover": { bgcolor: "var(--primary-hover)" } }}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </DialogActions>
        </form>
      </FormikProvider>
    </Dialog>
  );
};

export default BillingDetailsModal;
