const getWordCount = (text) => {
  return text.trim().split(/\s+/).length;
};

const getCreditCost = (wordCount, creditRules) => {
  const rule = creditRules.find(
    (r) => wordCount >= r.minWords && wordCount <= r.maxWords,
  );

  return rule ? rule.creditCost : 1;
};

module.exports = { getWordCount, getCreditCost };
