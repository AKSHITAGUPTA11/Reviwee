import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { ReviewFeatureEditFormValues } from "../../../models/ReviewFeature.model";
import {
  useGetReviewFeatureByIdQuery,
  useUpdateReviewFeatureByIdMutation,
} from "../../../services/ReviewFeatureService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import ReviewFeatureForm from "../Layouts/ReviewFeatureForm";

type Props = {
  onClose: () => void;
  selectedReviewFeatureId: string;
};

const validationSchema = object().shape({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  featureName: string().required("Please enter feature name"),
});

const EditReviewFeatureWrapper = ({
  onClose,
  selectedReviewFeatureId,
}: Props) => {
  const [item, setItem] = useState<ReviewFeatureEditFormValues>({
    categoryId: "",
    subCategoryId: "",
    featureName: "",
  });

  const [updateReviewFeatureById] = useUpdateReviewFeatureByIdMutation();
  const { data, isLoading, isFetching } = useGetReviewFeatureByIdQuery(
    selectedReviewFeatureId,
    { skip: !selectedReviewFeatureId }
  );

  useEffect(() => {
    if (isLoading || isFetching || !selectedReviewFeatureId) return;
    if (!data) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    const featureName = String(
      source.featureName ?? source.feature_name ?? source.reviewFeatureName ?? ""
    );
    setItem({
      categoryId: String(source.categoryId ?? source.category_id ?? ""),
      subCategoryId: String(source.subCategoryId ?? source.subcategory_id ?? ""),
      featureName,
    });
  }, [data, isFetching, isLoading, selectedReviewFeatureId]);

  const handleSubmit = async (
    values: ReviewFeatureEditFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReviewFeatureEditFormValues>
  ) => {
    const response = await updateReviewFeatureById({
      id: selectedReviewFeatureId,
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
            <ReviewFeatureForm
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

export default EditReviewFeatureWrapper;
