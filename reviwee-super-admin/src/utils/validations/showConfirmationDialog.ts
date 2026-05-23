import Swal from "sweetalert2";
import type { SweetAlertIcon, SweetAlertResult } from "sweetalert2";

type Props = {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  showCancelButton?: boolean;
  width?: number;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  confirmButtonText?: string;
  next?: (result: SweetAlertResult<string>) => void;
};

export const showConfirmationDialog = ({
  title,
  width,
  text,
  icon = "warning",
  showCancelButton = false,
  confirmButtonColor = "#1C1A5E",
  cancelButtonColor = "#778FF0",
  confirmButtonText = "Yes",
  next = () => {},
}: Props) => {
  return Swal.fire({
    title,
    width: width || 450,
    text,
    icon,
    showCancelButton,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    customClass: {
      popup: 'my-swal-popup',
      container: 'swal-modal-z-index',
    },
  }).then(next);
};
