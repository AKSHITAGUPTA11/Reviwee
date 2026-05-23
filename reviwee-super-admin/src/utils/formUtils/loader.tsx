import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex space-x-2">
        <span className="w-3 h-3 bg-[#778FF0] rounded-full animate-bounce-dot"></span>
        <span className="w-3 h-3 bg-[#778FF0] rounded-full animate-bounce-dot animation-delay-150"></span>
        <span className="w-3 h-3 bg-[#778FF0] rounded-full animate-bounce-dot animation-delay-300"></span>
        <span className="w-3 h-3 bg-[#778FF0] rounded-full animate-bounce-dot animation-delay-450"></span>
      </div>

      <p className="mt-4 text-[#1C1A5E] text-lg font-semibold animate-pulse">
        Loading...
      </p>

      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.8;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        .animate-bounce-dot {
          animation: bounceDot 1.2s infinite ease-in-out;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-450 {
          animation-delay: 0.45s;
        }
      `}</style>
    </div>
  );
};

export default Loader;
