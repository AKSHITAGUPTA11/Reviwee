import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { SubcategoryFormValues } from "../../../models/Subcategory.model";
import {
  useGetSubcategoryByIdQuery,
  useUpdateSubcategoryByIdMutation,
} from "../../../services/SubcategoryService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SubcategoryForm from "../Layouts/SubcategoryForm";

type Props = {
  onClose: () => void;
  selectedSubcategoryId: string;
};

const validationSchema = object().shape({
  subCategoryName: string().required("Please enter subcategory name"),
  categoryId: string().required("Please select category"),
});

const EditSubcategoryWrapper = ({
  onClose,
  selectedSubcategoryId,
}: Props) => {
  const [item, setItem] = useState<SubcategoryFormValues>({
    subCategoryName: "",
    description: "",
    categoryId: "",
    ownerLabel:""
  });

  const [updateSubcategoryById] = useUpdateSubcategoryByIdMutation();
  const { data, isLoading, isFetching } = useGetSubcategoryByIdQuery(
    selectedSubcategoryId,
    { skip: !selectedSubcategoryId }
  );
  useEffect(() => {
    if (isLoading || isFetching || !selectedSubcategoryId) return;
    if (!data) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    setItem({
      subCategoryName: String(source.subCategoryName ?? source.subcategory_name ?? ""),
      ownerLabel: String(source.ownerLabel ??""),
      description: String(source.description ?? ""),
      categoryId: String(source.categoryId ?? source.category_id ?? ""),
    });
  }, [data, isFetching, isLoading, selectedSubcategoryId]);

  const handleSubmit = async (
    values: SubcategoryFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SubcategoryFormValues>
  ) => {
    const response = await updateSubcategoryById({
      id: selectedSubcategoryId,
      body: values,
    });
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open maxWidth="sm" fullWidth>
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
            <SubcategoryForm
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

export default EditSubcategoryWrapper;
