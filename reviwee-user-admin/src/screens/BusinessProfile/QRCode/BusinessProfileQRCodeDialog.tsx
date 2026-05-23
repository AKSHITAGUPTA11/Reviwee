import { MdClose } from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import BusinessProfileQRCode from "../../../components/BusinessProfileQRCode/BusinessProfileQRCode";

type Props = {
  open: boolean;
  onClose: () => void;
  businessId: string;
  businessDisplayName?: string;
};

const BusinessProfileQRCodeDialog = ({
  open,
  onClose,
  businessId,
  businessDisplayName,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>QR Code - {businessDisplayName || "Business Profile"}</span>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="flex flex-col items-center pb-6">
        <p className="mb-4 text-center text-sm text-slate-600">
          Scan this QR code to open the business profile on Reviwee app
        </p>
        <BusinessProfileQRCode
          businessId={businessId}
          businessDisplayName={businessDisplayName}
          size={220}
          showDownload
        />
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProfileQRCodeDialog;
