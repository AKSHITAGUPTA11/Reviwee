import { Formik, type FormikHelpers } from "formik";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaRegStar } from "react-icons/fa";
import type { BusinessProfileFormValues } from "../../../models/BusinessProfile.model";
import { businessProfileFormValidationSchema } from "../../BusinessProfile/utils/businessProfileFormValidation";
import BusinessProfileForm from "../../BusinessProfile/Layouts/BusinessProfileForm";
import { useAddBusinessProfileMutation } from "../../../services/BusinessProfileService";
import { getApiMessage, showToast } from "../../../utils/validations/showToaster";

// Standalone onboarding page (no side-nav / back UI).
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

const OnboardingAddBusinessProfileWrapper = () => {
  const navigate = useNavigate();
  const [addBusinessProfile] = useAddBusinessProfileMutation();

  const handleSubmit = async (
    values: BusinessProfileFormValues,
    { setSubmitting, resetForm }: FormikHelpers<BusinessProfileFormValues>
  ) => {
    try {
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
      navigate("/dashboard", { replace: true });
    } catch (e) {
      showToast("error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-[#f6f8fc]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-size-[40px_40px]"
      />
      <div className="relative px-4 py-6 sm:px-8 sm:py-8">
        <header className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-main)] text-white shadow-lg shadow-[var(--primary-main)]/25">
              <FaRegStar className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Reviwee
              </p>
              <p className="text-xs text-slate-500">Admin onboarding</p>
            </div>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <div className="inline-flex w-fit max-w-full rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200/90">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <FaCheck className="h-3 w-3" aria-hidden />
                1 · Plan
              </span>
              <span className="rounded-full bg-[var(--primary-main)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                2 · Business profile
              </span>
            </div>
          </div>
        </header>

        <section className="relative mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_100%_-10%,rgba(119,143,240,0.12),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_110%,rgba(28,26,94,0.06),transparent_45%)]"
          />
          <div className="relative px-6 py-7 sm:px-10 sm:py-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Step 2 of 2
            </p>
            <h1 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add your business profile
            </h1>
            
          </div>
        </section>

        <div className="mx-auto mt-8 w-full max-w-5xl pb-10">
          <Formik
            initialValues={initialValues}
            validationSchema={businessProfileFormValidationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <BusinessProfileForm
                formikProps={formikProps}
                onClose={() => {}}
                formType="ADD"
                embedded
                embeddedVariant="onboarding"
                hideCancelButton
              />
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default OnboardingAddBusinessProfileWrapper;
