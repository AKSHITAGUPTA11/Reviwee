const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/commonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    creditConfigId: Joi.string().allow("").optional(),
    categoryId: Joi.string().custom(commonValidation.objectId).required(),
    subCategoryId: Joi.string().custom(commonValidation.objectId).required(),
    businessDisplayName: Joi.string().trim().required(),
    businessDescription: Joi.string().trim().allow("").optional(),
    googleBusinessLink: Joi.string().required(),
    businessAliases: Joi.array().items(Joi.string().allow("")).optional(),
    tags: Joi.array().items(Joi.string().allow("")).optional(),
    languages: Joi.array()
      .items(
        Joi.object().keys({
          languageName: Joi.string().allow("").optional(),
          languageDescription: Joi.string().allow("").optional(),
        }),
      )
      .optional(),
    seoKeywords: Joi.array().items(Joi.string().allow("")).optional(),
    address: Joi.object()
      .keys({
        address: Joi.string().allow("").optional(),
        localLocationAliases: Joi.array()
          .items(Joi.string().allow(""))
          .optional(),
      })
      .default({}),
    owner: Joi.array().items(
      Joi.object()
        .keys({
          name: Joi.string().allow("").optional(),
          aliases: Joi.array().items(Joi.string().allow("")).optional(),
          gender: Joi.string().allow("").optional(),
          description: Joi.string().allow("").optional(),
        })
        .default([]),
    ),
    staff: Joi.array().items(
      Joi.object()
        .keys({
          name: Joi.string().allow("").optional(),
          gender: Joi.string().allow("").optional(),
          description: Joi.string().allow("").optional(),
        })
        .default([]),
    ),
  }),
};

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    creditConfigId: Joi.string()
      .custom(commonValidation.objectId)
      // .allow(null)
      .optional(),
    categoryId: Joi.string().custom(commonValidation.objectId).optional(),
    subCategoryId: Joi.string().custom(commonValidation.objectId).optional(),
    businessDisplayName: Joi.string().trim().optional(),
    businessDescription: Joi.string().trim().allow("").optional(),
    googleBusinessLink: Joi.string().optional(),
    businessAliases: Joi.array().items(Joi.string().allow("")).optional(),
    tags: Joi.array().items(Joi.string().allow("")).optional(),
    languages: Joi.array()
      .items(
        Joi.object().keys({
          languageName: Joi.string().allow("").optional(),
          languageDescription: Joi.string().allow("").optional(),
        }),
      )
      .optional(),
    seoKeywords: Joi.array().items(Joi.string().allow("")).optional(),
    address: Joi.object()
      .keys({
        address: Joi.string().allow("").optional(),
        localLocationAliases: Joi.array()
          .items(Joi.string().allow(""))
          .optional(),
      })
      .default({}),
    owner: Joi.array().items(
      Joi.object()
        .keys({
          name: Joi.string().allow("").optional(),
          aliases: Joi.array().items(Joi.string().allow("")).optional(),
          gender: Joi.string().allow("").optional(),
          isActive: Joi.boolean().optional(),
          description: Joi.string().allow("").optional(),
        })
        .default([]),
    ),
    staff: Joi.array().items(
      Joi.object()
        .keys({
          name: Joi.string().allow("").optional(),
          gender: Joi.string().allow("").optional(),
          description: Joi.string().allow("").optional(),
          isActive: Joi.boolean().optional(),
        })
        .default([]),
    ),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * filter and pagination api
 */
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

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      bookName: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
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

/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * change status of members
 */
const memberStatusChange = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
  body: Joi.object().keys({
    type: Joi.string().valid("owner", "staff").required(),
    memberId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * exports
 */
module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  memberStatusChange,
  getById,
};
