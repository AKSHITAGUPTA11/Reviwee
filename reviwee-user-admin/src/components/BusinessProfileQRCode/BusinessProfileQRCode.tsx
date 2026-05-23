import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MdContentCopy, MdDownload, MdOpenInNew } from "react-icons/md";
import Button from "@mui/material/Button";
import { showToast } from "../../utils/validations/showToaster";

const Reviwee_WEB_BASE_URL =
  import.meta.env.VITE_APP_REVIEWEE_WEB_URL ||
  "https://go.reviwee.com";

type Props = {
  businessId: string;
  businessDisplayName?: string;
  size?: number;
  showDownload?: boolean;
};

const BusinessProfileQRCode = ({
  businessId,
  businessDisplayName = "Business",
  size = 200,
  showDownload = true,
}: Props) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrUrl = `${Reviwee_WEB_BASE_URL}/${encodeURIComponent(businessId)}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR-${businessDisplayName.replace(/\s+/g, "-")}-${businessId}.png`;
    link.click();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      showToast("success", "Link copied");
    } catch {
      const input = document.createElement("input");
      input.value = qrUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("success", "Link copied");
    }
  };

  const handleOpenLink = () => {
    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={qrRef} className="rounded-lg border border-slate-200 bg-white p-3">
        <QRCodeCanvas value={qrUrl} size={size} level="H" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showDownload && (
          <Button
            variant="contained"
            size="small"
            startIcon={<MdDownload size={18} />}
            onClick={handleDownload}
            sx={{ textTransform: "none" }}
          >
            Download QR Code
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<MdContentCopy size={16} />}
          onClick={handleCopyLink}
          sx={{ textTransform: "none" }}
        >
          Copy Link
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MdOpenInNew size={16} />}
          onClick={handleOpenLink}
          sx={{ textTransform: "none" }}
        >
          Open Link
        </Button>
      </div>
    </div>
  );
};

export default BusinessProfileQRCode;
