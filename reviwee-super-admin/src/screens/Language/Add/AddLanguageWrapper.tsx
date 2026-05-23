import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { LanguageFormValues } from "../../../models/Language.model";
import { useAddLanguageMutation } from "../../../services/LanguageService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import LanguageForm from "../Layouts/LanguageForm";

type Props = {
  onClose: () => void;
};

const initialValues: LanguageFormValues = {
  languageName: "",
  languageDescription: "",
};

const validationSchema = object().shape({
  languageName: string().required("Please enter language name"),
  languageDescription: string().required("Please enter language description"),
});

const AddLanguageWrapper = ({ onClose }: Props) => {
  const [addLanguage] = useAddLanguageMutation();

  const handleSubmit = async (
    values: LanguageFormValues,
    { setSubmitting, resetForm }: FormikHelpers<LanguageFormValues>
  ) => {
    const response = await addLanguage(values);
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <LanguageForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddLanguageWrapper;
