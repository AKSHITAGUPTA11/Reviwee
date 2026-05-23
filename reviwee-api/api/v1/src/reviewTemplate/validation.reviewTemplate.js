const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const { genderEnum } = require("../../../utils/enumUtils");
const commonValidation = require("../../helper/commonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    rating: Joi.number().optional(),
    tag: Joi.string().allow("").optional(),
    language: Joi.string().allow("").optional(),
    product: Joi.string().allow("").optional(),
    service: Joi.string().allow("").optional(),
    ownerName: Joi.string().allow("").optional(),
    ownerGender: Joi.string().allow("").optional(),
    staffName: Joi.string().allow("").optional(),
    writerGender: Joi.string().allow("").optional(),
  }),
};

module.exports = {
  create,
};
