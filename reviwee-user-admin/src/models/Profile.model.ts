export type ProfileFormValues = {
  name: string;
  mobile: string;
  email: string;
  gst_number?: string;
  gst_billing_name?: string;
  address_line1?: string;
  state?: string;
  city?: string;
  pincode?: string;
  _id?: string;
};

export type BillingDetailsFormValues = {
  gst_number: string;
  gst_billing_name: string;
  email: string;
  mobile: string;
  address_line1: string;
  state: string;
  city: string;
  pincode: string;
};
