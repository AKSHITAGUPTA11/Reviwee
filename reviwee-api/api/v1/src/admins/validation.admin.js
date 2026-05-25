const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/commonValidation");

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().lowercase().required(),
    password: Joi.string().optional(),
  }),
};

const update = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().lowercase().required(),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().lowercase().required(),
  }),
};

const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([]),
        ),
      }),
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      email: Joi.string().lowercase().optional(),
    })
    .optional(),
};

const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const getaccessByUserId = {
  params: Joi.object().keys({
    userid: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const resetPasswordValid = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
  body: Joi.object()
    .keys({
      password: Joi.string().required(),
    })
    .required(),
};

/**
 * login - sirf email aur password ← FIXED
 */
const loginValid = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const changePasswordValid = {
  body: Joi.object()
    .keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    })
    .required(),
};

const refreshTokenValid = {
  body: Joi.object()
    .keys({
      refreshToken: Joi.string().required(),
    })
    .required(),
};

const forgotPasswordValid = {
  body: Joi.object()
    .keys({
      email: Joi.string().email().required(),
    })
    .required(),
};

module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  loginValid,
  getById,
  refreshTokenValid,
  changePasswordValid,
  resetPasswordValid,
  getaccessByUserId,
  updateProfile,
  forgotPasswordValid,
};