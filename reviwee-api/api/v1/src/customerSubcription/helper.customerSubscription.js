const { default: mongoose } = require("mongoose");
const moment = require("moment");
const ApiError = require("../../../../utilities/apiErrorUtils");
const httpStatus = require("http-status");
const subscriptionPlanService = require("../subscriptionPlan/service.subscriptionPlan");
const customerService = require("../admins/service.admin");
const customerSubscriptionService = require("./service.customerSubcription");
const customerLedgerService = require("../customerLedger/service.customerLedger");
const transactionService = require("../transaction/service.transaction");
const profileService = require("../profile/service.profile");
const subsRenewalHistoryService = require("../subsRenewalHistory/service.subsRenewalHistory");
const invoiceConfigService = require("../invoiceConfig/service.invoiceConfig");
const {
  discountTypeEnum,
  ledgertypeEnum,
  planDurationEnum,
  paymentMethod,
  planStatusEnum,
  transactionStatus,
} = require("../../../utils/enumUtils");
const { useGatewayApi } = require("../paymentGatewy/paymentGatewayHelper");
const { afterLoginRedirectTo } = require("../../helper/authenticationHelper");

/**
 * calculate GST amount and total amount
 */
const calculateGSTAmount = async ({
  amount,
  userState,
  companyState = "Madhya Pradesh",
}) => {
  const baseAmount = Number(amount) || 0;

  // fetch GST configs from DB
  const [cgstConfig, sgstConfig, igstConfig] = await Promise.all([
    invoiceConfigService.getOneByMultiField({ key: "CGST" }),
    invoiceConfigService.getOneByMultiField({ key: "SGST" }),
    invoiceConfigService.getOneByMultiField({ key: "IGST" }),
  ]);

  const cgst = Number(cgstConfig?.value || 0);
  const sgst = Number(sgstConfig?.value || 0);
  const igst = Number(igstConfig?.value || 0);

  const isSameState = userState?.toLowerCase() === companyState.toLowerCase();

  let gstAmount = 0;
  let gstBreakup = {};

  if (isSameState) {
    // CGST + SGST
    const cgstAmount = (baseAmount * cgst) / 100;
    const sgstAmount = (baseAmount * sgst) / 100;

    gstAmount = cgstAmount + sgstAmount;

    gstBreakup = {
      type: "CGST_SGST",
      cgst,
      sgst,
      cgstAmount,
      sgstAmount,
    };
  } else {
    // IGST
    gstAmount = (baseAmount * igst) / 100;

    gstBreakup = {
      type: "IGST",
      igst,
      igstAmount: gstAmount,
    };
  }

  const totalAmount = baseAmount + gstAmount;

  return {
    baseAmount,
    gstAmount: gstAmount,
    totalAmount,
    gstBreakup,
  };
};

/**
 * get customer details by id
 */
const getCustomerDetailsById = async (customerId) => {
  try {
    const customerExist = await customerService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(customerId),
    });

    if (!customerExist) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Customer not found.`);
    }
    return customerExist;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * get subscription details by id
 */
const getSubscriptionDetailsById = async (subscriptionPlanId) => {
  try {
    const subscriptionPlanExist =
      await subscriptionPlanService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(subscriptionPlanId),
      });

    if (!subscriptionPlanExist) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Subscription not found.`);
    }

    return subscriptionPlanExist;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * get plan expiry date
 */
const calculatePlanExpiryDate = (planStartDate, planDuration) => {
  const durationMap = {
    [planDurationEnum.weekly]: { value: 1, unit: "weeks" },
    [planDurationEnum.monthly]: { value: 1, unit: "months" },
    [planDurationEnum.quarterly]: { value: 3, unit: "months" },
    [planDurationEnum.halfYearly]: { value: 6, unit: "months" },
    [planDurationEnum.yearly]: { value: 1, unit: "years" },
  };

  const duration = durationMap[planDuration];

  if (!duration) {
    throw new Error("Invalid plan duration");
  }

  return moment(planStartDate, "YYYY-MM-DD")
    .add(duration.value, duration.unit)
    .format("YYYY-MM-DD");
};

/**
 * calculate discount amount
 */
