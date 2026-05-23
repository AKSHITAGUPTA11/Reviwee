const { GoogleGenerativeAI } = require("@google/generative-ai");
const configService = require("../../api/v1/src/config/service.config");

let genAI;

const initGemini = async () => {
  if (genAI) return genAI;

  const getApiKey = await configService.getOneByMultiField({
    key: "GEMINI_API_KEY",
  });

  if (!getApiKey || !getApiKey.value) {
    throw new Error("Gemini API key config missing.");
  }

  genAI = new GoogleGenerativeAI(getApiKey.value);

  return genAI;
};

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

const generateWithGemini = async (prompt) => {
  const genAI = await initGemini();

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const result = await model.generateContent(prompt);

  let text = result.response.text();
  text = text.replace(/```json|```/g, "").trim();

  return safeParse(text);
};

module.exports = { generateWithGemini, initGemini };
