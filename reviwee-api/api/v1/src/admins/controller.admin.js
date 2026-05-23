const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const adminService = require("./service.admin");
const jwt = require("jsonwebtoken");
const { searchKeys } = require("./schema.admin");
const { errorRes } = require("../../../../utilities/resError");
const bcryptjs = require("bcryptjs");
const { tokenCreate, refreshTokenCreate } = require("../../helper/tokenCreate");
const { applyRoleFilter } = require("../../../../utilities/accessFilter");
const mongoose = require("mongoose");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const redisClient = require("../../../../database/redis");
const { logOut } = require("../../helper/utils");
const config = require("../../../../config/config");
const {
  detectLoginType,
  verifySSOToken,
} = require("../../helper/loginTypeHelper");
const { loginTypeEnum, userEnum } = require("../../../utils/enumUtils");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/dependencyDeleteHelper");
const { afterLoginRedirectTo } = require("../../helper/authenticationHelper");
const {
  addFreeCustomerSubscriptionPlan,
} = require("../customerSubcription/helper.customerSubscription");
const { sendEmailFunction } = require("../../helper/sendEmailHelper");

//add start
exports.add = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (
      !req.headers ||
      !req.headers["device-id"] ||
      req.headers["device-id"] === ""
    ) {
      throw new ApiError(httpStatus.OK, `Device id is required.`);
    }

    let deviceId = req.headers["device-id"];

    /**
     * check duplicate exist
     */
    let dataExist = await adminService.getOneByMultiField({
      email: email,
    });
    if (dataExist) {
      throw new ApiError(
        httpStatus.OK,
        "This email is already registered. Please log in.",
      );
    }

    // let randomPassword = generateRandomPassword();
    let hashedPassword = await bcryptjs.hash(password, 12);
    if (!hashedPassword) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the password.`,
      );
    }
    req.body.password = hashedPassword;

    //------------------create data-------------------
    let dataCreated = await adminService.createNewData({ ...req.body });
    if (!dataCreated) {
      throw new ApiError(httpStatus.OK, "Something went wrong.");
    }
    let customerDescriptionDetails = {
      customerId: dataCreated._id,
      customerName: dataCreated.name,
      customerEmail: dataCreated.email,
    };
    await addFreeCustomerSubscriptionPlan(customerDescriptionDetails);

    let token = await tokenCreate(dataCreated);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
    let refreshToken = await refreshTokenCreate(dataCreated);
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
    await redisClient.set(
      dataCreated._id + deviceId,
      token + "***" + refreshToken,
    );
    const redisValue = await redisClient.get(dataCreated._id + deviceId);

    if (redisValue) {
      const redirectResult = await afterLoginRedirectTo(dataCreated._id);

      return res.status(httpStatus.OK).send({
        message: `User added successfully.`,
        data: {
          token: token,
          refreshToken: refreshToken,
          adminId: dataCreated._id,
          userType: dataCreated.userType,
          name: dataCreated.name,
          email: dataCreated.email,
        },
        redirectTo: redirectResult.redirectTo || "",
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update start
exports.update = async (req, res) => {
  try {
    let { name, email } = req.body;

    let idToBeSearch = req.params.id;

    /**
     * check duplicate exist
     */
    let dataExist = await adminService.getOneByMultiField({
      _id: { $ne: new mongoose.Types.ObjectId(idToBeSearch) },
      email: email,
    });
    if (dataExist) {
      throw new ApiError(httpStatus.OK, "User already exist.");
    }

    //------------------Find data-------------------
    let datafound = await adminService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(idToBeSearch),
    });

    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Admin not found.`);
    }

    let dataUpdated = await adminService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      },
    );

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update profile start
exports.updateProfile = async (req, res) => {
  try {
    let { email } = req.body;

    let idToBeSearch = req.userData.Id;

    /**
     * check duplicate exist
     */
    let dataExist = await adminService.getOneByMultiField({
      _id: { $ne: new mongoose.Types.ObjectId(idToBeSearch) },
      email: email,
    });
    if (dataExist) {
      throw new ApiError(httpStatus.OK, "User already exist.");
    }

    //------------------Find data-------------------
    let datafound = await adminService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(idToBeSearch),
    });

    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await adminService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      },
    );

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Your profile updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// all filter pagination api
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    if (req.userData.userType !== userEnum.superAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have permission to access this.",
      );
    }

    matchQuery = applyRoleFilter(matchQuery, req.userData);

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue,
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = ["isActive"];
    let numberFileds = [];
    let objectIdFileds = [];
    let withoutRegexFields = [];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFileds,
      withoutRegexFields,
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys,
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await adminService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired,
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result = await adminService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = {
      isDeleted: false,
      isActive: true,
    };

    let additionalQuery = [{ $match: matchQuery }];

    let dataExist = await adminService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//single view api
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
    ];

    let dataExist = await adminService.aggregateQuery(additionalQuery);

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//single view api
exports.getProfileById = async (req, res) => {
  try {
    const idToBeSearch = req.userData.Id;

    const admin = await adminService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(idToBeSearch),
      isDeleted: false,
    });

    if (!admin) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const data = {
      ...admin._doc,
    };

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      status: true,
      data,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;

    if (!(await adminService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "adminId",
      _id,
    );

    if (deleteRefCheck.status === true) {
      let deleted = await adminService.getOneAndDelete({ _id });
      if (!deleted) {
        throw new ApiError(httpStatus.OK, "Some thing went wrong.");
      }
    }
    return res.status(httpStatus.OK).send({
      message: deleteRefCheck.message,
      status: deleteRefCheck.status,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;

    let dataExist = await adminService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await adminService.getOneAndUpdate(
      { _id },
      { isActive },
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }

    if (isActive === false) {
      await logOut(req, true);
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// login api
exports.login = async (req, res) => {
  try {
    if (!req.headers?.["device-id"] || req.headers["device-id"] === "") {
      throw new ApiError(httpStatus.OK, "Device id is required.");
    }
    const deviceId = req.headers["device-id"];

    // ──Detect loginType dynamically from request body ─────
    const loginType = detectLoginType(req.body);
    if (!loginType) {
      throw new ApiError(httpStatus.OK, "Invalid login credentials provided.");
    }

    let dataFound;
    let name;
    let email;

    if (loginType === loginTypeEnum.EMAIL) {
      ({ email } = req.body);
      const { password } = req.body;

      dataFound = await adminService.getOneByMultiField({ email });
      if (!dataFound) {
        throw new ApiError(httpStatus.OK, "User not found.");
      }

      /**
       * check user type for login access
       */
      if (req.expectedRole && dataFound.userType !== req.expectedRole) {
        throw new ApiError(
          httpStatus.OK,
          "You don't have access to login here.",
        );
      }

      const matched = await bcryptjs.compare(password, dataFound.password);
      if (!matched) {
        throw new ApiError(httpStatus.OK, "Invalid password!");
      }

      name = dataFound.name;
    } else {
      // ── SSO flow (Google / Facebook / Apple) ─────────────
      let ssoPayload;
      try {
        ssoPayload = await verifySSOToken(loginType, req.body);
      } catch (err) {
        throw new ApiError(httpStatus.OK, `Invalid ${loginType} token.`);
      }

      ({ email, name } = ssoPayload);

      dataFound = await adminService.getOneByMultiField({ email });

      if (!dataFound) {
        dataFound = await adminService.createNewData({
          name,
          email,
          // password: await bcryptjs.hash(email, 12),
          loginType,
          userType: userEnum.admin,
        });

        let customerDescriptionDetails = {
          customerId: dataFound._id,
          customerName: dataFound.name,
          customerEmail: dataFound.email,
        };
        await addFreeCustomerSubscriptionPlan(customerDescriptionDetails);
      }
    }

    if (!dataFound.isActive) {
      throw new ApiError(httpStatus.OK, "Account is deactivated.");
    }
    if (dataFound.isDeleted) {
      throw new ApiError(httpStatus.OK, "Account not found.");
    }

    await adminService.getOneAndUpdate(
      { _id: dataFound._id },
      { $set: { loginType: loginType } }, // always reflects latest login method
    );

    // ── Generate tokens ────────────────────────────────────
    let { _id: adminId, userType } = dataFound;

    const token = await tokenCreate(dataFound);
    const refreshToken = await refreshTokenCreate(dataFound);

    if (!token || !refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }

    const redisValue = await redisClient.set(
      adminId + deviceId,
      token + "***" + refreshToken,
    );

    if (redisValue) {
      const redirectResult = await afterLoginRedirectTo(adminId);

      return res.status(httpStatus.OK).send({
        message: "Login successful!",
        data: {
          token,
          refreshToken,
          adminId,
          userType,
          name,
          email,
          loginType,
          redirectTo: redirectResult.redirectTo || "",
        },
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// refresh
exports.refreshToken = async (req, res) => {
  try {
    if (
      !req.headers ||
      !req.headers["device-id"] ||
      req.headers["device-id"] === ""
    ) {
      throw new ApiError(httpStatus.OK, `Device id is required.`);
    }

    let refreshTokenValue = req.body.refreshToken;
    let deviceId = req.headers["device-id"];

    const decoded = await jwt.verify(
      refreshTokenValue,
      config.jwt_secret_refresh,
    );
    if (!decoded) {
      throw new ApiError(httpStatus.OK, `Invalid refreshToken`);
    }
    const tokenKey = `${decoded.Id}*`;
    // const allKeys = await redisClient.keys();
    const allRedisValue = await redisClient.keys(tokenKey);
    if (!allRedisValue.length) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token User not found.",
      );
    }
    let userData = await adminService.getOneByMultiField({
      _id: decoded.Id,
      isDeleted: false,
    });
    if (!userData) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token User not found.",
      );
    }

    let { _id: adminId, email, name, userType } = userData;

    let newToken = await tokenCreate(userData);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
    let newRefreshToken = await refreshTokenCreate(userData);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }

    await redisClient.set(
      decoded.Id + deviceId,
      newToken + "***" + newRefreshToken,
    );

    return res.status(httpStatus.OK).send({
      message: `successfull!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        adminId: adminId,
        userType: userType,
        name: name,
        email: email,
      },
      status: true,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    if (
      !req.headers ||
      !req.headers["device-id"] ||
      req.headers["device-id"] === ""
    ) {
      throw new ApiError(httpStatus.OK, `Device id is required.`);
    }

    const deviceId = req.headers["device-id"];
    const token = req.headers["x-access-token"];
    const { currentPassword, newPassword } = req.body;

    const decoded = await jwt.verify(token, config.jwt_secret_access);
    if (decoded.Id !== req.userData.Id) {
      throw new ApiError(httpStatus.OK, `Invalid Token`);
    }

    const user = await adminService.getOneByMultiField({
      _id: req.userData.Id,
      isDeleted: false,
    });

    if (!user) {
      throw new ApiError(httpStatus.OK, "Invalid user.");
    }

    // assuming you're using Passport.js or similar for authentication
    let { _id, name, email, userType } = user;

    // Check if the current password matches the user's password
    const matchedPass = await bcryptjs.compare(currentPassword, user.password);

    if (!matchedPass) {
      throw new ApiError(httpStatus.OK, `Current password not matched`);
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    await logOut(req, true);
    let newToken = await tokenCreate(user);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
    let newRefreshToken = await refreshTokenCreate(user);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later.",
      );
    }
    await redisClient.set(
      req.userData.Id + deviceId,
      newToken + "***" + newRefreshToken,
    );

    const redisValue = await redisClient.get(req.userData.Id + deviceId);
    if (redisValue) {
      return res.status(httpStatus.OK).send({
        message: `Password change successful!`,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          adminId: req.userData.Id,
          name: name,
          email: email,
        },
        status: true,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    let userId = req.params.id;
    if (req.userData.userType !== userEnum.superAdmin) {
      throw new ApiError(
        httpStatus.OK,
        `Only super admin has the access to reset the password.`,
      );
    }
    const { password } = req.body;

    const user = await adminService.getOneByMultiField({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw new ApiError(httpStatus.OK, "Invalid user.");
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    const tokenKey = `${userId}*`;

    const allRedisValue = await redisClient.keys(tokenKey);

    const deletePromises = allRedisValue.map(
      async (key) => await redisClient.del(key),
    );
    await Promise.all(deletePromises);

    return res.status(httpStatus.OK).send({
      message: `Password change successful!`,
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    // --- Check if user exists ---
    const dataExist = await adminService.getOneByMultiField({
      isDeleted: false,
      email: email.toLowerCase(),
    });

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "No user found.");
    }

    if (dataExist.isActive === false) {
      throw new ApiError(httpStatus.OK, "Your account is under review.");
    }

    // --- Generate random 8-character password ---
    const length = 8;
    const randomChars =
      "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789";
    let generatedPass = "";
    for (let i = 0; i < length; i++) {
      generatedPass += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length),
      );
    }

    const emailData = {
      to: email,
      fullName: `${dataExist.name}`,
      password: generatedPass,
    };

    // --- Send email ---
    const sendEmailResult = await sendEmailFunction(
      emailData,
      "FORGOT_PASSWORD",
    );

    if (sendEmailResult.sendStatus === true) {
      // --- Hash and update password ---
      const hashedPassword = await bcryptjs.hash(generatedPass, 12);
      await adminService.getOneAndUpdate(
        { _id: dataExist._id },
        { $set: { password: hashedPassword } },
      );

      return res.status(200).send({
        message: "A new password has been sent to your email address.",
        data: null,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(
        httpStatus.OK,
        `We couldn't send the new password at the moment. Please try again later`,
      );
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// logout
exports.logout = async (req, res) => {
  logOut(req, req.body.logoutAll);
  return res.status(httpStatus.OK).send({
    message: `Logout successfull!`,
    data: [],
    status: true,
    code: "OK",
    issue: null,
  });
};

// all dues api
exports.getAllDues = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }, { dueAmt: { $exists: true, $ne: 0 } }],
    };

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue,
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = ["_id", "businessId"];
    let withoutRegexFields = [];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields,
      withoutRegexFields,
    );

    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys,
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [];

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    //-----------------------------------
    let dataFound = await adminService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired,
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result = await adminService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
