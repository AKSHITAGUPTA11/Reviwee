const OpenAI = require("openai");
const configService = require("../../api/v1/src/config/service.config");

let client;

const initOpenAI = async () => {
  if (client) return client;

  const getApiKey = await configService.getOneByMultiField({
    key: "OPEN_AI_API_KEY",
  });

  if (!getApiKey || !getApiKey.value) {
    throw new Error("OpenAI API key config missing.");
  }

  client = new OpenAI({
    apiKey: getApiKey.value,
  });

  return client;
};

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

const generateWithOpenAI = async (prompt) => {
  try {
    const client = await initOpenAI();

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = res.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();

    return safeParse(text);
  } catch (err) {
    console.log("OpenAI Error:", err);
    throw err;
  }
};

module.exports = { generateWithOpenAI, initOpenAI };
