import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Formik, type FormikHelpers } from "formik";
import type { BusinessProfileFormValues } from "../../../models/BusinessProfile.model";
import { businessProfileFormValidationSchema } from "../utils/businessProfileFormValidation";
import {
  useGetBusinessProfileByIdQuery,
  useUpdateBusinessProfileByIdMutation,
} from "../../../services/BusinessProfileService";
import BusinessProfileForm from "../Layouts/BusinessProfileForm";
import { mapApiToBusinessProfileFormValues } from "../utils/mapApiToBusinessProfileFormValues";
import {
  getApiMessage,
  showToast,
} from "../../../utils/validations/showToaster";

type Props = {
  businessId: string;
  onCancel: () => void;
  onSuccess?: () => void;
};

const emptyItem: BusinessProfileFormValues = {
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

const EditBusinessProfileWrapper = ({
  businessId,
  onCancel,
  onSuccess,
}: Props) => {
  const [item, setItem] = useState<BusinessProfileFormValues>(emptyItem);
  const afterSave = onSuccess ?? onCancel;

  const [updateBusinessProfileById] = useUpdateBusinessProfileByIdMutation();
  const { data, isLoading, isFetching } = useGetBusinessProfileByIdQuery(
    businessId,
    { skip: !businessId }
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    const source = (data?.data || data || {}) as Record<string, unknown>;
    setItem(mapApiToBusinessProfileFormValues(source));
  }, [data, isFetching, isLoading]);

  const handleSubmit = async (
    values: BusinessProfileFormValues,
    { setSubmitting, resetForm }: FormikHelpers<BusinessProfileFormValues>
  ) => {
    const response = await updateBusinessProfileById({
      id: businessId,
      body: values,
    });
    if ("error" in response) {
      showToast(
        "error",
        getApiMessage(response, "Failed to update business profile")
      );
      setSubmitting(false);
      return;
    }
    showToast(
      "success",
      getApiMessage(response.data, "Business profile updated successfully")
    );
    resetForm();
    afterSave();
    setSubmitting(false);
  };

  return (
    <div className="relative">
      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-10 flex min-h-[240px] items-center justify-center rounded-2xl bg-white/70">
          <CircularProgress />
        </div>
      )}
      <Formik
        enableReinitialize
        initialValues={item}
        validationSchema={businessProfileFormValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <BusinessProfileForm
            formikProps={formikProps}
            onClose={onCancel}
            formType="EDIT"
            embedded
            embeddedVariant="page"
          />
        )}
      </Formik>
    </div>
  );
};

export default EditBusinessProfileWrapper;
