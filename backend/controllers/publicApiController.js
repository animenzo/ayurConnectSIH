// backend/controllers/publicApiController.js
const Disease = require('../models/Disease');

// Helper function to format the database object for public consumption
const formatResponse = (disease) => ({
  namasteCode: disease.NAMC_CODE,
  namasteTerm: disease.NAMC_term,
  sanskritTerm: disease.NAMC_term_DEVANAGARI || null,
  englishDefinition: disease.short_definition || null,
  category: disease.ontology_branches || "Uncategorized",
  icd11: {
    code: disease.ICD_11_code !== "Not Linked" ? disease.ICD_11_code : null,
    term: disease.icd11Term || null,
    commonDescription: disease.commonDescription || null,
    matchConfidence: disease.matchingPercentage || 0
  },
  metadata: {
    lastUpdated: disease.updatedAt
  }
});

// GET: Search mappings (/api/v1/mappings/search?q=...)
exports.searchMappings = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: "Query parameter 'q' is required." });
    }

    // Search across English, Sanskrit, and NAMC Codes
    const diseases = await Disease.find({
      $or: [
        { NAMC_term: { $regex: q, $options: 'i' } },
        { NAMC_term_DEVANAGARI: { $regex: q, $options: 'i' } },
        { short_definition: { $regex: q, $options: 'i' } },
        { NAMC_CODE: { $regex: q, $options: 'i' } }
      ]
    }).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: diseases.length,
      data: diseases.map(formatResponse)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error during search." });
  }
};


// GET: Get specific mapping by NAMASTE Code (/api/v1/mappings/:code)
exports.getMappingByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const disease = await Disease.findOne({ NAMC_CODE: code });

    if (!disease) {
      return res.status(404).json({ success: false, error: `No mapping found for code: ${code}` });
    }

    res.status(200).json({
      success: true,
      data: formatResponse(disease)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error fetching mapping." });
  }
};

// backend/controllers/publicApiController.js

exports.validateFHIR = async (req, res) => {
  try {
    const { namasteCode, fhirResource } = req.body;

    // 1. Basic FHIR Structure Check
    if (fhirResource.resourceType !== 'Condition' && fhirResource.resourceType !== 'Observation') {
      return res.status(400).json({ success: false, error: "Unsupported FHIR Resource Type." });
    }

    // 2. Fetch your local mapping from DB
    const disease = await Disease.findOne({ NAMC_CODE: namasteCode });
    if (!disease) return res.status(404).json({ success: false, error: "NAMASTE code not found." });

    // 3. Extract Codings from the FHIR Resource
    // FHIR codes are always in: resource.code.coding[]
    const externalCodings = fhirResource.code?.coding || [];

    // 4. Perform Mapping Logic
    // In the real world, we check if the ICD-11 code we have matches the one in the FHIR resource
    const match = externalCodings.find(coding =>
      coding.code === disease.ICD_11_code ||
      coding.display?.toLowerCase() === disease.NAMC_term?.toLowerCase()
    );

    const matchScore = match ? 1.0 : 0.0;
    res.status(200).json({
      resourceType: "ConceptMap",
      id: `mapping-${disease.NAMC_CODE}`,
      text: {
        status: "generated",
        // This dynamically generates the human-readable HTML for the doctor's screen
        div: `<div xmlns=\"http://www.w3.org/1999/xhtml\"><h2>NAMASTE to ICD-11 Mapping</h2><p>Translating Ayurvedic concept ${disease.NAMC_CODE} (${disease.NAMC_term}) to modern ICD-11 code ${disease.ICD_11_code || "Unmapped"} (${disease.icd11Term || "Unmapped"}).</p></div>`
      },
      url: "https://ayurconnect-portal.onrender.com/v1/ConceptMap",
      version: "1.0",
      name: "NamasteToICD11",
      title: "NAMASTE to ICD-11 TM2 Translation",
      status: "active",
      sourceUri: "http://namaste-portal.gov.in/terminology",
      targetUri: "http://id.who.int/icd/release/11/mms",
      group: [
        {
          "source": "http://namaste-portal.gov.in/terminology",
          "target": "http://id.who.int/icd/release/11/mms",
          "element": [
            {
              "code": disease.NAMC_CODE,
              "display": disease.NAMC_term,
              "target": [
                {
                  "code": disease.ICD_11_code || "Unmapped",
                  "display": disease.icd11Term || "Unmapped",
                  "equivalence": matchScore > 0.5 ? "equivalent" : "unmatched"
                }
              ]
            }
          ]
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "FHIR Validation Engine Error." });
  }
};