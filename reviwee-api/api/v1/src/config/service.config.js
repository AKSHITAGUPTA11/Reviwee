const Config = require("./schema.config");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Config by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Config>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Config.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Config by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Config>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Config.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Config
 * @param {object} bodyData
 * @returns {Promise<Config>}
 */
const createNewData = async (bodyData) => {
  return Config.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Config
 * @param {ObjectId} id
 * @returns {Promise<Config>}
 */
const getById = async (id) => {
  return Config.findById(id);
};
//-------------------------------------------

/**
 * Update Config by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Config>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Config.findByIdAndUpdate(
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
 * @returns {Promise<Config>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Config.findOneAndUpdate(
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
 * @returns {Promise<Config>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Config.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Config>}
 */
const getByIdAndDelete = async (id) => {
  return Config.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Config>}
 */
const getOneAndDelete = async (matchObj) => {
  return Config.findOneAndUpdate(
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
 * @returns {Promise<Config>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Config.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Config>}
 */
const findAll = async () => {
  return Config.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Config>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Config.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Config>}
 */
const createMany = async (insertDataArray) => {
  return Config.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Config>}
 */
const findCount = async (matchObj) => {
  return Config.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Config>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Config.updateMany(
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
 * @returns {Promise<Config>}
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
