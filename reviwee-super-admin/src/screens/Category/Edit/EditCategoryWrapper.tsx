import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { CategoryFormValues } from "../../../models/Category.model";
import {
  useGetCategoryByIdQuery,
  useUpdateCategoryByIdMutation,
} from "../../../services/CategoryService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import CategoryForm from "../Layouts/CategoryForm";

type Props = {
  onClose: () => void;
  selectedCategoryId: string;
};

const validationSchema = object().shape({
  categoryName: string().required("Please enter category name"),
});

const EditCategoryWrapper = ({ onClose, selectedCategoryId }: Props) => {
  const [item, setItem] = useState<CategoryFormValues>({
    categoryName: "",
    description: "",
  });

  const [updateCategoryById] = useUpdateCategoryByIdMutation();
  const { data, isLoading, isFetching } = useGetCategoryByIdQuery(
    selectedCategoryId,
    { skip: !selectedCategoryId }
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    setItem({
      categoryName: String(source.categoryName ?? source.category_name ?? ""),
      description: String(source.description ?? ""),
    });
  }, [data, isFetching, isLoading]);

  const handleSubmit = async (
    values: CategoryFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CategoryFormValues>
  ) => {
    const response = await updateCategoryById({
      id: selectedCategoryId,
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
            <CategoryForm
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

export default EditCategoryWrapper;
