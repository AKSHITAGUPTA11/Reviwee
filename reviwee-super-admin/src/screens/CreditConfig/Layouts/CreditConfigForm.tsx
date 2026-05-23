import type { FormikProps } from "formik";
import type { CreditConfigFormValues } from "../../../models/CreditConfig.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMCheckbox from "../../../components/UI/atoms/formFields/ATMCheckbox/ATMCheckbox";

type Props = {
  formikProps: FormikProps<CreditConfigFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const CreditConfigForm = ({ formikProps, onClose, formType }: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;

  return (
    <ATMFormLayout
      title={formType === "ADD" ? "Add Credit Config" : "Edit Credit Config"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD" ? "Save" : "Update"
      }
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <div>
          <ATMTextField
            name="credit"
            label="Credit score"
            required
            type="number"
            value={String(values.credit ?? "")}
            onChange={(e) =>
              setFieldValue(
                "credit",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <ATMTextField
            name="minWords"
            label="Min words"
            required
            type="number"
            value={String(values.minWords ?? "")}
            onChange={(e) =>
              setFieldValue(
                "minWords",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <ATMTextField
            name="maxWords"
            label="Max words"
            required
            type="number"
            value={String(values.maxWords ?? "")}
            onChange={(e) =>
              setFieldValue(
                "maxWords",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
          />
        </div>
        {formType === "EDIT" && (
          <div>
            <ATMCheckbox
              name="isDefault"
              label="Default"
              checked={values.isDefault}
              onChange={(checked) => setFieldValue("isDefault", checked)}
            />
          </div>
        )}
      </div>
    </ATMFormLayout>
  );
};

export default CreditConfigForm;
