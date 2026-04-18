const OpenAI = require("openai");

const deepseek = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Notice I added namasteCode as the FIRST parameter!
exports.getICD11Mapping = async (namasteCode, namcTerm, englishName, definition, existingICD_11_code, existingIcdTerm) => {
  let maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;

      // 1. Check if we already have a valid ICD-11 Code
      const hasValidICD_11_code = existingICD_11_code &&
        existingICD_11_code !== "Not Linked" &&
        existingICD_11_code !== "--" &&
        existingICD_11_code !== "No Exact Code" &&
        existingICD_11_code !== "No Code Found" &&
        existingICD_11_code !== "undefined";

      let prompt = "";

      // 2. THE IF-ELSE CONDITION
      if (hasValidICD_11_code) {
        console.log(`[AI] Valid code (${existingICD_11_code}) found for ${namasteCode}. Running Prompt 2 (Symptoms & Description ONLY).`);

        prompt = `
You are an expert in Clinical Medicine and Ayurvedic Informatics.

Your task is NOT to perform mapping. The ICD-11 code and NAMASTE code are already correct.

Your job is ONLY to:
1. Extract key symptoms
2. Generate a unified clinical description combining modern medicine and Ayurveda

-----------------------------------
INPUT DATA:
- Ayurvedic Term (Sanskrit): ${namcTerm}
- NAMASTE Code: ${namasteCode}
- ICD-11 Code: ${existingICD_11_code}
- ICD-11 Disease Name: ${existingIcdTerm}
- Modern English Equivalent: ${englishName || "Unknown"}
- Classical Description: ${definition || "None provided"}
-----------------------------------

TASK RULES:

STEP 1: SYMPTOM EXTRACTION
- Extract ONLY the most important symptoms
- Minimum: 3 symptoms
- Maximum: 6 symptoms
- Use clear, standardized medical terms
- Avoid vague or duplicate symptoms
- Focus on clinically relevant symptoms

STEP 2: COMMON DESCRIPTION
- Write 2-3 sentences combining:
  ✔ Modern clinical understanding (symptoms, pathology, organ system)
  ✔ Ayurvedic interpretation (Dosha involvement, Dushya, Srotas if applicable)

- The description MUST:
  • Be medically accurate
  • Be concise
  • Clearly connect Ayurveda with modern disease understanding

STEP 3: STRICT RULES
- DO NOT change or question ICD-11 or NAMASTE codes
- DO NOT perform mapping or validation
- DO NOT output ICD code again
- DO NOT add extra explanations

-----------------------------------

FINAL OUTPUT (JSON ONLY):
{
  "symptoms": [
    "Symptom 1",
    "Symptom 2",
    "Symptom 3"
  ],
  "commonDescription": "2-3 sentence unified explanation combining Ayurvedic and modern clinical understanding"
}
`;
      } else {
        console.log(`[AI] Missing code for ${namasteCode}. Running Prompt 1 (Full Investigation & Mapping).`);

        prompt = `
You are an elite WHO ICD-11 Medical Coding Expert AND Ayurvedic Clinical Informatics Specialist.

Your mission is STRICT SEMANTIC MATCHING, CLINICAL VALIDATION, and PRECISE ICD-11 CODE SELECTION.

-----------------------------------
INPUT DATA:
- Ayurvedic Term (Sanskrit): ${namcTerm}
- Modern English Equivalent: ${englishName || "Unknown"}
- Classical Description: ${definition || "None provided"}
-----------------------------------

MANDATORY STEP-BY-STEP REASONING:

STEP 1: AYURVEDIC UNDERSTANDING
- Extract:
  • Dominant Dosha (Vata / Pitta / Kapha)
  • Dushya (affected tissues)
  • Srotas (body system)
  • Lakshanas (symptoms)

STEP 2: SYMPTOM EXTRACTION (STRICT)
- Extract ONLY the MOST IMPORTANT symptoms
- Minimum: 3 symptoms
- Maximum: 6 symptoms
- Use clear, standardized medical terminology

STEP 3: MODERN CLINICAL TRANSLATION
- Convert Ayurvedic description into:
  • Symptoms
  • Pathophysiology (infection, inflammation, degeneration, etc.)
  • Organ/system involved

STEP 4: ICD-11 SEARCH & MATCHING
- Find diseases where symptoms STRONGLY MATCH, pathophysiology aligns, and same organ/system.

STEP 5: DIFFERENTIAL DIAGNOSIS (MANDATORY)
- Consider at least 2-3 ICD-11 candidates. Compare and choose BEST match.

STEP 6: TM2 RULE
- Prefer TM2 (Chapter 26) ONLY if EXACT match. TM2 codes typically start with "S".
- DO NOT force TM2 if mismatch exists.

STEP 7: STRICT VALIDATION CHECK
- If symptoms, system, or mechanism do not align -> REJECT and retry.

STEP 8: SIMILARITY SCORING
- 90-100 -> Nearly exact  
- 75-89 -> Strong  
- 60-74 -> Moderate  
- <60 -> REJECT and retry  

STEP 9: STRICT CODING RULES
- MUST return valid alphanumeric ICD-11 code.
- NEVER return empty / N/A / Not Linked.
- ALWAYS choose most specific diagnosis.

-----------------------------------

FINAL OUTPUT (JSON ONLY):
{
  "icd11Code": "Specific ICD-11 Code",
  "icd11Term": "Exact ICD-11 disease name",
  "symptoms": [
    "Symptom 1",
    "Symptom 2",
    "Symptom 3"
  ],
  "commonDescription": "2-3 sentence explanation combining Ayurvedic Dosha pathology with modern clinical understanding",
  "matchingPercentage": Number
}
`;
      }

      // Call the NVIDIA DeepSeek API
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1-terminus",
        messages: [
          { role: "system", content: "You are a specialized AI that outputs ONLY valid JSON with no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.0,
        top_p: 0.7,
        max_tokens: 1000,
        chat_template_kwargs: { "thinking": false },
        stream: false
      });

      let responseText = completion.choices[0].message.content;
      responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

      let parsedData = JSON.parse(responseText);

      // SAFETY NET: If Prompt 2 was used, it doesn't return the ICD code. 
      // We manually attach the existing database code to the object so your controller doesn't accidentally overwrite it with 'undefined'!
      if (hasValidICD_11_code) {
        parsedData.icd11Code = existingICD_11_code;
        parsedData.icd11Term = existingIcdTerm;
      }

      return parsedData;

    } catch (error) {
      console.error(`⚠️ [DeepSeek AI] Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 3 seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error("❌ [DeepSeek AI] Max retries reached.");
        return null;
      }
    }
  }
};