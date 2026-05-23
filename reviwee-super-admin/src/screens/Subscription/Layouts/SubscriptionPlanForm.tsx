import type { FormikProps } from "formik";
import type { SubscriptionPlanFormValues } from "../../../models/SubscriptionPlan.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMTextArea from "../../../components/UI/atoms/formFields/ATMTextArea/ATMTextArea";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";

const PLAN_DURATION_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "YEARLY", label: "Yearly" },
];

type Props = {
  formikProps: FormikProps<SubscriptionPlanFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const SubscriptionPlanForm = ({ formikProps, onClose, formType }: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;

  return (
    <ATMFormLayout
      title={formType === "ADD" ? "Add Subscription Plan" : "Edit Subscription Plan"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD" ? "Save Plan" : "Update Plan"
      }
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <div>
          <ATMTextField
            name="planName"
            label="Plan Name"
            required
            value={values.planName}
            onChange={(e) => setFieldValue("planName", e.target.value)}
          />
        </div>



        <div>
          <ATMTextField
            name="planPrice"
            label="Plan Price"
            required
            type="number"
            value={String(values.planPrice || "")}
            onChange={(e) =>
              setFieldValue("planPrice", e.target.value ? Number(e.target.value) : 0)
            }
          />
        </div>

        <div>
          <ATMTextField
            name="credits"
            label="Credits"
            required
            type="number"
            value={String(values.credits ?? "")}
            onChange={(e) =>
              setFieldValue("credits", e.target.value ? Number(e.target.value) : 0)
            }
          />
        </div>

        <div>
          <ATMSelect
            name="planDuration"
            label="Plan Duration"
            required
            options={PLAN_DURATION_OPTIONS}
            value={
              PLAN_DURATION_OPTIONS.find((o) => o.value === values.planDuration) ||
              null
            }
            onChange={(option) =>
              setFieldValue("planDuration", option?.value ?? "")
            }
          />
        </div>
        <div>
          <ATMTextArea
            name="description"
            label="Description"
            value={values.description}
            onChange={(val) => setFieldValue("description", val)}
            placeholder="Enter plan description"
            minRows={3}
          />
        </div>
      </div>
    </ATMFormLayout>
  );
};

export default SubscriptionPlanForm;
