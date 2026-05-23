import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

const ATMIconButton = ({ children, onClick, className = "" }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center border border-gray-500 rounded w-8 h-8 
        active:scale-95 active:bg-blue-200 active:ring active:ring-blue-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default ATMIconButton;
