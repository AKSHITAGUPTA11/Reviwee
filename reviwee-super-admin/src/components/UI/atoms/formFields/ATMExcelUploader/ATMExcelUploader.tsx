import React, { useState } from "react";
import { getInputHeight } from "src/utils/formUtils/getInputHeight";
import type { Size } from "src/utils/formUtils/getInputHeight";
import { FaUpload, FaTimesCircle, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import ATMFormLabel from "../ATMFormLabel";

type Props = {
  size?: Size;
  label?: string;
  required?: boolean;
  placeholder?: string;
  selectedFile: File | null;
  disabled?: boolean;
  onSelect: (file: File | null) => void; // Formik setFieldValue
  previewRows?: number; // number of rows to show in preview
};

const ATMExcelUploader = ({
  size = "small",
  label = "",
  required = false,
  placeholder = "Upload Excel",
  selectedFile,
  disabled = false,
  onSelect,
  previewRows = 20,
}: Props) => {
  const [previewData, setPreviewData] = useState<any[][]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const file = e.currentTarget.files[0];

      // Read Excel
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const preview = (jsonData as any[][]).slice(0, previewRows);
        setPreviewData(preview);

        // Send file back to parent (Formik)
        onSelect(file);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      {/* Label */}
      <ATMFormLabel label={label} required={required} />

      {/* Upload Card */}
      <label
        className={`${label ? "mt-2 " : ""}flex flex-col gap-2 px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition
          ${selectedFile ? "border-primary-main bg-primary-light/30" : "border-gray-200"} 
          ${getInputHeight(size)}`}
        style={{ minHeight: "120px" }}
      >
        {!selectedFile ? (
          <>
            <FaUpload className="text-3xl text-gray-400 self-center" />
            <span className="text-gray-700 font-medium self-center">{placeholder}</span>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={disabled}
              onChange={handleFileChange}
            />
          </>
        ) : (
          <div className="flex flex-col h-full">
            {/* File Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 truncate">
                <FaFileExcel className="text-primary-main" />
                <span className="truncate font-medium text-primary-main">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 transition"
                onClick={() => {
                  onSelect(null);
                  setPreviewData([]);
                }}
              >
                <FaTimesCircle />
              </button>
            </div>

            {/* Preview Table inside the same card */}
             {previewData.length > 0 && (
              <div className="overflow-auto border rounded-md bg-white h-32">
                <table className="w-full text-sm text-left border-collapse">
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-none">
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-2 py-1 border-r last:border-none text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={disabled}
          onChange={handleFileChange}
        />
      </label>

      {/* Optional Preview Info */}
      {previewData.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Showing first {previewData.length} rows
        </p>
      )}
    </div>
  );
};

export default ATMExcelUploader;