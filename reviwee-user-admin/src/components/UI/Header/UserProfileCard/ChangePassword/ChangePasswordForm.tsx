import type { FormikProps } from "formik";
import { MdClose } from "react-icons/md";
import type { ChangePasswordFormValues } from "../../../../../models/ChangePassword.model";
import ATMPassword from "../../../atoms/formFields/ATMPassword/ATMPassword";
import ATMLoadingButton from "../../../atoms/ATMLoadingButton/ATMLoadingButton";

type Props = {
  formikProps: FormikProps<ChangePasswordFormValues>;
  onClose: () => void;
  formType?: "ADD" | "EDIT";
};

const ChangePasswordForm = ({ formikProps, onClose }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur } = formikProps;

  return (
    <div className="p-4 flex flex-col gap-6 max-h-[90vh] min-h-0">
      <div className="sticky top-0 z-10 bg-white shrink-0 border-b border-divider pb-4 flex justify-between items-center">
        <div className="text-xl font-medium text-slate-700 mobile-typo-card-title">Update Password</div>
        <button
          type="button"
          className="p-2 -m-2 rounded hover:bg-gray-100 text-slate-600 hover:text-slate-800"
          onClick={onClose}
          aria-label="Close"
        >
          <MdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {/* Old Password */}
        <div>
          <ATMPassword
            name="currentPassword"
            required
            value={values.currentPassword}
            onChange={(e) => setFieldValue("currentPassword", e.target.value)}
            label="Current password"
            placeholder="Enter current password"
            onBlur={handleBlur}
          />
        </div>

        {/* New Password */}
        <div>
          <ATMPassword
            name="newPassword"
            required
            value={values.newPassword}
            onChange={(e) => setFieldValue("newPassword", e.target.value)}
            label="New password"
            placeholder="Enter new password"
            onBlur={handleBlur}
          />
        </div>
      </div>
      <div className="shrink-0">
        <ATMLoadingButton isLoading={isSubmitting} type="submit">
          Save
        </ATMLoadingButton>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
