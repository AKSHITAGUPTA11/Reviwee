import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { number, object, string } from "yup";
import { format } from "date-fns";
import type { CustomerSubscriptionRenewPayload } from "src/models/CustomerSubscription.model";
import { useRenewCustomerSubscriptionMutation } from "src/services/CustomerSubscriptionService";
import ATMFormLayout from "src/components/UI/atoms/ATMFormLayout";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMDatePicker from "src/components/UI/atoms/formFields/ATMDatePicker/ATMDatePicker";
import { applyMutationToast } from "src/utils/validations/mutationToast";
import type { SubscriptionListItem } from "./SubscriptionList";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FLAT", label: "Flat" },
];

type Props = {
  subscription: SubscriptionListItem;
  onClose: () => void;
};

const RenewCustomerSubscriptionDialog = ({
  subscription,
  onClose,
}: Props) => {
  const [renewCustomerSubscription] = useRenewCustomerSubscriptionMutation();

  const today = format(new Date(), "yyyy-MM-dd");
  const planPrice = Number(subscription.planPrice) || 0;

  const getAmountAfterDiscount = (
    basePrice: number,
    discountType: string,
    discountValue: string
  ) => {
    const val = Number(discountValue) || 0;
    if (discountType === "PERCENTAGE") {
      return Math.max(0, basePrice - (basePrice * val) / 100);
    }
    if (discountType === "FLAT") {
      return Math.max(0, basePrice - val);
    }
    return basePrice;
  };

  const initialValues: CustomerSubscriptionRenewPayload & { dueAmt: number } = {
    planStartDate: today,
    paymentMode: "OFFLINE",
    discountType: "NONE",
    discountValue: "0",
    receivedAmt: planPrice,
    dueAmt: 0,
    dueDate: "",
  };

  const validationSchema = object().shape({
    planStartDate: string().required("Please select start date"),
    receivedAmt: number().min(0, "Amount must be >= 0"),
    dueAmt: number().min(0, "Amount must be >= 0"),
    dueDate: string().when("dueAmt", {
      is: (val: number) => val > 0,
      then: (schema) => schema.required("Due date is required when due amount > 0"),
      otherwise: (schema) => schema,
    }),
  });

  const handleSubmit = async (
    values: CustomerSubscriptionRenewPayload & { dueAmt: number },
    { setSubmitting }: FormikHelpers<CustomerSubscriptionRenewPayload & { dueAmt: number }>
  ) => {
    const { dueAmt: _dueAmt, ...apiPayload } = values;
    const response = await renewCustomerSubscription({
      id: subscription.id,
      body: apiPayload,
    });
    if (applyMutationToast(response)) {
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
          <ATMFormLayout
            title="Renew Subscription"
            onClose={onClose}
            onSubmit={formikProps.handleSubmit}
            isLoading={formikProps.isSubmitting}
            submitButtonText="Renew"
            showCancelButton
          >
            <div className="flex flex-col gap-4">
              <div>
                <ATMTextField
                  name="planPrice"
                  label="Plan Price"
                  value={`₹${planPrice}`}
                  disabled
                  onChange={() => {}}
                />
              </div>
              <div>
                <ATMDatePicker
                  name="planStartDate"
                  label="Plan Start Date"
                  required
                  value={formikProps.values.planStartDate}
                  onChange={(val) =>
                    formikProps.setFieldValue(
                      "planStartDate",
                      val ? format(new Date(val), "yyyy-MM-dd") : ""
                    )
                  }
                  format="yyyy-MM-dd"
                />
              </div>
              <div>
                <ATMSelect
                  name="discountType"
                  label="Discount Type"
                  options={DISCOUNT_TYPE_OPTIONS}
                  value={
                    DISCOUNT_TYPE_OPTIONS.find(
                      (o) => o.value === formikProps.values.discountType
                    ) || null
                  }
                  onChange={(option) => {
                    const type = (option?.value as CustomerSubscriptionRenewPayload["discountType"]) ?? "NONE";
                    formikProps.setFieldValue("discountType", type);
                    if (type === "NONE") {
                      formikProps.setFieldValue("discountValue", "0");
                    }
                    const effectivePrice = getAmountAfterDiscount(planPrice, type, formikProps.values.discountValue);
                    formikProps.setFieldValue("receivedAmt", effectivePrice);
                    formikProps.setFieldValue("dueAmt", 0);
                    formikProps.setFieldValue("dueDate", "");
                  }}
                />
              </div>
              {formikProps.values.discountType !== "NONE" && (
                <div>
                  <ATMTextField
                    name="discountValue"
                    label="Discount Value"
                    value={formikProps.values.discountValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      formikProps.setFieldValue("discountValue", val);
                      const effectivePrice = getAmountAfterDiscount(
                        planPrice,
                        formikProps.values.discountType,
                        val
                      );
                      formikProps.setFieldValue("receivedAmt", effectivePrice);
                      formikProps.setFieldValue("dueAmt", 0);
                      formikProps.setFieldValue("dueDate", "");
                    }}
                  />
                </div>
              )}
              <div>
                <ATMTextField
                  name="amtAfterDiscount"
                  label="Amount After Discount"
                  value={`₹${getAmountAfterDiscount(
                    planPrice,
                    formikProps.values.discountType,
                    formikProps.values.discountValue
                  )}`}
                  disabled
                  onChange={() => {}}
                />
              </div>
              <div>
                <ATMTextField
                  name="receivedAmt"
                  label="Received Amount"
                  type="number"
                  value={String(formikProps.values.receivedAmt ?? "")}
                  onChange={(e) => {
                    const received = e.target.value ? Number(e.target.value) : 0;
                    const effectivePrice = getAmountAfterDiscount(
                      planPrice,
                      formikProps.values.discountType,
                      formikProps.values.discountValue
                    );
                    formikProps.setFieldValue("receivedAmt", received);
                    const due = Math.max(0, effectivePrice - received);
                    formikProps.setFieldValue("dueAmt", due);
                    if (due === 0) {
                      formikProps.setFieldValue("dueDate", "");
                    }
                  }}
                />
              </div>
              <div>
                <ATMTextField
                  name="dueAmt"
                  label="Due Amount"
                  type="number"
                  value={String(formikProps.values.dueAmt ?? "")}
                  disabled
                  onChange={() => {}}
                />
              </div>
              <div>
                <ATMDatePicker
                  name="dueDate"
                  label="Due Date"
                  required
                  value={formikProps.values.dueDate || null}
                  onChange={(val) =>
                    formikProps.setFieldValue(
                      "dueDate",
                      val ? format(new Date(val), "yyyy-MM-dd") : ""
                    )
                  }
                  format="yyyy-MM-dd"
                />
              </div>
            </div>
          </ATMFormLayout>
        )}
      </Formik>
    </Dialog>
  );
};

export default RenewCustomerSubscriptionDialog;