const calculateDiscount = (baseAmount, disType, disValue) => {
  if (!baseAmount || baseAmount <= 0) return 0;

  if (
    disType === discountTypeEnum.none ||
    disValue === undefined ||
    disValue === null ||
    disValue === "" ||
    disValue === 0 ||
    disValue === "0"
  ) {
    return 0;
  }

  let value =
    typeof disValue === "string" ? disValue.trim().replace("%", "") : disValue;

  value = parseFloat(value);

  if (isNaN(value) || value < 0) {
    throw new Error("Invalid discount value.");
  }

  if (disType === discountTypeEnum.percentage) {
    if (value > 100) {
      throw new Error("Invalid percentage discount value. Must be <= 100.");
    }
    return (baseAmount * value) / 100;
  }

  if (disType === discountTypeEnum.flat) {
    return value;
  }
  return 0;
};

/**
 * add customer ledger
 */
const createCustomerLedger = async (ledgerDetails) => {
  try {
    ledgerDetails = JSON.parse(JSON.stringify(ledgerDetails));
    let addLedger = await customerLedgerService.createNewData(ledgerDetails);

    if (addLedger) {
      const currentCustomer = await customerService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(ledgerDetails.customerId),
      });
      const prevDue = currentCustomer ? currentCustomer?.dueAmt : 0;

      const newDueAmt =
        ledgerDetails.type === ledgertypeEnum.debit
          ? prevDue + ledgerDetails.amount
          : prevDue - ledgerDetails.amount;
      await customerService.getByIdAndUpdate(
        new mongoose.Types.ObjectId(ledgerDetails.customerId),
        {
          $set: {
            dueAmt: newDueAmt,
            dueDate: ledgerDetails.dueDate,
          },
        },
      );
    }
    return addLedger;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * log renewal history
 */
