const Reviews = require("./schema.reviews");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Reviews by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Reviews>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Reviews.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Reviews by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Reviews>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Reviews.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Reviews
 * @param {object} bodyData
 * @returns {Promise<Reviews>}
 */
const createNewData = async (bodyData) => {
  return Reviews.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Reviews
 * @param {ObjectId} id
 * @returns {Promise<Reviews>}
 */
const getById = async (id) => {
  return Reviews.findById(id);
};
//-------------------------------------------

/**
 * Update Reviews by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Reviews>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Reviews.findByIdAndUpdate(
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
 * @returns {Promise<Reviews>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Reviews.findOneAndUpdate(
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
 * @returns {Promise<Reviews>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Reviews.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Reviews>}
 */
const getByIdAndDelete = async (id) => {
  return Reviews.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Reviews>}
 */
const getOneAndDelete = async (matchObj) => {
  return Reviews.findOneAndUpdate(
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
 * @returns {Promise<Reviews>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Reviews.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Reviews>}
 */
const findAll = async () => {
  return Reviews.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Reviews>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Reviews.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Reviews>}
 */
const createMany = async (insertDataArray) => {
  return Reviews.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Reviews>}
 */
const findCount = async (matchObj) => {
  return Reviews.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Reviews>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Reviews.updateMany(
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
 * @returns {Promise<Reviews>}
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
