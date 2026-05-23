const CreditLogs = require("./schema.creditLogs");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One CreditLogs by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<CreditLogs>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return CreditLogs.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One CreditLogs by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<CreditLogs>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return CreditLogs.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create CreditLogs
 * @param {object} bodyData
 * @returns {Promise<CreditLogs>}
 */
const createNewData = async (bodyData) => {
  return CreditLogs.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id CreditLogs
 * @param {ObjectId} id
 * @returns {Promise<CreditLogs>}
 */
const getById = async (id) => {
  return CreditLogs.findById(id);
};
//-------------------------------------------

/**
 * Update CreditLogs by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<CreditLogs>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return CreditLogs.findByIdAndUpdate(
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
 * @returns {Promise<CreditLogs>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return CreditLogs.findOneAndUpdate(
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
 * @returns {Promise<CreditLogs>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return CreditLogs.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<CreditLogs>}
 */
const getByIdAndDelete = async (id) => {
  return CreditLogs.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<CreditLogs>}
 */
const getOneAndDelete = async (matchObj) => {
  return CreditLogs.findOneAndUpdate(
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
 * @returns {Promise<CreditLogs>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return CreditLogs.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<CreditLogs>}
 */
const findAll = async () => {
  return CreditLogs.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<CreditLogs>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return CreditLogs.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<CreditLogs>}
 */
const createMany = async (insertDataArray) => {
  return CreditLogs.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<CreditLogs>}
 */
const findCount = async (matchObj) => {
  return CreditLogs.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<CreditLogs>}
 */
const updateMany = async (matchObj, updateObject) => {
  return CreditLogs.updateMany(
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
 * @returns {Promise<CreditLogs>}
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
