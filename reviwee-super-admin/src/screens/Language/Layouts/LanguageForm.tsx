import type { FormikProps } from "formik";
import type { LanguageFormValues } from "../../../models/Language.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMTextArea from "../../../components/UI/atoms/formFields/ATMTextArea/ATMTextArea";

type Props = {
  formikProps: FormikProps<LanguageFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const LanguageForm = ({ formikProps, onClose, formType }: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;

  return (
    <ATMFormLayout
      title={formType === "ADD" ? "Add Language" : "Edit Language"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD" ? "Save Language" : "Update Language"
      }
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <div>
          <ATMTextField
            name="languageName"
            label="Language Name"
            required
            value={values.languageName}
            onChange={(e) => setFieldValue("languageName", e.target.value)}
          />
        </div>
        <div>
          <ATMTextArea
            name="languageDescription"
            label="Language Description"
            required
            value={values.languageDescription}
            onChange={(val) => setFieldValue("languageDescription", val)}
            placeholder="Enter language description"
            minRows={3}
          />
        </div>
      </div>
    </ATMFormLayout>
  );
};

export default LanguageForm;
