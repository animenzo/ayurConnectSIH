const OpenAI = require("openai");
const { verifyIcdCode } = require('./icd11Service'); 
require("dotenv").config();

const deepseek = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

exports.getICD11Mapping = async (namasteCode, namcTerm, englishName, definition, existingICD_11_code, existingIcdTerm) => {
  
  const hasValidICD_11_code = 
    existingICD_11_code &&
    existingICD_11_code !== "Not Linked" &&
    existingICD_11_code !== "--" &&
    existingICD_11_code !== "No Exact Code" &&
    existingICD_11_code !== "No Code Found" &&
    existingICD_11_code !== "undefined" &&
    existingICD_11_code.trim() !== "";

  // =========================================================================
  // SCENARIO A: CODE EXISTS (Turbo Description Mode)
  // =========================================================================
  if (hasValidICD_11_code) {
    console.log(`⚡ Code exists (${existingICD_11_code}). Fetching rapid description...`);
    
    // ULTRA-SHORT PROMPT FOR SPEED
    const prompt2 = `
    Generate ONLY a JSON object. No intro, no explanations.
    Data: ${namcTerm}, ICD-11: ${existingICD_11_code} (${existingIcdTerm}).
    Task: Return {"symptoms": ["3-5 precise symptoms"], "commonDescription": "2 concise sentences explaining the disease combining modern and Ayurvedic terms."}`;

    try {
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1-terminus",
        messages: [{ role: "user", content: prompt2 }],
        temperature: 0.0, // 0.0 is the fastest
        max_tokens: 150,  // Forces the AI to stop generating quickly
        response_format: { type: "json_object" }
      });

      let parsedData = JSON.parse(completion.choices[0].message.content.replace(/```json/gi, '').replace(/```/gi, '').trim());
      
      return {
        icd11Code: existingICD_11_code,
        icd11Term: existingIcdTerm,
        symptoms: parsedData.symptoms || [],
        commonDescription: parsedData.commonDescription || definition,
        matchingPercentage: 100 
      };
    } catch (error) {
      console.error("Fast Description failed:", error.message);
      return { icd11Code: existingICD_11_code, icd11Term: existingIcdTerm, symptoms: [], commonDescription: definition, matchingPercentage: 100 };
    }
  }

  // =========================================================================
  // SCENARIO B: NO CODE EXISTS (Turbo Search Mode)
  // =========================================================================
  console.log(`🤖 Missing code. Running Turbo AI Search...`);

  const maxRetries = 2; 
  let attempt = 0;
  let bestFallbackResult = null; 

  while (attempt < maxRetries) {
    attempt++;
    try {
      // LEAN PROMPT: Stripped of heavy reasoning instructions to save TTFT (Time To First Token)
      const prompt1 = `
      You are an ICD-11 Expert. Output ONLY JSON. No thinking steps.
      Ayurvedic Term: ${namcTerm} (${englishName || "Unknown"}). Desc: ${definition || "N/A"}.
      
      Task: Find the exact ICD-11 Code.
      Format EXACTLY as:
      {
        "icd11Code": "Code",
        "icd11Term": "Name",
        "symptoms": ["Symptom 1", "Symptom 2"],
        "commonDescription": "2 concise sentences explaining the condition.",
        "matchingPercentage": Number (0-100)
      }`;

      const completion = await deepseek.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1-terminus",
        messages: [{ role: "user", content: prompt1 }],
        temperature: 0.0, // Max speed
        max_tokens: 200,  // Strict cutoff
        response_format: { type: "json_object" }
      });

      let responseText = completion.choices[0].message.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsedData = JSON.parse(responseText);
      const generatedCode = parsedData.icd11Code;
      const accuracy = parsedData.matchingPercentage || 0;

      // Cross-Verify with WHO API
      const whoVerification = await verifyIcdCode(generatedCode);

      if (!whoVerification.isValid) {
        console.warn(`⚠️ WHO Rejected: ${generatedCode}. Retrying...`);
        throw new Error("Invalid WHO Code"); 
      }

      parsedData.icd11Term = whoVerification.officialTitle;

      if (accuracy > 60) {
        return parsedData; // Instant success
      } else {
        if (!bestFallbackResult || accuracy > bestFallbackResult.matchingPercentage) {
          bestFallbackResult = parsedData;
        }
        if (attempt < maxRetries) continue; 
      }

    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Dropped wait time from 2s to 0.5s
      }
    }
  } 

  if (bestFallbackResult) return bestFallbackResult;
  return null;
};