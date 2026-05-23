import type { FormikProps } from "formik";
import type { ReviewFeatureOptionEditFormValues } from "../../../models/ReviewFeatureOption.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import useReviewFeatureOptions from "src/hooks/useReviewFeatureOptions";
import useLanguage from "src/hooks/useLaguage";

type Props = {
  formikProps: FormikProps<ReviewFeatureOptionEditFormValues>;
  onClose: () => void;
};

const ReviewFeatureOptionEditForm = ({ formikProps, onClose }: Props) => {

  const { language } = useLanguage();
  const laguageOptions = language.map((lag) => ({
    label: lag.languageName,
    value: lag.languageName,
  }));
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const { reviewFeature, isDataLoading: isReviewFeatureLoading } =
    useReviewFeatureOptions();

  const featureOptions = reviewFeature.map((f: any) => ({
    value: f._id ?? f.id,
    label: f.featureName ?? f.feature_name ?? f.features ?? "",
  }));

  const featureValue =
    values.reviewFeatureId && featureOptions.length > 0
      ? featureOptions.find((o) => o.value === values.reviewFeatureId) ?? null
      : null;

  const languageValue =
    values.language && laguageOptions.length > 0
      ? laguageOptions.find((o) => o.value === values.language) ?? null
      : null;

  return (
    <ATMFormLayout
      title="Edit Review Feature Option"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText="Update Review Feature Option"
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <ATMSelect
          name="reviewFeatureId"
          label="Review Feature"
          required
          options={featureOptions}
          isLoading={isReviewFeatureLoading}
          value={featureValue}
          onChange={(opt) => setFieldValue("reviewFeatureId", opt?.value ?? "")}
          placeholder="Select review feature"
        />

        <ATMTextField
          name="featureOption"
          label="Feature Option"
          value={values.featureOption}
          onChange={(e) => setFieldValue("featureOption", e.target.value)}
          placeholder="Enter feature option"
          required
        />

        <ATMSelect
          name="language"
          label="Language"
          required
          options={laguageOptions}
          value={languageValue}
          onChange={(opt) => setFieldValue("language", opt?.value ?? "")}
          placeholder="Select language"
        />

      
      </div>
    </ATMFormLayout>
  );
};

export default ReviewFeatureOptionEditForm;