const logRenewalHistory = async (logDetails) => {
  try {
    logDetails = JSON.parse(JSON.stringify(logDetails));
    delete logDetails._id;
    let addLog = await subsRenewalHistoryService.createNewData(logDetails);

    return addLog;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * add subscription plan for customer
 */
const addCustomerSubscription = async (req) => {
  try {
    let {
      customerId,
      subscriptionPlanId,
      planStartDate,
      discountType,
      discountValue,
      receivedAmt,
      dueDate,
      paymentMode,
    } = req.body;

    /**
     * get customer details
     */
    let customerDoc = await getCustomerDetailsById(customerId);
    req.body.customerName = customerDoc.name;
    req.body.customerEmail = customerDoc.email;

    /**
     * get subscription details
     */
    let susbcriptionExist =
      await getSubscriptionDetailsById(subscriptionPlanId);
    req.body["planName"] = susbcriptionExist.planName;
    req.body["planPrice"] = susbcriptionExist.planPrice;
    req.body["planDuration"] = susbcriptionExist.planDuration;

    // existing active subscription check
    const existingSubscription =
      await customerSubscriptionService.getOneByMultiField({
        customerId: new mongoose.Types.ObjectId(customerId),
        planStatus: planStatusEnum.active,
        isActive: true,
        isDeleted: false,
      });

    const previousTotalCredits = existingSubscription?.credits || 0;
    const previousRemainingCredits =
      existingSubscription?.remainingCredits || 0;

    req.body["credits"] = previousTotalCredits + susbcriptionExist.credits;
    req.body["remainingCredits"] =
      previousRemainingCredits + susbcriptionExist.credits;

    /**
     * add plan expiry date
     */
    req.body["planExpiryDate"] = calculatePlanExpiryDate(
      planStartDate,
      susbcriptionExist.planDuration,
    );
    req.body["planAddedOn"] = moment().format("YYYY-MM-DD");

    /**
     * calculate discount and other final amounts
     */
    let calculatedDiscountAmount = await calculateDiscount(
      susbcriptionExist.planPrice,
      discountType,
      discountValue,
    );
    req.body["calculatedDisAmt"] = Math.min(
      calculatedDiscountAmount,
      susbcriptionExist.planPrice,
    );

    if (calculatedDiscountAmount > susbcriptionExist.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Discount (${calculatedDiscountAmount}) cannot be greater than plan price (${susbcriptionExist.planPrice})`,
      );
    }

    const amtAfterDiscount =
      susbcriptionExist.planPrice - calculatedDiscountAmount;
    req.body["amtAfterDiscount"] = Math.max(amtAfterDiscount, 0);
    const dueAmtTotal = req.body["amtAfterDiscount"] - receivedAmt;
    const dueAmt = Math.max(dueAmtTotal, 0);
    req.body["dueAmt"] = dueAmt;
    receivedAmt = Number(receivedAmt) || 0;

    if (dueAmt !== 0 && (!dueDate || dueDate === "")) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Due date is required when due amount is greater than 0.`,
      );
    }

    if (receivedAmt > amtAfterDiscount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Received amount (${receivedAmt}) cannot be greater than payable amount (${amtAfterDiscount}).`,
      );
    }

    /* ================= RAZORPAY FLOW ================= */
    if (paymentMode === paymentMethod.razorpay && amtAfterDiscount > 0) {
      const { totalAmount, gstAmount, gstBreakup } = await calculateGSTAmount({
        amount: amtAfterDiscount,
        userState: customerDoc?.gstDetails?.state,
      });

      req.body.planStatus = planStatusEnum.pending;
      req.body.paymentStatus = transactionStatus.pending;
      req.body.gstBreakup = gstBreakup;

      const subscription = await customerSubscriptionService.createNewData({
        ...req.body,
      });

      const order = await useGatewayApi({
        planId: subscription._id,
        productName: "REVIEWEE",
        amount: totalAmount,
      });

      /**
       * create transaction for online payment
       */
      let orderData = order?.data;
      await transactionService.createNewData({
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        planId: subscription._id,
        amount: totalAmount,
        paymentMode: paymentMethod.razorpay,
        paymentStatus: transactionStatus.pending,
        razorpayOrderId: orderData?.data?.id,
      });

      return {
        paymentRequired: true,
        planId: subscription._id,
        razorpayOrder: order.data,
      };
    }

    /**
     * add subscription
     */
    req.body.planStatus = planStatusEnum.active;
    req.body.paymentStatus = transactionStatus.success;
    let addCusSubscription = await customerSubscriptionService.createNewData({
      ...req.body,
    });
    if (!addCusSubscription) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Unable to add subscription. Please try again after some time.`,
      );
    }

    /**
     * create transaction for offline payment
     */
    await transactionService.createNewData({
      customerId: addCusSubscription.customerId,
      customerName: addCusSubscription.customerName,
      customerEmail: addCusSubscription.customerEmail,
      planId: addCusSubscription._id,
      amount: addCusSubscription.receivedAmt,
      paymentMode: paymentMethod.offline,
      paymentStatus: transactionStatus.success,
    });

    /**
     * add single ledger entry for the paid amount (after discount)
     */
    // 1. DR entry: Customer owes money for the plan (after discount)
    await createCustomerLedger({
      customerId: addCusSubscription.customerId,
      customerName: addCusSubscription.customerName,
      customerEmail: addCusSubscription.customerEmail,
      amount: addCusSubscription.amtAfterDiscount,
      type: ledgertypeEnum.debit,
      dueAmt: addCusSubscription.dueAmt,
      dueDate: dueDate,
      remark:
        addCusSubscription.calculatedDisAmt > 0
          ? `Buy plan ${addCusSubscription.planName} of Rs.${addCusSubscription.planPrice} with discount of Rs.${addCusSubscription.calculatedDisAmt}.`
          : `Buy plan ${addCusSubscription.planName} of Rs.${addCusSubscription.planPrice}.`,
    });

    // 2. CR entry: Customer paid partial/full amount
    if (receivedAmt > 0) {
      await createCustomerLedger({
        customerId: addCusSubscription.customerId,
        customerName: addCusSubscription.customerName,
        customerEmail: addCusSubscription.customerEmail,
        amount: receivedAmt,
        type: ledgertypeEnum.credit,
        dueAmt: addCusSubscription.dueAmt,
        dueDate: dueDate,
        remark:
          dueAmt > 0
            ? `Payment received of Rs.${receivedAmt} with due amount Rs.${dueAmt} when subscription added.`
            : `Full payment received of Rs.${receivedAmt} when subscription added.`,
      });
    }

    //add subscription log history
    let logDetails = {
      ...addCusSubscription.toObject(),
      customerSubscriptionId: addCusSubscription._id,
      planStartDate,
    };

    await logRenewalHistory(logDetails);

    const redirectResult = await afterLoginRedirectTo(
      addCusSubscription.customerId,
    );
    addCusSubscription["redirectTo"] = redirectResult.redirectTo || "";

    return addCusSubscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * renew subscription plan for customer
 */
const renewCustomerSubscription = async (req) => {
  try {
    const customerSubscriptionId = req.params.id;

    let {
      planStartDate,
      discountType,
      discountValue,
      receivedAmt,
      dueDate,
      paymentMode,
    } = req.body;

    receivedAmt = Number(receivedAmt) || 0;

    /* ================= FETCH EXISTING SUBSCRIPTION ================= */
    const existingSubscription =
      await customerSubscriptionService.getOneByMultiField({
        _id: customerSubscriptionId,
        isActive: true,
      });

    if (!existingSubscription) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer subscription not found.",
      );
    }

    let customerDoc = await getCustomerDetailsById(
      existingSubscription.customerId,
    );

    const previousTotalCredits = existingSubscription.credits || 0;
    const previousRemainingCredits = existingSubscription.remainingCredits || 0;

    const {
      customerId,
      customerName,
      customerEmail,
      subscriptionPlanId,
      planDuration,
    } = existingSubscription;

    /* ================= FETCH PLAN ================= */
    const subscriptionPlan =
      await getSubscriptionDetailsById(subscriptionPlanId);

    const newCredits = subscriptionPlan.credits;
    const updatedTotalCredits = previousTotalCredits + newCredits;
    const updatedRemainingCredits = previousRemainingCredits + newCredits;

    const planAddedOn = moment().format("YYYY-MM-DD");
    const planExpiryDate = calculatePlanExpiryDate(planStartDate, planDuration);

    /* ================= DISCOUNT ================= */
    const calculatedDisAmt = await calculateDiscount(
      subscriptionPlan.planPrice,
      discountType,
      discountValue,
    );

    if (calculatedDisAmt > subscriptionPlan.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Discount (${calculatedDisAmt}) cannot be greater than plan price (${subscriptionPlan.planPrice}).`,
      );
    }

    const amtAfterDiscount = Math.max(
      subscriptionPlan.planPrice - calculatedDisAmt,
      0,
    );

    const dueAmt = Math.max(amtAfterDiscount - receivedAmt, 0);

    if (dueAmt > 0 && (!dueDate || dueDate === "")) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Due date is required when due amount is greater than 0.",
      );
    }

    if (receivedAmt > amtAfterDiscount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Received amount (${receivedAmt}) cannot be greater than payable amount (${amtAfterDiscount}).`,
      );
    }

    /* ================= RAZORPAY FLOW ================= */
    if (paymentMode === paymentMethod.razorpay && amtAfterDiscount > 0) {
      const { totalAmount, gstAmount, gstBreakup } = await calculateGSTAmount({
        amount: amtAfterDiscount,
        userState: customerDoc?.gstDetails?.state,
      });

      const updatedSubscription =
        await customerSubscriptionService.getByIdAndUpdate(
          customerSubscriptionId,
          {
            credits: updatedTotalCredits,
            remainingCredits: updatedRemainingCredits,
            planExpiryDate,
            planStartDate,
            planRenewalDate: planAddedOn,
            discountType,
            discountValue,
            calculatedDisAmt,
            amtAfterDiscount,
            receivedAmt: 0,
            dueAmt: amtAfterDiscount,
            dueDate: null,
            planStatus: planStatusEnum.pending,
            paymentStatus: transactionStatus.pending,
            gstBreakup,
          },
        );

      const order = await useGatewayApi({
        planId: updatedSubscription._id,
        productName: "REVIEWEE",
        amount: totalAmount,
      });

      const orderData = order?.data;

      await transactionService.createNewData({
        customerId,
        customerName,
        customerEmail,
        planId: updatedSubscription._id,
        amount: totalAmount,
        paymentMode: paymentMethod.razorpay,
        paymentStatus: transactionStatus.pending,
        razorpayOrderId: orderData?.data?.id,
      });

      return {
        paymentRequired: true,
        planId: updatedSubscription._id,
        razorpayOrder: order.data,
      };
    }

    /* ================= OFFLINE FLOW ================= */
    const updatedSubscription =
      await customerSubscriptionService.getByIdAndUpdate(
        customerSubscriptionId,
        {
          credits: updatedTotalCredits,
          remainingCredits: updatedRemainingCredits,
          planExpiryDate,
          planStartDate,
          planRenewalDate: planAddedOn,
          discountType,
          discountValue,
          calculatedDisAmt,
          amtAfterDiscount,
          receivedAmt,
          dueAmt,
          dueDate,
          planStatus: planStatusEnum.active,
          paymentStatus: transactionStatus.success,
        },
      );

    if (!updatedSubscription) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Failed to renew the subscription.",
      );
    }

    /**
     * update profile credits
     */
    await profileService.updateMany(
      { userId: new mongoose.Types.ObjectId(customerId) },
      {
        $set: {
          totalCredits: updatedTotalCredits,
          remainingCredits: updatedRemainingCredits,
        },
      },
    );

    /* ================= TRANSACTION ================= */
    await transactionService.createNewData({
      customerId,
      customerName,
      customerEmail,
      planId: updatedSubscription._id,
      amount: receivedAmt,
      paymentMode: paymentMode || paymentMethod.offline,
      paymentStatus: transactionStatus.success,
    });

    /* ================= LEDGER ================= */

    // DR Entry
    await createCustomerLedger({
      customerId,
      customerName,
      customerEmail,
      amount: amtAfterDiscount,
      type: ledgertypeEnum.debit,
      dueAmt,
      dueDate,
      remark:
        calculatedDisAmt > 0
          ? `Renewed plan "${subscriptionPlan.planName}" of Rs.${subscriptionPlan.planPrice} with discount Rs.${calculatedDisAmt}.`
          : `Renewed plan "${subscriptionPlan.planName}" of Rs.${subscriptionPlan.planPrice}.`,
    });

    // CR Entry
    if (receivedAmt > 0) {
      await createCustomerLedger({
        customerId,
        customerName,
        customerEmail,
        amount: receivedAmt,
        type: ledgertypeEnum.credit,
        dueAmt,
        dueDate,
        remark:
          dueAmt > 0
            ? `Payment received Rs.${receivedAmt}, Due Rs.${dueAmt}.`
            : `Full payment received Rs.${receivedAmt}.`,
      });
    }

    /* ================= LOG ================= */
    let logDetails = {
      ...updatedSubscription.toObject(),
      customerSubscriptionId: updatedSubscription._id,
      planStartDate,
    };

    await logRenewalHistory(logDetails);

    return updatedSubscription;
  } catch (err) {
    console.error("Error in renewCustomerSubscription:", err);
    throw err;
  }
};

