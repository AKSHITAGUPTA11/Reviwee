import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { number, object, string } from "yup";
import { format } from "date-fns";
import { useMemo, useEffect } from "react";
import type { CustomerSubscriptionPaymentInPayload } from "src/models/CustomerSubscription.model";
import {
  usePaymentInCustomerSubscriptionMutation,
  useGetCustomerSubscriptionListQuery,
} from "src/services/CustomerSubscriptionService";
import ATMFormLayout from "src/components/UI/atoms/ATMFormLayout";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMDatePicker from "src/components/UI/atoms/formFields/ATMDatePicker/ATMDatePicker";
import { applyMutationToast } from "src/utils/validations/mutationToast";
import { showToast } from "src/utils/validations/showToaster";

type SubscriptionWithDue = {
  id: string;
  planName: string;
  dueAmt: number;
};

type Props = {
  customerId: string;
  totalDueAmt: number;
  onClose: () => void;
};

const PaymentInDialog = ({
  customerId,
  totalDueAmt,
  onClose,
}: Props) => {
  const [paymentIn] = usePaymentInCustomerSubscriptionMutation();

  const listPayload = useMemo(
    () => ({
      params: ["planName", "customerName"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1 as const,
      limit: 100,
      page: 1,
      filterBy: [{ fieldName: "customerId", value: [customerId] }],
      isPaginationRequired: false,
    }),
    [customerId]
  );

  const {
    data: subscriptionData,
    isLoading: isSubscriptionLoading,
  } = useGetCustomerSubscriptionListQuery(listPayload, {
    skip: !customerId,
  });

  const subscriptionsWithDue: SubscriptionWithDue[] = useMemo(() => {
    const source = subscriptionData?.data ?? [];
    if (!Array.isArray(source)) return [];
    return source
      .filter(
        (s: Record<string, unknown>) =>
          Number(s.dueAmt ?? s.due_amt ?? 0) > 0
      )
      .map((s: Record<string, unknown>) => ({
        id: String(s.id ?? s._id ?? ""),
        planName: String(s.planName ?? s.plan_name ?? "Unknown"),
        dueAmt: Number(s.dueAmt ?? s.due_amt ?? 0),
      }));
  }, [subscriptionData]);

  const defaultSubscription = subscriptionsWithDue[0];
  const today = format(new Date(), "yyyy-MM-dd");

  const initialValues = {
    subscriptionId: defaultSubscription?.id ?? "",
    receivedAmt: totalDueAmt ?? 0,
    dueAmt: 0,
    dueDate: "",
    remark: "",
  };

  const validationSchema = object().shape({
    receivedAmt: number()
      .min(0.01, "Received amount must be greater than 0")
      .required("Received amount is required"),
    dueAmt: number().min(0, "Due amount cannot be negative"),
    dueDate: string().when("dueAmt", {
      is: (val: number) => val > 0,
      then: (schema) =>
        schema.required("Due date is required when due amount > 0"),
      otherwise: (schema) => schema,
    }),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    const payload: CustomerSubscriptionPaymentInPayload = {
      receivedAmt: values.receivedAmt,
      dueAmt: values.dueAmt,
      dueDate: values.dueAmt > 0 ? values.dueDate : today,
      remark: values.remark || undefined,
    };
    const response = await paymentIn({
      id: values.subscriptionId,
      body: payload,
    });
    if (applyMutationToast(response)) {
      onClose();
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (
      !isSubscriptionLoading &&
      subscriptionsWithDue.length === 0 &&
      customerId
    ) {
      showToast("error", "No subscription with due amount found");
      onClose();
    }
  }, [
    isSubscriptionLoading,
    subscriptionsWithDue.length,
    customerId,
    onClose,
  ]);

  if (isSubscriptionLoading) {
    return (
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <div className="flex items-center justify-center p-8">
          <span className="text-slate-500">Loading...</span>
        </div>
      </Dialog>
    );
  }

  if (subscriptionsWithDue.length === 0) {
    return null;
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <ATMFormLayout
            title="Payment In"
            onClose={onClose}
            onSubmit={formikProps.handleSubmit}
            isLoading={formikProps.isSubmitting}
            submitButtonText="Record Payment"
            showCancelButton
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                Total Due: ₹{(totalDueAmt ?? 0).toLocaleString()}
              </div>

              <div>
                <ATMTextField
                  name="receivedAmt"
                  label="Received Amount"
                  required
                  type="number"
                  value={String(formikProps.values.receivedAmt ?? "")}
                  onChange={(e) => {
                    const received = e.target.value
                      ? Number(e.target.value)
                      : 0;
                    const due = Math.max(0, totalDueAmt - received);
                    formikProps.setFieldValue("receivedAmt", received);
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
                  label="Remaining Due"
                  type="number"
                  value={String(formikProps.values.dueAmt ?? "")}
                  disabled
                  onChange={() => {}}
                />
              </div>

              {formikProps.values.dueAmt > 0 && (
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
              )}

              <div>
                <ATMTextField
                  name="remark"
                  label="Remark"
                  value={formikProps.values.remark}
                  onChange={(e) =>
                    formikProps.setFieldValue("remark", e.target.value)
                  }
                />
              </div>
            </div>
          </ATMFormLayout>
        )}
      </Formik>
    </Dialog>
  );
};

export default PaymentInDialog;
