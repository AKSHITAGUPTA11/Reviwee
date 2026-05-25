const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("../../../utilities/pick");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ 
      errors: { label: "key" }, 
      abortEarly: false, 
      allowUnknown: true,
      stripUnknown: false 
    })
    .validate(object);

  if (error) {
    let errorMsg = [];
    error.details.map((d) => {
      errorMsg.push(d.message.replace(/"/g, "'"));
    });
    return res.status(httpStatus.BAD_REQUEST).send({
      message: errorMsg.toString(),
      status: false,
      data: null,
      code: "INVALID_DATA",
      issue: "INVALID_DATA",
    });
  }

  req.body = Object.assign({}, req.body, value.body || {});
  req.params = Object.assign({}, req.params, value.params || {});
  req.query = Object.assign({}, req.query, value.query || {});
  return next();
};

module.exports = validate;