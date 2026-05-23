import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { SeoKeywordEditFormValues } from "../../../models/SeoKeyword.model";
import {
  useGetSeoKeywordByIdQuery,
  useUpdateSeoKeywordByIdMutation,
} from "../../../services/SeoKeywordService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SeoKeywordEditForm from "../Layouts/SeoKeywordEditForm";

type Props = {
  onClose: () => void;
  selectedSeoKeywordId: string;
};

const validationSchema = object().shape({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  keyword: string().required("Please enter keyword"),
});

const EditSeoKeywordWrapper = ({
  onClose,
  selectedSeoKeywordId,
}: Props) => {
  const [item, setItem] = useState<SeoKeywordEditFormValues>({
    categoryId: "",
    subCategoryId: "",
    keyword: "",
  });

  const [updateSeoKeywordById] = useUpdateSeoKeywordByIdMutation();
  const { data, isLoading, isFetching } = useGetSeoKeywordByIdQuery(
    selectedSeoKeywordId,
    { skip: !selectedSeoKeywordId }
  );

  useEffect(() => {
    if (isLoading || isFetching || !selectedSeoKeywordId) return;
    if (!data) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    const rawKeyword = source.keyword ?? source.seo_keyword ?? source.seoKeywords ?? source.seo_keywords;
    const keyword = Array.isArray(rawKeyword)
      ? rawKeyword[0] ?? ""
      : rawKeyword != null
        ? String(rawKeyword)
        : "";

    setItem({
      categoryId: String(source.categoryId ?? source.category_id ?? ""),
      subCategoryId: String(source.subCategoryId ?? source.subcategory_id ?? ""),
      keyword,
    });
  }, [data, isFetching, isLoading, selectedSeoKeywordId]);

  const handleSubmit = async (
    values: SeoKeywordEditFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SeoKeywordEditFormValues>
  ) => {
    const body = {
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      keyword: values.keyword,
    };
    const response = await updateSeoKeywordById({
      id: selectedSeoKeywordId,
      body,
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
            <SeoKeywordEditForm formikProps={formikProps} onClose={onClose} />
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditSeoKeywordWrapper;
