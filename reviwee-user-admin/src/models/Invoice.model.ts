export type InvoiceListItem = {
  _id?: string;
  id?: string;
  invoiceId?: string;
  userName?: string;
  email?: string;
  invoiceNumber?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  date?: string;
  planName?: string;
  planPrice?: number | string;
  subTotal?: number | string;
  gstPercentage?: number | string;
  gstAmount?: number | string;
  taxableAmount?: number | string;
  totalAmount?: number | string;
  grandTotal?: number | string;
  cgst?: number | string;
  sgst?: number | string;
  igst?: number | string;
  paymentStatus?: string;
  status?: string;
  downloadUrl?: string;
  invoiceUrl?: string;
  pdfUrl?: string;
  gstDetails?: {
    gstNumber?: string;
    mobile?: string;
    address?: string;
    state?: string;
    city?: string;
    pincode?: string;
  };
  invoiceSellerDetails?: {
    sellerName?: string;
    brandName?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    };
    taxDetails?: {
      gstNumber?: string;
      gstStateCode?: string;
    };
    bankDetails?: {
      accountHolderName?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      swiftCode?: string;
      UPI?: string;
    };
  };
};
