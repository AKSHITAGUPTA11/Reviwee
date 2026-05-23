const { generateWithGemini, initGemini } = require("./gemini");
const { generateWithOpenAI, initOpenAI } = require("./openAi");
const { generateWithMistral, initMistral } = require("./mistralAi");

// ================= AVAILABILITY CHECK =================

const checkOpenAIAvailability = async (client) => {
  try {
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    });
    return true;
  } catch {
    return false;
  }
};

const checkGeminiAvailability = async (genAI) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    await model.generateContent("ping");
    return true;
  } catch {
    return false;
  }
};

const checkMistralAvailability = async (client) => {
  try {
    await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    });
    return true;
  } catch {
    return false;
  }
};

// ================= PROVIDERS =================

const PROVIDERS = {
  gemini: {
    generate: generateWithGemini,
    init: initGemini,
    check: checkGeminiAvailability,
  },
  openai: {
    generate: generateWithOpenAI,
    init: initOpenAI,
    check: checkOpenAIAvailability,
  },
  mistral: {
    generate: generateWithMistral,
    init: initMistral,
    check: checkMistralAvailability,
  },
};

// ================= PRIORITY =================

const getAvailableProviders = () => {
  const priority = process.env.AI_PROVIDER_PRIORITY?.split(",") || [];

  return priority.filter((p) => ["gemini", "openai", "mistral"].includes(p));
};

// ================= MAIN =================

const generateByAI = async ({ prompt }) => {
  const providers = getAvailableProviders();

  if (!providers.length) {
    throw new Error("No AI providers configured in priority");
  }

  for (const providerName of providers) {
    const provider = PROVIDERS[providerName];

    try {
      console.log(`Checking provider: ${providerName}`);

      const client = await provider.init();
      const isAvailable = await provider.check(client);

      // if (!isAvailable) {
      //   console.log(`${providerName} not available`);
      //   continue;
      // }

      console.log(`Using provider: ${providerName}`);

      const result = await provider.generate(prompt);
      if (result) {
        return result;
      }
    } catch (err) {
      console.log(`${providerName} failed:`, err.message);
    }
  }

  throw new Error("All AI providers failed");
};

module.exports = { generateByAI };
