import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { number, object, string } from "yup";
import { format } from "date-fns";
import type { CustomerSubscriptionAddPayload } from "src/models/CustomerSubscription.model";
import { useAddCustomerSubscriptionMutation } from "src/services/CustomerSubscriptionService";
import { useGetAllSubscriptionPlanDataQuery } from "src/services/SubscriptionPlanService";
import ATMFormLayout from "src/components/UI/atoms/ATMFormLayout";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMDatePicker from "src/components/UI/atoms/formFields/ATMDatePicker/ATMDatePicker";
import { applyMutationToast } from "src/utils/validations/mutationToast";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FLAT", label: "Flat" },
];

type Props = {
  customerId: string;
  onClose: () => void;
};

const AddCustomerSubscriptionDialog = ({ customerId, onClose }: Props) => {
  const [addCustomerSubscription] = useAddCustomerSubscriptionMutation();
  const { data: plansData } = useGetAllSubscriptionPlanDataQuery({
    params: ["planName"],
    searchValue: "",
    dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
    rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
    orderBy: "createdAt",
    orderByValue: -1,
    limit: 100,
    page: 1,
    filterBy: [{ fieldName: "", value: [] }],
    isPaginationRequired: false,
  });

  const plansList =
    Array.isArray(plansData?.data) && plansData.data.length > 0
      ? plansData.data
      : [];

  const planOptions = plansList.map((p: Record<string, unknown>) => ({
    value: String(p.id ?? p._id ?? ""),
    label: String(p.planName ?? p.plan_name ?? "Unknown"),
  }));

  const getPlanPrice = (planId: string) => {
    const plan = plansList.find(
      (p: Record<string, unknown>) =>
        String(p.id ?? p._id ?? "") === planId
    ) as Record<string, unknown> | undefined;
    return Number(plan?.planPrice ?? plan?.plan_price ?? 0);
  };

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

  const today = format(new Date(), "yyyy-MM-dd");

  const initialValues: CustomerSubscriptionAddPayload & { dueAmt: number } = {
    customerId,
    subscriptionPlanId: "",
    planStartDate: today,
    discountType: "NONE",
    discountValue: "0",
    receivedAmt: 0,
    dueAmt: 0,
    dueDate: today,
    paymentMode: "OFFLINE",
  };

  const validationSchema = object().shape({
    subscriptionPlanId: string().required("Please select a plan"),
    planStartDate: string().required("Please select start date"),
    receivedAmt: number().min(0, "Amount must be >= 0"),
    dueAmt: number().min(0, "Amount must be >= 0"),
    dueDate: string().when("dueAmt", {
      is: (val: number) => val > 0,
      then: (schema) =>
        schema.required("Due date is required when due amount > 0"),
      otherwise: (schema) => schema,
    }),
  });

  const handleSubmit = async (
    values: CustomerSubscriptionAddPayload & { dueAmt: number },
    { setSubmitting, resetForm }: FormikHelpers<CustomerSubscriptionAddPayload & { dueAmt: number }>
  ) => {
    const { dueAmt: _dueAmt, ...apiPayload } = values;
    const response = await addCustomerSubscription(apiPayload);
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
          <ATMFormLayout
            title="Add Subscription"
            onClose={onClose}
            onSubmit={formikProps.handleSubmit}
            isLoading={formikProps.isSubmitting}
            submitButtonText="Add Subscription"
            showCancelButton
          >
            <div className="flex flex-col gap-4">
              <div>
                <ATMSelect
                  name="subscriptionPlanId"
                  label="Subscription Plan"
                  required
                  options={planOptions}
                  value={
                    planOptions.find(
                      (o: { value: string; label: string }) =>
                        o.value === formikProps.values.subscriptionPlanId
                    ) || null
                  }
                  onChange={(option) => {
                    const planId = option?.value ?? "";
                    formikProps.setFieldValue("subscriptionPlanId", planId);
                    const basePrice = getPlanPrice(planId);
                    const effectivePrice = getAmountAfterDiscount(
                      basePrice,
                      formikProps.values.discountType,
                      formikProps.values.discountValue
                    );
                    formikProps.setFieldValue("receivedAmt", effectivePrice);
                    formikProps.setFieldValue("dueAmt", 0);
                    formikProps.setFieldValue("dueDate", "");
                  }}
                />
              </div>
              {formikProps.values.subscriptionPlanId && (
                <div>
                  <ATMTextField
                    name="planPrice"
                    label="Plan Price"
                    value={`₹${getPlanPrice(formikProps.values.subscriptionPlanId)}`}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              )}
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
                    const type = (option?.value as CustomerSubscriptionAddPayload["discountType"]) ?? "NONE";
                    formikProps.setFieldValue("discountType", type);
                    if (type === "NONE") {
                      formikProps.setFieldValue("discountValue", "0");
                    }
                    const basePrice = getPlanPrice(formikProps.values.subscriptionPlanId);
                    const effectivePrice = getAmountAfterDiscount(basePrice, type, formikProps.values.discountValue);
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
                      const basePrice = getPlanPrice(formikProps.values.subscriptionPlanId);
                      const effectivePrice = getAmountAfterDiscount(
                        basePrice,
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
              {formikProps.values.subscriptionPlanId && (
                <div>
                  <ATMTextField
                    name="amtAfterDiscount"
                    label="Amount After Discount"
                    value={`₹${getAmountAfterDiscount(
                      getPlanPrice(formikProps.values.subscriptionPlanId),
                      formikProps.values.discountType,
                      formikProps.values.discountValue
                    )}`}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              )}
              <div>
                <ATMTextField
                  name="receivedAmt"
                  label="Received Amount"
                  type="number"
                  value={String(formikProps.values.receivedAmt ?? "")}
                  onChange={(e) => {
                    const received = e.target.value ? Number(e.target.value) : 0;
                    const basePrice = getPlanPrice(formikProps.values.subscriptionPlanId);
                    const effectivePrice = getAmountAfterDiscount(
                      basePrice,
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
                  value={formikProps.values.dueDate}
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

export default AddCustomerSubscriptionDialog;
