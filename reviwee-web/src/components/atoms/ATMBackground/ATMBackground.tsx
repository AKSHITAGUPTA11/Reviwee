import type { ReactNode } from "react";
type ATMBackgroundProps = {
  children: ReactNode;
};
const ATMBackground: React.FC<ATMBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(66,133,244,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(52,168,83,0.06),transparent_35%)]" />
      <div className="relative w-full">{children}</div>
    </div>
  );
};
export default ATMBackground;
