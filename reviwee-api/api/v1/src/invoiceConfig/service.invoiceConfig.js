const InvoiceConfig = require("./schema.invoiceConfig");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One InvoiceConfig by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<InvoiceConfig>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return InvoiceConfig.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One InvoiceConfig by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<InvoiceConfig>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return InvoiceConfig.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create InvoiceConfig
 * @param {object} bodyData
 * @returns {Promise<InvoiceConfig>}
 */
const createNewData = async (bodyData) => {
  return InvoiceConfig.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id InvoiceConfig
 * @param {ObjectId} id
 * @returns {Promise<InvoiceConfig>}
 */
const getById = async (id) => {
  return InvoiceConfig.findById(id);
};
//-------------------------------------------

/**
 * Update InvoiceConfig by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<InvoiceConfig>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return InvoiceConfig.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<InvoiceConfig>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return InvoiceConfig.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<InvoiceConfig>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return InvoiceConfig.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<InvoiceConfig>}
 */
const getByIdAndDelete = async (id) => {
  return InvoiceConfig.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<InvoiceConfig>}
 */
const getOneAndDelete = async (matchObj) => {
  return InvoiceConfig.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<InvoiceConfig>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return InvoiceConfig.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<InvoiceConfig>}
 */
const findAll = async () => {
  return InvoiceConfig.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<InvoiceConfig>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return InvoiceConfig.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<InvoiceConfig>}
 */
const createMany = async (insertDataArray) => {
  return InvoiceConfig.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<InvoiceConfig>}
 */
const findCount = async (matchObj) => {
  return InvoiceConfig.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<InvoiceConfig>}
 */
const updateMany = async (matchObj, updateObject) => {
  return InvoiceConfig.updateMany(
    { ...matchObj, isDeleted: false },
    { ...updateObject },
    { multi: true, upsert: false },
  );
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<InvoiceConfig>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds };
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    }),
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" },
  );
};

//-------------------------------------------
module.exports = {
  getOneBySingleField,
  getOneByMultiField,
  createNewData,
  getById,
  getByIdAndUpdate,
  getOneAndUpdate,
  getByIdAndDelete,
  getOneAndDelete,
  aggregateQuery,
  findAllWithQuery,
  findAll,
  onlyUpdateOne,
  createMany,
  findCount,
  isExists,
  updateMany,
};
