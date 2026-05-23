const CreditConfig = require("./schema.creditConfig");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One CreditConfig by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<CreditConfig>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return CreditConfig.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One CreditConfig by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<CreditConfig>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return CreditConfig.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create CreditConfig
 * @param {object} bodyData
 * @returns {Promise<CreditConfig>}
 */
const createNewData = async (bodyData) => {
  return CreditConfig.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id CreditConfig
 * @param {ObjectId} id
 * @returns {Promise<CreditConfig>}
 */
const getById = async (id) => {
  return CreditConfig.findById(id);
};
//-------------------------------------------

/**
 * Update CreditConfig by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<CreditConfig>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return CreditConfig.findByIdAndUpdate(
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
 * @returns {Promise<CreditConfig>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return CreditConfig.findOneAndUpdate(
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
 * @returns {Promise<CreditConfig>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return CreditConfig.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<CreditConfig>}
 */
const getByIdAndDelete = async (id) => {
  return CreditConfig.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<CreditConfig>}
 */
const getOneAndDelete = async (matchObj) => {
  return CreditConfig.findOneAndUpdate(
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
 * @returns {Promise<CreditConfig>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return CreditConfig.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<CreditConfig>}
 */
const findAll = async () => {
  return CreditConfig.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<CreditConfig>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return CreditConfig.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<CreditConfig>}
 */
const createMany = async (insertDataArray) => {
  return CreditConfig.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<CreditConfig>}
 */
const findCount = async (matchObj) => {
  return CreditConfig.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<CreditConfig>}
 */
const updateMany = async (matchObj, updateObject) => {
  return CreditConfig.updateMany(
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
 * @returns {Promise<CreditConfig>}
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
