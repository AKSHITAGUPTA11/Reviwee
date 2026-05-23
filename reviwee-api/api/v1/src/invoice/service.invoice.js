const Invoice = require("./schema.invoice");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Invoice by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Invoice>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Invoice.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Invoice by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Invoice>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Invoice.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Invoice
 * @param {object} bodyData
 * @returns {Promise<Invoice>}
 */
const createNewData = async (bodyData) => {
  return Invoice.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Invoice
 * @param {ObjectId} id
 * @returns {Promise<Invoice>}
 */
const getById = async (id) => {
  return Invoice.findById(id);
};
//-------------------------------------------

/**
 * Update Invoice by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Invoice>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Invoice.findByIdAndUpdate(
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
 * @returns {Promise<Invoice>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Invoice.findOneAndUpdate(
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
 * @returns {Promise<Invoice>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Invoice.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Invoice>}
 */
const getByIdAndDelete = async (id) => {
  return Invoice.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Invoice>}
 */
const getOneAndDelete = async (matchObj) => {
  return Invoice.findOneAndUpdate(
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
 * @returns {Promise<Invoice>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Invoice.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Invoice>}
 */
const findAll = async () => {
  return Invoice.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Invoice>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Invoice.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Invoice>}
 */
const createMany = async (insertDataArray) => {
  return Invoice.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Invoice>}
 */
const findCount = async (matchObj) => {
  return Invoice.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Invoice>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Invoice.updateMany(
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
 * @returns {Promise<Invoice>}
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
