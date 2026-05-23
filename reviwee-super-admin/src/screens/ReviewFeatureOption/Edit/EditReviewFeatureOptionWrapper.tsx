import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { ReviewFeatureOptionEditFormValues } from "../../../models/ReviewFeatureOption.model";
import {
  useGetReviewFeatureOptionByIdQuery,
  useUpdateReviewFeatureOptionByIdMutation,
} from "../../../services/ReviewFeatureOptionService";
import ReviewFeatureOptionEditForm from "../Layouts/ReviewFeatureOptionEditForm";
import { applyMutationToast } from "../../../utils/validations/mutationToast";

type Props = {
  onClose: () => void;
  selectedReviewFeatureOptionId: string;
};

const validationSchema = object().shape({
  reviewFeatureId: string().required("Please select review feature"),
  featureOption: string().required("Please enter feature option"),
  language: string().required("Please select language"),
});

const EditReviewFeatureOptionWrapper = ({
  onClose,
  selectedReviewFeatureOptionId,
}: Props) => {
  const [item, setItem] = useState<ReviewFeatureOptionEditFormValues>({
    reviewFeatureId: "",
    featureOption: "",
    language: "english",
    
  });

  const [updateReviewFeatureOptionById] =
    useUpdateReviewFeatureOptionByIdMutation();
  const { data, isLoading, isFetching } = useGetReviewFeatureOptionByIdQuery(
    selectedReviewFeatureOptionId,
    { skip: !selectedReviewFeatureOptionId }
  );

  useEffect(() => {
    if (isLoading || isFetching || !selectedReviewFeatureOptionId) return;
    if (!data) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    

    setItem({
      reviewFeatureId: String(
        source.reviewFeatureId ?? source.review_feature_id ?? ""
      ),
      featureOption: String(source.featureOption ?? source.feature_option ?? ""),
      language: String(source.language ?? "english"),
     
    });
  }, [data, isFetching, isLoading, selectedReviewFeatureOptionId]);

  const handleSubmit = async (
    values: ReviewFeatureOptionEditFormValues,
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<ReviewFeatureOptionEditFormValues>
  ) => {
    const res = await updateReviewFeatureOptionById({
      id: selectedReviewFeatureOptionId,
      body: values,
    });

    if (applyMutationToast(res)) {
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
            <ReviewFeatureOptionEditForm
              formikProps={formikProps}
              onClose={onClose}
            />
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditReviewFeatureOptionWrapper;
