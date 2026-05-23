import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { number, object, string } from "yup";
import type { SubscriptionPlanFormValues } from "../../../models/SubscriptionPlan.model";
import {
  useGetSubscriptionPlanByIdQuery,
  useUpdateSubscriptionPlanByIdMutation,
} from "../../../services/SubscriptionPlanService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SubscriptionPlanForm from "../Layouts/SubscriptionPlanForm";

type Props = {
  onClose: () => void;
  selectedSubscriptionPlanId: string;
};

const validationSchema = object().shape({
  planName: string().required("Please enter plan name"),
  planPrice: number()
    .required("Please enter plan price")
    .min(0, "Price must be greater than or equal to 0"),
  planDuration: string().required("Please select plan duration"),
  credits: number()
    .required("Please enter credits")
    .min(0, "Credits must be greater than or equal to 0"),
});

const EditSubscriptionPlanWrapper = ({
  onClose,
  selectedSubscriptionPlanId,
}: Props) => {
  const [item, setItem] = useState<SubscriptionPlanFormValues>({
    planName: "",
    description: "",
    planPrice: 0,
    planDuration: "MONTHLY",
    credits: 0,
  });

  const [updateSubscriptionPlanById] = useUpdateSubscriptionPlanByIdMutation();
  const { data, isLoading, isFetching } = useGetSubscriptionPlanByIdQuery(
    selectedSubscriptionPlanId,
    { skip: !selectedSubscriptionPlanId }
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    const price = source.planPrice ?? source.plan_price;
    const creditsVal = source.credits;
    setItem({
      planName: String(source.planName ?? source.plan_name ?? ""),
      description: String(source.description ?? ""),
      planPrice: typeof price === "number" ? price : Number(price) || 0,
      planDuration: String(
        source.planDuration ?? source.plan_duration ?? "MONTHLY"
      ),
      credits:
        typeof creditsVal === "number"
          ? creditsVal
          : Number(creditsVal) || 0,
    });
  }, [data, isFetching, isLoading]);

  const handleSubmit = async (
    values: SubscriptionPlanFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SubscriptionPlanFormValues>
  ) => {
    const response = await updateSubscriptionPlanById({
      id: selectedSubscriptionPlanId,
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
            <SubscriptionPlanForm
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

export default EditSubscriptionPlanWrapper;
