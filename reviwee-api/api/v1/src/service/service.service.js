const Service = require("./schema.service");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Service by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Service>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Service.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Service by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Service>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Service.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Service
 * @param {object} bodyData
 * @returns {Promise<Service>}
 */
const createNewData = async (bodyData) => {
  return Service.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Service
 * @param {ObjectId} id
 * @returns {Promise<Service>}
 */
const getById = async (id) => {
  return Service.findById(id);
};
//-------------------------------------------

/**
 * Update Service by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Service>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Service.findByIdAndUpdate(
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
 * @returns {Promise<Service>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Service.findOneAndUpdate(
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
 * @returns {Promise<Service>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Service.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Service>}
 */
const getByIdAndDelete = async (id) => {
  return Service.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Service>}
 */
const getOneAndDelete = async (matchObj) => {
  return Service.findOneAndUpdate(
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
 * @returns {Promise<Service>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Service.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Service>}
 */
const findAll = async () => {
  return Service.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Service>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Service.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Service>}
 */
const createMany = async (insertDataArray) => {
  return Service.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Service>}
 */
const findCount = async (matchObj) => {
  return Service.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Service>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Service.updateMany(
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
 * @returns {Promise<Service>}
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
