import { useCallback } from "react";

type UseFileUploaderOptions = {
  next: (file: File) => void;
  accept?: string;
};

export default function useFileUploader({ next, accept = "*" }: UseFileUploaderOptions) {
  const initiateUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        next(file);
      }
      input.remove();
    };
    document.body.appendChild(input);
    input.click();
  }, [accept, next]);

  return {
    initiateUpload,
    uploadedFile: null as File | null,
  };
}
