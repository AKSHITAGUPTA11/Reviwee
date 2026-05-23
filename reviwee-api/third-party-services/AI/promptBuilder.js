const buildPrompt = ({
  businessName,
  businessDescription,
  ownerName,
  ownerGender,
  ownerDescription,
  service,
  product,
  keywords,
  city,
  areas,
  languages,
  minWords,
  maxWords,
  rating,
  writerGender,
  tag,
}) => {
  const selectedItem = product && product.trim() !== "" ? product : service;
  const safeTag = tag && tag.trim() !== "" ? tag : selectedItem;

  let toneInstruction = "";
  let ratingInstruction = "";

  if (rating >= 1 && rating <= 2) {
    toneInstruction =
      "Write neutral or slightly negative reviews with mild dissatisfaction.";
    ratingInstruction = "Random rating between 1 and 2 stars.";
  } else if (rating > 2 && rating <= 3) {
    toneInstruction = "Write mixed or average reviews with both pros and cons.";
    ratingInstruction = "Random rating between 2 and 3 stars.";
  } else if (rating > 3 && rating <= 5) {
    toneInstruction =
      "Write highly positive, excellent, and satisfied reviews.";
    ratingInstruction = "Random rating between 4 and 5 stars.";
  }

  return `
You are an expert Google review copywriter, local SEO strategist, and linguistic variation specialist. Your task is to generate a JSON array of 4-5 highly unique, human-like Google reviews based on the provided business details, keywords, and location data.

CORE OBJECTIVE:
Produce reviews that feel genuinely human, incorporate local SEO signals, LSI keyword variation, and achieve high measurable uniqueness.

INPUTS:
Business Details: ${businessName}
Business Description: ${businessDescription}
Owner Details: ${ownerName} ${ownerGender}.
Owner Description: ${ownerDescription}
Primary Keywords: ${keywords}
Offering: ${selectedItem}
City: ${city}
Languages: ${JSON.stringify(languages)}
Neighborhoods/Areas: ${areas}

REQUIREMENTS:
1. Uniqueness & Diversity (MANDATORY):
Each review must be fully distinct in structure, tone, and wording.
Assign a "diversity_score" (0–1) based on:
Lexical variation
Structural uniqueness
Tone ${toneInstruction}
Target ≥ 0.85 per review
2. Tone Randomization  (MANDATORY):
Each review uses a different tone (e.g., casual, enthusiastic, brief, storytelling, analytical, slightly skeptical, etc.).
3. Local SEO Blending  (MANDATORY):
Include city + neighborhood references naturally (no repetition patterns).
Use varied geo-phrasing (not identical formats).
Don't tell the people that they stays in which area, just tell about doctor is the best in the area
4. Keyword + LSI Optimization  (MANDATORY):
Insert 1–2 primary keywords per review.
Expand using LSI variations (synonyms, related services, contextual phrases).
Keep all keyword usage organic and subtle.
5. Human Error Simulation (IMPORTANT):
Introduce light, realistic imperfections in ~30–40% of reviews:
Minor grammar quirks (e.g., missing comma, slightly informal phrasing)
Casual abbreviations (e.g., "def", "honestly", "btw" sparingly)
Slight sentence fragments or conversational tone shifts
Do NOT overdo errors—maintain readability and credibility.
6. AI-Detection Resistance  (MANDATORY):
Avoid:
Repetitive sentence patterns
Overly polished or uniform structure
Predictable openings/closings
Vary:
Sentence rhythm and flow
Emotional intensity
Detail level (some specific, some simple)
7. Content Realism:
Include believable, specific experiences (service, timing, staff, results).
Avoid generic phrases unless expanded with context.
No exaggerated or unrealistic claims.
8. Length:
Each review MUST be between ${minWords}-${maxWords} words.
9. Rating:
${ratingInstruction}
10. write the review which will mention only this offering *{${selectedItem}}*.
11. Make sure the language of the review is strictly *{language}*
${
  writerGender !== undefined
    ? `12. The gender of the review writer must be strictly ${writerGender}.`
    : ""
}
${
  safeTag
    ? `13. Real Experience:
Describe a believable experience specifically related to "${safeTag}".`
    : ""
}

OUTPUT FORMAT (STRICT JSON ONLY):
[
  {
    "review": "...",
    "rating": 5
  }
]

FINAL RULES:
No repeated phrases or detectable templates
No explanations outside JSON
Maximize natural variation across all reviews
Blend SEO + locality + human realism seamlessly"
`;
};

const buildPromptForBusinessDescription = ({
  businessDisplayName,
  subCategoryName,
  placeId,
  minChars = 200,
  maxChars = 500,
}) => {
  return `
You are a professional Google business profile copywriter and local SEO expert.

Your task is to generate:
1. Three unique business descriptions
2. Relevant SEO tags

INPUT:
Business Name: ${businessDisplayName}
Business Type/Subcategory: ${subCategoryName}
Google Place ID: ${placeId}

REQUIREMENTS:

--- DESCRIPTIONS ---
1. Generate EXACTLY 3 unique descriptions.
2. Each description must be between ${minChars}-${maxChars} characters.
3. Each description should:
   - Clearly describe services related to "${subCategoryName}"
   - Use business name naturally
   - Have a different tone/style (e.g., formal, friendly, concise)
4. Keep tone:
   - Professional
   - Trustworthy
   - Human-like (not robotic)
5. Add 1–2 relevant keywords naturally in each.

--- TAGS ---
1. Generate 5–10 relevant tags.
2. Tags should be:
   - SEO-friendly
   - Related to "${subCategoryName}"
   - Mix of service + intent keywords
3. Keep tags short (1–3 words each).
4. No duplicates.

--- RULES ---
- Do NOT mention Place ID
- No emojis
- No explanations
- Avoid repeating same sentence structure

OUTPUT (STRICT JSON):
{
  "descriptions": [
    "desc1",
    "desc2",
    "desc3"
  ],
  "tags": ["tag1", "tag2", "tag3"]
}
`;
};

module.exports = { buildPrompt, buildPromptForBusinessDescription };
