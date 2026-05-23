import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { boolean, number, object } from "yup";
import type { CreditConfigFormValues } from "../../../models/CreditConfig.model";
import {
  useGetCreditConfigByIdQuery,
  useUpdateCreditConfigByIdMutation,
} from "../../../services/CreditConfigService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import CreditConfigForm from "../Layouts/CreditConfigForm";

type Props = {
  onClose: () => void;
  selectedCreditConfigId: string;
};

const validationSchema = object().shape({
  credit: number()
    .required("Credit score is required")
    .min(0, "Must be 0 or greater"),
  minWords: number()
    .required("Min words is required")
    .integer("Must be a whole number")
    .min(0, "Must be 0 or greater"),
  maxWords: number()
    .required("Max words is required")
    .integer("Must be a whole number")
    .min(0, "Must be 0 or greater"),
  isDefault: boolean(),
});

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toBool = (v: unknown) => {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1) return true;
  if (v === "false" || v === 0) return false;
  return Boolean(v);
};

const EditCreditConfigWrapper = ({ onClose, selectedCreditConfigId }: Props) => {
  const [item, setItem] = useState<CreditConfigFormValues>({
    credit: 0,
    minWords: 0,
    maxWords: 0,
    isDefault: false,
  });

  const [updateCreditConfigById] = useUpdateCreditConfigByIdMutation();
  const { data, isLoading, isFetching } = useGetCreditConfigByIdQuery(
    selectedCreditConfigId,
    { skip: !selectedCreditConfigId }
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    setItem({
      credit: toNum(source.credit ?? source.credit_score),
      minWords: toNum(source.minWords ?? source.min_words),
      maxWords: toNum(source.maxWords ?? source.max_words),
      isDefault: toBool(source.isDefault ?? source.is_default),
    });
  }, [data, isFetching, isLoading]);

  const handleSubmit = async (
    values: CreditConfigFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CreditConfigFormValues>
  ) => {
    const response = await updateCreditConfigById({
      id: selectedCreditConfigId,
      body: values,
    });
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        enableReinitialize
        initialValues={item}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <>
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/60">
                <CircularProgress />
              </div>
            )}
            <CreditConfigForm
              formikProps={formikProps}
              onClose={onClose}
              formType="EDIT"
            />
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditCreditConfigWrapper;
