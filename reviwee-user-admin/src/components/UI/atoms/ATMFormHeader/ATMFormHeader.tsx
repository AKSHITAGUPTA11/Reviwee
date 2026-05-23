import { MdClose } from "react-icons/md";

type Props = {
  title: string;
  onClose: () => void;
  className?: string;
};

const ATMFormHeader = ({ title, onClose, className = "" }: Props) => {
  return (
    <div
      className={`sticky top-0 z-10 bg-white shrink-0 border-b border-divider pb-4 flex justify-between items-center ${className}`}
    >
      <div className="text-base sm:text-lg lg:text-xl font-medium text-slate-700 mobile-typo-card-title">
        {title}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 -m-2 rounded hover:bg-gray-100 text-slate-600 hover:text-slate-800 transition-colors"
        aria-label="Close"
      >
        <MdClose size={24} />
      </button>
    </div>
  );
};

export default ATMFormHeader;
