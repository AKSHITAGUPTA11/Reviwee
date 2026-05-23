const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const profileService = require("./service.profile");
const subCategoryService = require("../subcategory/service.subcategory");
const categoryService = require("../category/service.category");
const productService = require("../product/service.product");
const serviceFile = require("../service/service.service");
const customerSubscriptionService = require("../customerSubcription/service.customerSubcription");
const creditConfigService = require("../creditConfig/service.creditConfig");
const creditLogsService = require("../creditConfig/service.creditLogs");
const { searchKeys } = require("./schema.profile");
const { errorRes } = require("../../../../utilities/resError");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");
const { userEnum } = require("../../../utils/enumUtils");
const { v4: uuidv4 } = require("uuid");
const { afterLoginRedirectTo } = require("../../helper/authenticationHelper");
const {
  buildPromptForBusinessDescription,
} = require("../../../../third-party-services/AI/promptBuilder");
const {
  generateByAI,
} = require("../../../../third-party-services/AI/aiProvider");

const generateUniqueBusinessId = async () => {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();

    const data = await profileService.getOneByMultiField({
      businessId: uuid,
    });

    if (!data) exists = false;
  }

  return uuid;
};

//add start
exports.add = async (req, res) => {
  try {
    let { categoryId, subCategoryId, googleBusinessLink, businessDisplayName } =
      req.body;

    if (req.userData.userType === userEnum.superAdmin) {
      throw new ApiError(
        httpStatus.OK,
        "You don't have permission to access this.",
      );
    }

    /**
     * check duplicate exist
     */
    let dataExist = await profileService.getOneByMultiField({
      userId: req.userData.Id,
      googleBusinessLink: googleBusinessLink,
      businessDisplayName: businessDisplayName,
    });
    if (dataExist) {
      throw new ApiError(httpStatus.OK, "Profile already exist.");
    }

    /**
     * check subscription exist
     */
    let subscriptionExist =
      await customerSubscriptionService.getOneByMultiField({
        customerId: new mongoose.Types.ObjectId(req.userData.Id),
        isActive: true,
        isDeleted: false,
      });
    if (!subscriptionExist) {
      throw new ApiError(httpStatus.OK, "Please select valid subscription.");
    }
    req.body.totalCredits = subscriptionExist.credits;
    req.body.remainingCredits = subscriptionExist.remainingCredits;

    /**
     * check category exist
     */
    let categoryExist = await categoryService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(categoryId),
    });
    if (!categoryExist) {
      throw new ApiError(httpStatus.OK, "Please select valid category.");
    }
    req.body.categoryName = categoryExist.categoryName;

    /**
     * check sub category exist
     */
    let subCategoryExist = await subCategoryService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(subCategoryId),
      categoryId: categoryId,
    });
    if (!subCategoryExist) {
      throw new ApiError(httpStatus.OK, "Please select valid sub category.");
    }
    req.body.subCategoryName = subCategoryExist.subCategoryName;
    req.body.ownerLabel = subCategoryExist.ownerLabel;
    req.body.businessId = await generateUniqueBusinessId();
    req.body.userId = req.userData.Id;
    req.body.userName = req.userData.name;

    // add default credit
    const defaultCreditConfig = await creditConfigService.getOneByMultiField({
      isDefault: true,
    });

    if (defaultCreditConfig) {
      req.body.creditConfigId = defaultCreditConfig._id;
      req.body.perRequestCredit = defaultCreditConfig.credit;
      req.body.minWords = defaultCreditConfig.minWords;
      req.body.maxWords = defaultCreditConfig.maxWords;
    }

    // create data
    let dataCreated = await profileService.createNewData({ ...req.body });

    if (dataCreated) {
      const redirectResult = await afterLoginRedirectTo(req.userData.Id);

      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        redirectTo: redirectResult.redirectTo || "",
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

//update start
exports.update = async (req, res) => {
  try {
    const idToBeSearch = req.params.id;
    const body = req.body;

    /* ------------------ Find profile ------------------ */
    const datafound = await profileService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(idToBeSearch),
    });

    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Profile not found.`);
    }

    /* ------------------ Duplicate check ------------------ */
    if (body.googleBusinessLink || body.businessDisplayName) {
      const dataExist = await profileService.getOneByMultiField({
        _id: { $ne: new mongoose.Types.ObjectId(idToBeSearch) },
        googleBusinessLink: body.googleBusinessLink,
        businessDisplayName: body.businessDisplayName,
        userId: req.userData.Id,
      });

      if (dataExist) {
        throw new ApiError(httpStatus.OK, "Profile already exist.");
      }
    }

    /* ------------------ Category validation ------------------ */
    if (body.creditConfigId) {
      const creditConfigExist = await creditConfigService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(body.creditConfigId),
      });

      if (!creditConfigExist) {
        throw new ApiError(httpStatus.OK, "Please select valid credit config.");
      }

      body.perRequestCredit = creditConfigExist.credit;
      body.minWords = creditConfigExist.minWords;
      body.maxWords = creditConfigExist.maxWords;
    }

    /* ------------------ Category validation ------------------ */
    if (body.categoryId) {
      const categoryExist = await categoryService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(body.categoryId),
      });

      if (!categoryExist) {
        throw new ApiError(httpStatus.OK, "Please select valid category.");
      }

      body.categoryName = categoryExist.categoryName;
    }

    /* ------------------ SubCategory validation ------------------ */
    if (body.subCategoryId) {
      const subCategoryExist = await subCategoryService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(body.subCategoryId),
        ...(body.categoryId && { categoryId: body.categoryId }),
      });

      if (!subCategoryExist) {
        throw new ApiError(httpStatus.OK, "Please select valid sub category.");
      }

      body.subCategoryName = subCategoryExist.subCategoryName;
      body.ownerLabel = subCategoryExist.ownerLabel;
    }

    /* ------------------ ARRAY HANDLING ------------------ */

    const updateObj = {
      $set: {},
      $addToSet: {},
    };

    const flattenObject = (obj, parent = "") => {
      let res = {};

      for (let key in obj) {
        const newKey = parent ? `${parent}.${key}` : key;

        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(res, flattenObject(obj[key], newKey));
        } else {
          res[newKey] = obj[key];
        }
      }

      return res;
    };

    const flatBody = flattenObject(body);

    for (let key in flatBody) {
      if (["seoKeywords", "businessAliases"].includes(key)) {
        if (Array.isArray(flatBody[key]) && flatBody[key].length) {
          updateObj.$addToSet[key] = { $each: flatBody[key] };
        }
      } else {
        updateObj.$set[key] = flatBody[key];
      }
    }

    // cleanup
    if (!Object.keys(updateObj.$set).length) delete updateObj.$set;
    if (!Object.keys(updateObj.$addToSet).length) delete updateObj.$addToSet;

    /* ------------------ Update ------------------ */
    const dataUpdated = await profileService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      updateObj,
      { new: true },
    );

    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
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

    return res.status(errData.statusCode).send({
      message,
      status,
      data,
      code,
      issue,
    });
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
      matchQuery = {
        $and: [
          { isDeleted: false },
          { userId: new mongoose.Types.ObjectId(req.userData.Id) },
        ],
      };
    }

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
    let objectIdFields = ["userId"];
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

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await profileService.aggregateQuery(finalAggregateQuery);
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

    let result = await profileService.aggregateQuery(finalAggregateQuery);
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

// all filter pagination api for credit logs
exports.getCreditLogs = async (req, res) => {
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
    let objectIdFields = ["profileId", "userId"];
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
    let additionalQuery = [
      {
        $lookup: {
          from: "reviews",
          localField: "reviewId",
          foreignField: "_id",
          as: "reviewData",
        },
      },
      {
        $unwind: {
          path: "$reviewData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          reviewText: "$reviewData.reviewsText",
        },
      },
      {
        $project: {
          reviewData: 0,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await creditLogsService.aggregateQuery(finalAggregateQuery);
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

    let result = await creditLogsService.aggregateQuery(finalAggregateQuery);
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

//get api
exports.get = async (req, res) => {
  try {
    let additionalQuery = [{ $match: { isDeleted: false, isActive: true } }];

    let dataExist = await profileService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
    ];

    let dataExist = await profileService.aggregateQuery(additionalQuery);

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

//get description by place id
exports.getBusinessDescriptionByPlaceId = async (req, res) => {
  try {
    let placeId = req.params.id;
    let { businessDisplayName, subCategoryName } = req.query;

    const prompt = await buildPromptForBusinessDescription({
      businessDisplayName,
      subCategoryName,
      placeId,
    });

    if (!prompt) {
      throw new ApiError(
        httpStatus.OK,
        "Failed to build prompt for business description.",
      );
    }

    const aiResponse = await generateByAI({ prompt });
    if (!aiResponse) {
      throw new ApiError(
        httpStatus.OK,
        "Failed to generate business description.",
      );
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: aiResponse,
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

//get by business id
exports.getByBusinessId = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;

    let profile = await profileService.getOneByMultiField({
      businessId: idToBeSearch,
      isDeleted: false,
    });

    if (!profile) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    // ================= PRODUCTS =================
    const products = await productService.findAllWithQuery(
      {
        businessId: idToBeSearch,
        isDeleted: false,
        isActive: true,
      },
      { productName: 1 },
    );

    // ================= SERVICES =================
    const services = await serviceFile.findAllWithQuery(
      {
        businessId: idToBeSearch,
        isDeleted: false,
        isActive: true,
      },
      { serviceName: 1 },
    );

    const activeOwners = profile.owner?.filter((i) => i.isActive) || [];
    const activeStaff = profile.staff?.filter((i) => i.isActive) || [];

    // ================= RESPONSE =================
    return res.status(200).json({
      message: "Successfull!.",
      businessName: profile.businessDisplayName,
      googleBusinessLink: profile.googleBusinessLink,
      ownerLabel: profile.ownerLabel,
      owner: activeOwners,
      staff: activeStaff,
      languages: profile.languages,
      businessAliases: profile.businessAliases,
      seoKeywords: profile.seoKeywords,
      tags: profile.tags,
      products,
      services,
      success: true,
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
    if (!(await profileService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let deleted = await profileService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull!",
      status: true,
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
    let dataExist = await profileService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await profileService.getOneAndUpdate(
      { _id },
      { isActive },
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
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

// memberStatusChange
exports.memberStatusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    const { type, memberId } = req.body;

    let dataExist = await profileService.getOneByMultiField({ _id });

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const members = dataExist[type];

    const memberIndex = members.findIndex((m) => m._id.toString() === memberId);

    if (memberIndex === -1) {
      throw new ApiError(httpStatus.OK, `${type} member not found.`);
    }

    // toggle
    members[memberIndex].isActive = !members[memberIndex].isActive;

    let statusChanged = await profileService.getOneAndUpdate(
      { _id },
      { [type]: members },
    );

    return res.status(httpStatus.OK).send({
      message: `${type} ${
        members[memberIndex].isActive ? "activated" : "deactivated"
      } successfully.`,
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
