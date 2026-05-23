import type { Size } from "src/utils/formUtils/getInputHeight";
import ATMFileUploader from "./ATMFileUploader";
import { ErrorMessage } from "formik";
import useFileUploader from "src/utils/useFileUploader";

type Props = {
  size?: Size;
  label?: string;
  required?: boolean;
  placeholder?: string;
  onSelect: (file: any) => void;
  selectedFile: any;
  name: string;
  accept?: string;
  disabled?: boolean;
  hideName?: boolean;
};

const ATMFilePickerWrapper = ({
  name,
  size = "small",
  label = "",
  required = false,
  placeholder = "",
  selectedFile,
  onSelect,
  disabled,
  accept = "*",
}: Props) => {
  const { initiateUpload, uploadedFile } = useFileUploader({
    next: (file: File) => {
      onSelect(file);
    },
    accept: accept,
  });
  return (
    <div className="relative">
      <ATMFileUploader
        size={size}
        label={label}
        required={required}
        placeholder={placeholder}
        selectedFile={selectedFile}
        disabled={disabled}
        initiateUpload={initiateUpload}
        uploadedFile={uploadedFile}
      />

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="font-poppins text-[14px] text-start mt-0 text-red-500">
              {errMsg}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMFilePickerWrapper;