/**
 * UPGRADE subscription plan with amount adjustment
 */
const upgradeSubscription = async (req) => {
  try {
    const activeSubscriptionPlanId = req.params.id;

    let {
      newPlanId,
      planStartDate,
      discountType,
      discountValue = 0,
      paymentMode,
      receivedAmt,
      dueDate,
    } = req.body;

    /* ================= FETCH CURRENT PLAN ================= */
    const currentPlan = await customerSubscriptionService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(activeSubscriptionPlanId),
      planStatus: planStatusEnum.active,
      isActive: true,
    });

    if (!currentPlan) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Active subscription not found.",
      );
    }

    let customerDoc = await getCustomerDetailsById(currentPlan.customerId);

    const previousTotalCredits = currentPlan.credits || 0;
    const previousRemainingCredits = currentPlan.remainingCredits || 0;

    const {
      customerId,
      customerName,
      customerEmail,
      planStartDate: oldStartDate,
      planExpiryDate: oldExpiryDate,
      planPrice: oldPrice,
      planName: oldPlanName,
    } = currentPlan;

    /* ================= NEW PLAN ================= */
    const newPackage = await getSubscriptionDetailsById(newPlanId);

    if (newPackage.planPrice <= oldPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Upgrade requires higher priced plan.",
      );
    }
    const updatedTotalCredits = previousTotalCredits + newPackage.credits;
    const updatedRemainingCredits =
      previousRemainingCredits + newPackage.credits;

    // /* ================= USAGE CALC ================= */
    // const today = moment().startOf("day");
    // const start = moment(oldStartDate, "YYYY-MM-DD");
    // const end = moment(oldExpiryDate, "YYYY-MM-DD");

    // const totalDays = end.diff(start, "days");
    // const daysUsed = Math.max(0, today.diff(start, "days"));
    // const daysRemaining = Math.max(0, end.diff(today, "days"));
    // const perDayPrice = totalDays > 0 ? oldPrice / totalDays : 0;

    // const usedAmount = perDayPrice * daysUsed;
    // const remainingAmount = perDayPrice * daysRemaining;

    /* ================= DISCOUNT ================= */
    const discountAmt = await calculateDiscount(
      newPackage.planPrice,
      discountType,
      discountValue,
    );

    if (discountAmt > newPackage.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Discount exceeds plan price.",
      );
    }

    /* ================= AMOUNT STRUCTURE ================= */
    const netPayable = Math.max(newPackage.planPrice - discountAmt, 0);
    // const adjustmentAmount = Math.floor(remainingAmount);
    // const netPayable = Number(
    //   Math.max(grossAmount - adjustmentAmount, 0).toFixed(2),
    // );
    const dueAmt = Number(Math.max(netPayable - receivedAmt, 0).toFixed(2));

    if (dueAmt > 0 && !dueDate) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Due date required for pending amount.",
      );
    }

    /* ================= CREATE SUBSCRIPTION ================= */
    const expiryDate = moment(planStartDate, "YYYY-MM-DD")
      .add(newPackage.durationInDays, "days")
      .format("YYYY-MM-DD");

    const newSubscriptionData = {
      customerId,
      customerName,
      customerEmail,
      subscriptionPlanId: new mongoose.Types.ObjectId(newPlanId),
      planName: newPackage.planName,
      planPrice: newPackage.planPrice,
      planDuration: newPackage.planDuration,
      credits: updatedTotalCredits,
      remainingCredits: updatedRemainingCredits,
      planStartDate,
      planExpiryDate: expiryDate,
      amtAfterDiscount: netPayable,
      finalPayable: netPayable,
      receivedAmt,
      dueAmt,
      dueDate: dueDate || "",
      paymentMode: paymentMode || paymentMethod.offline,
      discountType,
      discountValue: discountValue.toString(),
      // adjustmentAmount,
      // adjustmentDate: moment().format("YYYY-MM-DD"),
    };

    /* ================= RAZORPAY FLOW ================= */
    if (paymentMode === paymentMethod.razorpay && netPayable > 0) {
      const { totalAmount, gstAmount, gstBreakup } = await calculateGSTAmount({
        amount: netPayable,
        userState: customerDoc?.gstDetails?.state,
      });

      newSubscriptionData.planStatus = planStatusEnum.pending;
      newSubscriptionData.paymentStatus = transactionStatus.pending;
      newSubscriptionData.gstBreakup = gstBreakup;

      const subscription =
        await customerSubscriptionService.createNewData(newSubscriptionData);

      const order = await useGatewayApi({
        planId: subscription._id,
        productName: "REVIEWEE",
        amount: totalAmount,
      });

      await transactionService.createNewData({
        customerId,
        customerName,
        customerEmail,
        planId: subscription._id,
        amount: totalAmount,
        paymentMode: paymentMethod.razorpay,
        paymentStatus: transactionStatus.pending,
        razorpayOrderId: order.data.id,
      });

      return {
        paymentRequired: true,
        planId: subscription._id,
        razorpayOrder: order.data,
        payableAmount: totalAmount,
        // adjustmentAmount,
      };
    }

    /* ================= OFFLINE FLOW ================= */
    newSubscriptionData.planStatus = planStatusEnum.active;
    newSubscriptionData.paymentStatus = transactionStatus.success;

    const subscription =
      await customerSubscriptionService.createNewData(newSubscriptionData);

    await customerSubscriptionService.getOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(activeSubscriptionPlanId) },
      { $set: { planStatus: planStatusEnum.expired, isActive: false } },
    );

    /**
     * update profile credits
     */
    await profileService.updateMany(
      { userId: new mongoose.Types.ObjectId(customerId) },
      {
        $set: {
          totalCredits: updatedTotalCredits,
          remainingCredits: updatedRemainingCredits,
        },
      },
    );
    /* ================= TRANSACTION ================= */
    await transactionService.createNewData({
      customerId,
      customerName,
      customerEmail,
      planId: subscription._id,
      amount: totalAmount,
      paymentMode: paymentMode || paymentMethod.offline,
      paymentStatus: transactionStatus.success,
    });

    /* ================= LEDGER ================= */

    if (totalAmount > 0) {
      await createCustomerLedger({
        customerId,
        customerName,
        customerEmail,
        type: ledgertypeEnum.credit,
        amount: totalAmount,
        remark: `Unused balance Rs.${totalAmount} credited.`,
      });
    }

    await createAdminLedger({
      customerId,
      customerName,
      customerEmail,
      type: ledgertypeEnum.debit,
      amount: netPayable,
      dueAmt,
      dueDate,
      remark: `Upgraded to "${newPackage.planName}". Payable Rs.${netPayable}.`,
    });

    if (receivedAmt > 0) {
      await createAdminLedger({
        customerId,
        customerName,
        customerEmail,
        type: ledgertypeEnum.credit,
        amount: receivedAmt,
        remark:
          dueAmt > 0
            ? `Received Rs.${receivedAmt}, Due Rs.${dueAmt}`
            : `Full payment received Rs.${receivedAmt}`,
      });
    }

    return {
      ...subscription.toObject(),
      payableAmount: netPayable,
      adjustmentAmount: totalAmount,
    };
  } catch (error) {
    console.error("Error in upgradeSubscription:", error);
    throw error;
  }
};

