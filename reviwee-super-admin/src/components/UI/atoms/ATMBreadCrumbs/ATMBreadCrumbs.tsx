import { Breadcrumbs, Link } from "@mui/material";
import { FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export type BreadcrumbType = {
  label: string;
  onClick?: () => void;
  path?: string;
};

type Props = {
  breadcrumbs: BreadcrumbType[];
};

const ATMBreadCrumbs = ({ breadcrumbs }: Props) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      separator={<FiChevronRight className="text-xl" />}
      aria-label="breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, breadcrumbIndex) => (
        <Link
          underline={breadcrumb.path ? "hover" : "none"}
          key={breadcrumbIndex}
          color="inherit"
          onClick={() => {
           breadcrumb.onClick && breadcrumb.onClick();
            navigate(breadcrumb.path || "");
          }}
          className={breadcrumb.path && "cursor-pointer"}
        >
          {breadcrumb.label}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default ATMBreadCrumbs;
