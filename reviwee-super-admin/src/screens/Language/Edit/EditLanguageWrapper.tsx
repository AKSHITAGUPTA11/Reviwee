import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { LanguageFormValues } from "../../../models/Language.model";
import {
  useGetLanguageByIdQuery,
  useUpdateLanguageByIdMutation,
} from "../../../services/LanguageService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import LanguageForm from "../Layouts/LanguageForm";

type Props = {
  onClose: () => void;
  selectedLanguageId: string;
};

const validationSchema = object().shape({
  languageName: string().required("Please enter language name"),
  languageDescription: string().required("Please enter language description"),
});

const EditLanguageWrapper = ({ onClose, selectedLanguageId }: Props) => {
  const [item, setItem] = useState<LanguageFormValues>({
    languageName: "",
    languageDescription: "",
  });

  const [updateLanguageById] = useUpdateLanguageByIdMutation();
  const { data, isLoading, isFetching } = useGetLanguageByIdQuery(
    selectedLanguageId,
    { skip: !selectedLanguageId }
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    setItem({
      languageName: String(source.languageName ?? source.language_name ?? ""),
      languageDescription: String(
        source.languageDescription ?? source.language_description ?? ""
      ),
    });
  }, [data, isFetching, isLoading]);

  const handleSubmit = async (
    values: LanguageFormValues,
    { setSubmitting, resetForm }: FormikHelpers<LanguageFormValues>
  ) => {
    const response = await updateLanguageById({
      id: selectedLanguageId,
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
            <LanguageForm
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

export default EditLanguageWrapper;