/**
 * add free subscription plan for customer at account creation
 */
const addFreeCustomerSubscriptionPlan = async (customerDetails) => {
  try {
    let { customerId, customerName, customerEmail } = customerDetails;
    /**
     * get subscription details
     */
    const subscriptionPlanExist =
      await subscriptionPlanService.getOneByMultiField({
        isDefault: true,
        planPrice: 0,
      });

    if (!subscriptionPlanExist) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Subscription not found.`);
    }

    /**
     * calculate plan expiry date
     */
    const planStartDate = moment().format("YYYY-MM-DD");
    const planExpiryDate = calculatePlanExpiryDate(
      planStartDate,
      subscriptionPlanExist.planDuration,
    );

    let dataToBeInserted = {
      customerId,
      customerName,
      customerEmail,
      subscriptionPlanId: subscriptionPlanExist._id,
      planName: subscriptionPlanExist.planName,
      planPrice: subscriptionPlanExist.planPrice,
      planDuration: subscriptionPlanExist.planDuration,
      credits: subscriptionPlanExist.credits,
      remainingCredits: subscriptionPlanExist.credits,
      planAddedOn: moment().format("YYYY-MM-DD"),
      planStartDate,
      planExpiryDate,
      paymentMode: paymentMethod.free,
      paymentStatus: transactionStatus.success,
      planStatus: planStatusEnum.active,
    };

    /**
     * add free subscription plan for customer
     */
    const subscription =
      await customerSubscriptionService.createNewData(dataToBeInserted);

    if (!subscription) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Unable to add subscription. Please try again after some time.`,
      );
    }
    return subscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  addCustomerSubscription,
  calculateDiscount,
  getCustomerDetailsById,
  getSubscriptionDetailsById,
  createCustomerLedger,
  renewCustomerSubscription,
  calculatePlanExpiryDate,
  logRenewalHistory,
  upgradeSubscription,
  addFreeCustomerSubscriptionPlan,
};
