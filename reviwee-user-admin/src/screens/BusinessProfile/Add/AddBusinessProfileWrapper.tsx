import { Formik, type FormikHelpers } from "formik";
import type { BusinessProfileFormValues } from "../../../models/BusinessProfile.model";
import { businessProfileFormValidationSchema } from "../utils/businessProfileFormValidation";
import { useAddBusinessProfileMutation } from "../../../services/BusinessProfileService";
import {
  getApiMessage,
  showToast,
} from "../../../utils/validations/showToaster";
import BusinessProfileForm from "../Layouts/BusinessProfileForm";

type Props = {
  onCancel: () => void;
  /** Called after successful save (defaults to onCancel). */
  onSuccess?: () => void;
  prefill?: {
    businessDisplayName?: string;
    googleBusinessLink?: string;
    address?: string;
  };
};

const initialValues: BusinessProfileFormValues = {
  categoryId: "",
  subCategoryId: "",
  businessDisplayName: "",
  googleBusinessLink: "",
  creditConfigId: "",
  businessAliases: [],
  tags: [],
  businessDescription: "",
  address: {
    address: "",
    localLocationAliases: [],
  },
  owner: [],
  staff: [],
};

const AddBusinessProfileWrapper = ({ onCancel, onSuccess, prefill }: Props) => {
  const [addBusinessProfile] = useAddBusinessProfileMutation();
  const afterSave = onSuccess ?? onCancel;
  const resolvedInitialValues: BusinessProfileFormValues = {
    ...initialValues,
    businessDisplayName: prefill?.businessDisplayName?.trim() || "",
    googleBusinessLink: prefill?.googleBusinessLink?.trim() || "",
    address: {
      ...initialValues.address,
      address: prefill?.address?.trim() || "",
    },
  };

  const handleSubmit = async (
    values: BusinessProfileFormValues,
    { setSubmitting, resetForm }: FormikHelpers<BusinessProfileFormValues>
  ) => {
    const response = await addBusinessProfile(values);
    if ("error" in response) {
      showToast(
        "error",
        getApiMessage(response, "Failed to add business profile")
      );
      setSubmitting(false);
      return;
    }
    showToast(
      "success",
      getApiMessage(response.data, "Business profile added successfully")
    );
    resetForm();
    afterSave();
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={resolvedInitialValues}
      enableReinitialize
      validationSchema={businessProfileFormValidationSchema}
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <BusinessProfileForm
          formikProps={formikProps}
          onClose={onCancel}
          formType="ADD"
          embedded
          embeddedVariant="page"
        />
      )}
    </Formik>
  );
};

export default AddBusinessProfileWrapper;
