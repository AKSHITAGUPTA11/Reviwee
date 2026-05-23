const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const { transactionStatus } = require("../../../utils/enumUtils");
const crypto = require("crypto");
const axios = require("axios");
const config = require("../../../../config/config");
const transactionService = require("../transaction/service.transaction");
const invoiceService = require("../invoice/service.invoice");
const { sendEmailFunction } = require("../../helper/sendEmailHelper");

/**
 * handle razorpay webhook
 */
exports.handleRazorpayWebhook = async (payload, signature) => {
  try {
    console.log("Razorpay Webhook Payload:", payload);
    /* ================= VERIFY WEBHOOK SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay_webhook_secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid webhook signature");
    }

    /* ================= EXTRACT DATA ================= */
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;

    if (!payment) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid Razorpay webhook payload",
      );
    }

    /* ================= UPDATE TRANSACTION ================= */
    if (event === "payment.captured" || event === "payment.failed") {
      await transactionService.getOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          $set: {
            paymentStatus:
              payment.status === "captured"
                ? transactionStatus.success
                : transactionStatus.failed,
            paymentId: payment.id,
            // paymentMode: payment.method,
            amount: payment.amount / 100,
            res: payment,
          },
        },
      );
    } else {
      console.log("Unhandled Razorpay event:", event);
    }

    return true;
  } catch (err) {
    console.error("Razorpay Webhook Error:", err);
    throw err;
  }
};

/**
 * use payment gateway
 */
exports.useGatewayApi = async ({ planId, productName, amount }) => {
  try {
    const secret = config.gateway_hash_secret;
    const payload = `${planId}|${amount}`;

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const response = await axios.post(
      "https://pay.codiotic.com/v1/order/create",
      {
        planId,
        productName,
        paymentGatewayName: "RAZORPAY",
        amount,
        hash,
      },
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    console.log("Gateway API Error:", err.response?.data || err.message);

    return {
      success: false,
      message: err.response?.data?.message || "Payment API failed",
    };
  }
};

/**
 * use payment gateway verify api
 */
exports.useGatewayVerifyPaymentApi = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const response = await axios.post(
      "https://pay.codiotic.com/v1/order/verify",
      {
        paymentGatewayName: "RAZORPAY",
        requestedData: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    console.log("Gateway API Error:", err.response?.data || err.message);

    return {
      success: false,
      message: err.response?.data?.message || "Payment API failed",
    };
  }
};

/**
 * create invoice
 */
exports.createInvoiceApi = async ({ subscription, user }) => {
  try {
    const planId = subscription._id;
    const amount = subscription.amtAfterDiscount;
    const secret = config.gateway_hash_secret;
    const payload = `${planId}|${amount}`;

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const response = await axios.post(
      "https://pay.codiotic.com/v1/invoice/create",
      {
        projectName: "REVIEWEE",
        userId: user._id,
        userName: user.name,
        email: user.email,
        customerSubscriptionId: subscription._id,
        planName: subscription.planName,
        planPrice: subscription.planPrice,
        subTotal: subscription.amtAfterDiscount,
        paymentStatus: subscription.paymentStatus,
        gstDetails: user.gstDetails,
        planId,
        amount,
        hash,
      },
    );

    if (response?.data) {
      let data = response.data?.data;
      const createInv = await invoiceService.createNewData({
        ...data,
      });

      /**
       * send email to user for invoice creation
       */
      if (createInv) {
        const emailData = {
          to: createInv.email,
          fullName: createInv.userName,
        };

        const emailRes = await sendEmailFunction(emailData, "INVOICE_CREATED");

        if (!emailRes?.sendStatus) {
          console.error("Email failed");
        }
      }

      return {
        success: true,
        data: createInv,
      };
    } else {
      return false;
    }
  } catch (err) {
    console.log("Invoice API Error:", err.response?.data || err.message);

    return {
      success: false,
      message: err.response?.data?.message || "Invoice API failed",
    };
  }
};
