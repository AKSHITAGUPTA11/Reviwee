import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import type { ProfileViewModel } from "src/models/Customer.model";

type Props = {
  profile: ProfileViewModel;
  onClose: () => void;
};

const renderValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) => (
  <div className="rounded border border-slate-200 bg-white p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 wrap-break-word text-sm font-medium text-slate-900">
      {renderValue(value)}
    </p>
  </div>
);

const ProfileDetailsDialog = ({ profile, onClose }: Props) => {
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Profile Details</DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem label="User ID" value={profile.userId} />
          <DetailItem label="User Name" value={profile.userName} />
          <DetailItem label="Business Name" value={profile.businessDisplayName} />
          <DetailItem label="Business ID" value={profile.businessId} />
          <DetailItem label="Business Description" value={profile.businessDescription} />
          <DetailItem label="Google Business Link" value={profile.googleBusinessLink} />
          <DetailItem label="Address" value={profile.addressLine} />
          <DetailItem label="Owner Label" value={profile.ownerLabel} />
          <DetailItem label="Category ID" value={profile.categoryId} />
          <DetailItem label="Category" value={profile.categoryName || profile.category} />
          <DetailItem label="Subcategory ID" value={profile.subCategoryId} />
          <DetailItem
            label="Subcategory"
            value={profile.subCategoryName || profile.subCategory}
          />
          <DetailItem label="Credit Config ID" value={profile.creditConfigId} />
          <DetailItem label="Per Request Credit" value={profile.perRequestCredit} />
          <DetailItem label="Min Words" value={profile.minWords} />
          <DetailItem label="Max Words" value={profile.maxWords} />
          <DetailItem label="Total Credits" value={profile.totalCredits} />
          <DetailItem label="Remaining Credits" value={profile.remainingCredits} />
          <DetailItem label="Business Aliases" value={profile.businessAliases} />
          <DetailItem label="SEO Keywords" value={profile.seoKeywords} />
          <DetailItem label="Owner" value={profile.owner} />
          <DetailItem label="Staff" value={profile.staff} />
          <DetailItem label="Languages" value={profile.languages} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsDialog;
