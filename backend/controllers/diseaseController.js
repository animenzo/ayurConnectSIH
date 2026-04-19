const Disease = require('../models/Disease');
const { getICD11Mapping } = require('../services/aiService');
// 1. Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalMappings = await Disease.countDocuments();

    // Count how many have an actual ICD-11 code
    const mappedToIcd = await Disease.countDocuments({
      ICD_11_code: { $nin: ["Not Linked", "Pending", "", null] }
    });

    // Count how many have a > 80% match
    const highConfidence = await Disease.countDocuments({
      matchingPercentage: { $gt: 80 }
    });

    res.status(200).json({
      totalMappings,
      mappedToIcd,
      highConfidence,
      pendingReview: totalMappings - mappedToIcd
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// 2. Recent Mappings
exports.getRecentMappings = async (req, res) => {
  try {
    // Sorts by newest created/updated
    const recent = await Disease.find().sort({ updatedAt: -1 }).limit(3);
    res.status(200).json(recent);
  } catch (err) {
    console.error("Recent Mappings Error:", err);
    res.status(500).json({ error: "Failed to fetch recent mappings" });
  }
};

// Make sure this is at the top of your controller file
const activeMappingLocks = new Set();
exports.advancedSearch = async (req, res) => {
  try {
    const { q, type, category, confidence } = req.query;

    let queryFilter = {};
    let andConditions = [];

    // --- TEXT SEARCH FILTER ---
    if (q && q.trim() !== '') {
      const searchRegex = { $regex: q, $options: 'i' };

      if (type === 'ayurvedic') {
        andConditions.push({ $or: [{ NAMC_term: searchRegex }, { NAMC_term_DEVANAGARI: searchRegex }, { NAMC_term_diacritical: searchRegex }] });
      } else if (type === 'english') {
        andConditions.push({ $or: [{ name_english: searchRegex }, { name_english_under_index: searchRegex }, { primary_index_related: searchRegex }] });
      } else if (type === 'code') {
        andConditions.push({ $or: [{ NAMC_CODE: searchRegex }, { ICD_11_code: searchRegex }] });
      } else {
        andConditions.push({ $or: [{ NAMC_term: searchRegex }, { NAMC_term_DEVANAGARI: searchRegex }, { name_english: searchRegex }, { NAMC_CODE: searchRegex }, { ICD_11_code: searchRegex }] });
      }
    }

    if (category && category !== 'All Categories') andConditions.push({ ontology_branches: { $regex: category, $options: 'i' } });
    if (confidence && confidence !== 'All Levels') {
      if (confidence === 'High') andConditions.push({ matchingPercentage: { $gte: 80 } });
      else if (confidence === 'Medium') andConditions.push({ matchingPercentage: { $gte: 50, $lt: 80 } });
      else if (confidence === 'Low') andConditions.push({ matchingPercentage: { $lt: 50, $gt: 0 } });
      else if (confidence === 'Unmapped' || confidence === 'Pending') andConditions.push({ ICD_11_code: "Not Linked" });
    }

    if (andConditions.length > 0) queryFilter = { $and: andConditions };

    // JUST FETCH AND RETURN - NO AI HERE ANYMORE!
    let results = await Disease.find(queryFilter).limit(50);
    res.status(200).json(results);

  } catch (err) {
    console.error("Search API Error:", err);
    res.status(500).json({ error: "Server search failed" });
  }
};




// NEW: Dedicated On-Demand AI Trigger
// NEW: Dedicated On-Demand AI Trigger
exports.triggerAiMapping = async (req, res) => {
  try {
    const { NAMC_CODE } = req.body;

    if (!NAMC_CODE) return res.status(400).json({ error: "NAMC Code is required" });

    let disease = await Disease.findOne({ NAMC_CODE: NAMC_CODE });
    if (!disease) return res.status(404).json({ error: "Disease not found" });

    const hasICD_11_code = disease.ICD_11_code &&
      disease.ICD_11_code !== "Not Linked" &&
      disease.ICD_11_code !== "--" &&
      disease.ICD_11_code !== "No Exact Code";
    const hasDescription = disease.commonDescription && disease.commonDescription.trim() !== "";

    // If it already has data, just return it instantly!
    if (hasICD_11_code && hasDescription) {
      return res.status(200).json(disease);
    }

    console.log(`⚡ [AI] Generating mapping on demand for ${NAMC_CODE}...`);

    // FIX 1: PASS ALL 6 ARGUMENTS IN THE CORRECT ORDER
    const mapping = await getICD11Mapping(
      disease.NAMC_CODE,                                   // 1. namasteCode
      disease.NAMC_term_DEVANAGARI || disease.NAMC_term,   // 2. namcTerm
      disease.name_english,                                // 3. englishName
      disease.long_definition || disease.short_definition, // 4. definition
      disease.ICD_11_code,                                 // 5. existingICD_11_code
      disease.icd11Term                                    // 6. existingIcdTerm
    );

    // FIX 2: THE NULL CHECK (Prevents the crash if AI fails)
    if (!mapping) {
      console.error(`❌ [AI] Failed to generate a WHO-verified code for ${NAMC_CODE}`);
      return res.status(500).json({ error: "AI failed to find a WHO-verified code." });
    }

    // Our new turbo AI returns `icd11Code`
    const newlyGeneratedCode = mapping.icd11Code || mapping.ICD_11_code;

    if (newlyGeneratedCode && newlyGeneratedCode !== "Not Linked") {
      disease.ICD_11_code = newlyGeneratedCode;
      disease.icd11Term = mapping.icd11Term || disease.icd11Term;
      disease.commonDescription = mapping.commonDescription || disease.commonDescription;
      disease.matchingPercentage = mapping.matchingPercentage || disease.matchingPercentage;
      disease.symptoms = mapping.symptoms || [];
      await disease.save();
      console.log(`✅ [AI] SUCCESS! Saved ${disease.ICD_11_code} for ${NAMC_CODE}`);
    }

    // Return the freshly updated disease back to the frontend
    res.status(200).json(disease);

  } catch (err) {
    console.error("AI Mapping Trigger Error:", err);
    res.status(500).json({ error: "Failed to generate AI mapping" });
  }
};


exports.syncWithAI = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ message: "Disease not found in database." });

    // FIX 3: ALSO PASS ALL 6 ARGUMENTS HERE
    const mapping = await getICD11Mapping(
      disease.NAMC_CODE,                                   // 1. namasteCode
      disease.NAMC_term_DEVANAGARI || disease.NAMC_term,   // 2. namcTerm
      disease.name_english,                                // 3. englishName
      disease.long_definition || disease.short_definition, // 4. definition
      disease.ICD_11_code,                                 // 5. existingICD_11_code
      disease.icd11Term                                    // 6. existingIcdTerm
    );

    // FIX 4: CHECK FOR NULL AND USE PROPER VARIABLE NAME
    if (mapping && (mapping.icd11Code || mapping.ICD_11_code)) {
      disease.ICD_11_code = mapping.icd11Code || mapping.ICD_11_code;
      disease.icd11Term = mapping.icd11Term;
      disease.commonDescription = mapping.commonDescription; 
      disease.matchingPercentage = mapping.matchingPercentage;

      await disease.save();
      res.status(200).json(disease);
    } else {
      res.status(400).json({ message: "AI failed to generate a clinical mapping or was rejected by WHO." });
    }
  } catch (err) {
    console.error("AI Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCodes =  async (req, res) => {
  try {
    // .find() with no arguments returns every document in the collection
    const allCodes = await Disease.find(); 
    res.json(allCodes);
  } catch (error) {
    console.error("Error fetching all codes:", error);
    res.status(500).json({ message: "Server Error" });
  }
}


// exports.syncWithAI = async (req, res) => {
//   try {
//     const disease = await Disease.findById(req.params.id);
//     if (!disease) return res.status(404).json({ message: "Disease not found in database." });

//     // PASS ALL THE NEW PARAMETERS TO THE AI SERVICE!
//     // The AI needs to know if a code already exists so it knows which scenario to run.
//     const mapping = await getICD11Mapping(
//       disease.NAMC_term_DEVANAGARI || disease.NAMC_term, // Prefer Sanskrit, fallback to English script
//       disease.name_english,                              // The English name from CSV
//       disease.short_definition || disease.long_definition, // Definition context
//       disease.ICD_11_code,                                 // Tells AI if it's mapped or not!
//       disease.icd11Term
//     );

//     if (mapping && mapping.ICD_11_code) {
//       // OVERWRITE THE DATABASE WITH THE AI'S RESULTS
//       disease.ICD_11_code = mapping.ICD_11_code;
//       disease.icd11Term = mapping.icd11Term;
//       disease.commonDescription = mapping.commonDescription; // This now contains Symptoms + Pathology!
//       disease.matchingPercentage = mapping.matchingPercentage;

//       await disease.save();
//       res.status(200).json(disease);
//     } else {
//       res.status(400).json({ message: "Gemini failed to generate a clinical mapping." });
//     }
//   } catch (err) {
//     console.error("AI Sync Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };