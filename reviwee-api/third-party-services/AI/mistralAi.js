const configService = require("../../api/v1/src/config/service.config");

let mistralClient;
let MistralClass;

// ================= INIT =================
const initMistral = async () => {
  if (mistralClient) return mistralClient;

  // Dynamic import (ESM fix)
  if (!MistralClass) {
    const module = await import("@mistralai/mistralai");
    MistralClass = module.Mistral;
  }

  const getApiKey = await configService.getOneByMultiField({
    key: "MISTRAL_AI_API_KEY",
  });

  if (!getApiKey || !getApiKey.value) {
    throw new Error("Mistral API key config missing.");
  }

  mistralClient = new MistralClass({
    apiKey: getApiKey.value,
  });

  return mistralClient;
};

// ================= SAFE PARSE =================
const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

// ================= GENERATE =================
const generateWithMistral = async (prompt) => {
  try {
    const client = await initMistral();

    const res = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
    });

    let text = res.choices[0].message.content;

    text = text.replace(/```json|```/g, "").trim();

    return safeParse(text);
  } catch (err) {
    console.log("Mistral Error:", err);
    throw err;
  }
};

module.exports = { generateWithMistral, initMistral };
