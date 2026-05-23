import type { ReactNode } from "react";
import ATMFormHeader from "../ATMFormHeader/ATMFormHeader";
import ATMLoadingButton from "../ATMLoadingButton/ATMLoadingButton";

export type ATMFormLayoutProps = {
  title: string;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  showCancelButton?: boolean;
};

const ATMFormLayout = ({
  title,
  onClose,
  onSubmit,
  children,
  submitButtonText = "Save",
  cancelButtonText = "Cancel",
  isLoading = false,
  showCancelButton = true,
}: ATMFormLayoutProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-[90vh] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white"
    >
      {/* Fixed Header - no scroll */}
      <div className="shrink-0 px-4 pt-4 md:px-6 md:pt-6">
        <ATMFormHeader title={title} onClose={onClose} />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6">
        {children}
      </div>

      {/* Fixed Footer - Save button bottom right */}
      <div className="shrink-0 border-t border-divider bg-white px-4 py-4 md:px-6">
        <div className="flex justify-end gap-2">
          {showCancelButton && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {cancelButtonText}
            </button>
          )}
          <ATMLoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Saving..."
            disabled={isLoading}
            className="w-auto!"
          >
            {submitButtonText}
          </ATMLoadingButton>
        </div>
      </div>
    </form>
  );
};

export default ATMFormLayout;
