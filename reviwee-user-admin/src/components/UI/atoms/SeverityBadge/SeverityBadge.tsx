
type Props = {
  severity: "Low" | "Medium" | "High" | "Critical" | string;
  className?: string;
};

const SeverityBadge = ({ severity, className = "" }: Props) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-primary-light-bg text-primary-dark border-primary-border";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityStyles(
        severity
      )} ${className}`}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;
