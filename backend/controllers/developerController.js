const Developer = require('../models/Developer');
const crypto = require('crypto');

exports.generateApiKey = async (req, res) => {
  try {
    const { organizationName, email } = req.body;

    if (!organizationName || !email) {
      return res.status(400).json({ error: "Organization name and email are required." });
    }

    // Check if they already have an account
    const existingDev = await Developer.findOne({ email });
    if (existingDev) {
      return res.status(400).json({ error: "An API key is already registered to this email." });
    }

    // Generate a secure, 32-character hex API key
    const rawKey = crypto.randomBytes(32).toString('hex');
    const newApiKey = `nmst_live_${rawKey}`;

    // Save to Database
    const newDeveloper = new Developer({
      organizationName,
      email,
      apiKey: newApiKey
    });

    await newDeveloper.save();

    // Return the key to the user (ONLY ONCE!)
    res.status(201).json({
      success: true,
      message: "API Key generated successfully. Please save it now, it will not be shown again.",
      apiKey: newApiKey
    });

  } catch (err) {
    console.error("Key Generation Error:", err);
    res.status(500).json({ error: "Server error generating key." });
  }
};