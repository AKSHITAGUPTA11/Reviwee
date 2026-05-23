import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import type { Size } from "src/utils/formUtils/getInputHeight";

import ClipLoader from "react-spinners/ClipLoader";
import ATMFormLabel from "../ATMFormLabel";

type Props = {
  size?: Size;
  label?: string;
  required?: boolean;
  placeholder?: string;
  selectedFile: any;
  disabled?: boolean;
  initiateUpload: () => void;
  uploadedFile: any;
};

const ATMFileUploader = ({
  size = "small",
  label = "",
  required = false,
  placeholder = "Select Image",
  selectedFile,
  disabled: _disabled = false,
  initiateUpload,
  uploadedFile,
}: Props) => {
  return (
    <div>
      <ATMFormLabel label={label} required={required} />
      <button
        type="button"
        onClick={() => {
          initiateUpload();
        }}
        className={`flex items-center px-2 w-full border-[2.5px] border-slate-400 border-dashed rounded bg-white ${getInputHeight(
          size
        )} ${label && "mt-2"} text-slate-400`}
      >
        {selectedFile ? (
          <div className="overflow-x-auto py-2 text-slate-900 font-medium ">
            {selectedFile.name || "ABC"}
          </div>
        ) : (
          placeholder
        )}
      </button>

      <div className="w-full h-[150px] mt-1 border rounded shadow">
        {uploadedFile ? (
          <div className="flex justify-center  mt-[3rem]">
            {" "}
            <ClipLoader
              color={"blue"}
              size={40}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : selectedFile?.type === "DOCUMENT" ? (
          <iframe src={selectedFile.url} title="Docs" />
        ) : (
          <img
            src={selectedFile}
            alt=""
            className="w-full h-full rounded"
          />
        )}
      </div>
    </div>
  );
};

export default ATMFileUploader;
