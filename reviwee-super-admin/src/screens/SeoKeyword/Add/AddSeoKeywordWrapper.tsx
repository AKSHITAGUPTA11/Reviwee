import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, string, array } from "yup";
import type { SeoKeywordFormValues } from "../../../models/SeoKeyword.model";
import { useAddSeoKeywordMutation } from "../../../services/SeoKeywordService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SeoKeywordForm from "../Layouts/SeoKeywordForm";

type Props = {
  onClose: () => void;
};

const initialValues: SeoKeywordFormValues = {
  categoryId: "",
  subCategoryId: "",
  keywordList: [],
};

const validationSchema = object().shape({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  keywordList: array()
    .of(string())
    .min(1, "Please add at least one SEO keyword"),
});

const AddSeoKeywordWrapper = ({ onClose }: Props) => {
  const [addSeoKeyword] = useAddSeoKeywordMutation();

  const handleSubmit = async (
    values: SeoKeywordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SeoKeywordFormValues>
  ) => {
    const body =
    {
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      keywordList: values.keywordList,
    }

    const response = await addSeoKeyword(body);
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
          <SeoKeywordForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddSeoKeywordWrapper;
