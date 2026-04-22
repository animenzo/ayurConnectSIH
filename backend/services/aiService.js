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
  // SCENARIO A: CODE EXISTS (Safe Mode)
  // =========================================================================
  if (hasValidICD_11_code) {
    console.log(`⚡ Code exists (${existingICD_11_code}). Fetching rapid description...`);
    
    const prompt2 = `
    Generate ONLY a JSON object. No intro, no explanations.
    Data: ${namcTerm}, ICD-11: ${existingICD_11_code} (${existingIcdTerm}).
    Task: Return {"symptoms": ["3-5 precise symptoms"], "commonDescription": "2 concise sentences explaining the disease combining modern and Ayurvedic terms."}`;

    try {
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1-terminus",
        messages: [{ role: "user", content: prompt2 }],
        temperature: 0.0, 
        max_tokens: 150,  
        response_format: { type: "json_object" },
        timeout: 2000 // Fast timeout
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
  // SCENARIO B: NO CODE EXISTS (2-Shot Speed Tournament)
  // =========================================================================
  console.log(`🤖 Missing code. Running 2-Shot Speed Search...`);

  const maxRetries = 2; 
  let attempt = 1;
  let bestFallbackResult = null; 
  let failedCode = null; // Keeps track of what WHO rejected

  while (attempt <= maxRetries) {
    try {
      // PROMPT ENGINEERING: If it's attempt 2, we tell the AI what it got wrong!
      let prompt1 = `
      Act as an internet-connected ICD-11 Expert. Cross-reference your web-knowledge. Output ONLY JSON.
      Ayurvedic Term: ${namcTerm} (${englishName || "Unknown"}). Desc: ${definition || "N/A"}.
      
      Task: Find the exact ICD-11 Code.
      Format EXACTLY as:
      {
        "icd11Code": "Code",
        "icd11Term": "Name",
        "symptoms": ["Symptom 1", "Symptom 2"],
        "commonDescription": "2 concise sentences explaining the condition.",
        "matchingPercentage": Number (0-100) // BE HONEST ABOUT ACCURACY
      }`;

      if (failedCode) {
        prompt1 += `\n⚠️ CRITICAL: You previously guessed "${failedCode}" and the official WHO API rejected it. DO NOT guess ${failedCode} again. Search deeper for the correct alternative.`;
      }

      // Hard Limit: 3.5 seconds per AI call. (2 calls = 7 seconds total)
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1-terminus",
        messages: [{ role: "user", content: prompt1 }],
        temperature: attempt === 1 ? 0.0 : 0.3, // Attempt 1 is strict. Attempt 2 allows slight creativity to find alternatives.
        max_tokens: 200,  
        response_format: { type: "json_object" },
        timeout: 3000 
      });

      let responseText = completion.choices[0].message.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsedData = JSON.parse(responseText);
      const generatedCode = parsedData.icd11Code;
      const accuracy = parsedData.matchingPercentage || 0;

      console.log(`[Attempt ${attempt}/2] AI Suggested: ${generatedCode} (${accuracy}% accuracy). Checking WHO...`);

      // Cross-Verify with WHO API
      const whoVerification = await verifyIcdCode(generatedCode);

      if (whoVerification.isValid) {
        console.log(`✅ WHO Verified! Stopping search.`);
        parsedData.icd11Term = whoVerification.officialTitle;
        return parsedData; // WHO approved it. Stop and return instantly!
      } else {
        console.warn(`⚠️ WHO rejected ${generatedCode}.`);
        
        // Save the rejected code so we can tell the AI not to use it again
        failedCode = generatedCode;

        // ACCURACY TOURNAMENT: Does this failed attempt have a higher score than the previous failed attempt?
        if (!bestFallbackResult || accuracy > bestFallbackResult.matchingPercentage) {
          bestFallbackResult = parsedData;
        }

        attempt++; // Move to Attempt 2
      }

    } catch (error) {
      console.error(`[Attempt ${attempt} Error]:`, error.message);
      attempt++; // Even if it crashes, force it to the next attempt to keep the timer moving
    }
  } // End of While Loop

  // =========================================================================
  // TOURNAMENT RESOLUTION (After 2 failed attempts or timeouts)
  // =========================================================================
  if (bestFallbackResult) {
    console.log(`🏁 Both attempts failed WHO validation. Using the code with the highest AI accuracy: ${bestFallbackResult.icd11Code} (${bestFallbackResult.matchingPercentage}%)`);
    return bestFallbackResult;
  }

  // Extreme fallback if Nvidia goes completely offline
  console.error("❌ Total AI failure. Returning null.");
  return null; 
};