const Developer = require('../models/Developer');

const requireApiKey = async (req, res, next) => {
  try {
    const clientApiKey = req.headers['x-api-key'];

    if (!clientApiKey) {
      return res.status(401).json({ success: false, error: "Unauthorized: Missing x-api-key header." });
    }

    // Look up the key in MongoDB
    const developer = await Developer.findOne({ apiKey: clientApiKey, isActive: true });

    if (!developer) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid or revoked API Key." });
    }

    // Optional: Track usage (increment their request count)
    developer.requestsMade += 1;
    await developer.save();

    // Attach the developer info to the request so controllers know who is asking
    req.developer = developer; 
    
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal Server Error during authentication." });
  }
};

module.exports = { requireApiKey };