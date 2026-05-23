const { userEnum } = require("../api/utils/enumUtils");

const applyRoleFilter = (matchQuery, user) => {
  if (user.userType !== userEnum.superAdmin) {
    matchQuery.$and.push({
      createdBy: user._id,
    });
  }

  return matchQuery;
};

module.exports = { applyRoleFilter };
