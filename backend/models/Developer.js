const mongoose = require("mongoose");

const DeveloperSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  requestsMade: { type: Number, default: 0 } // Bonus: We can track their usage!
}, { timestamps: true });

module.exports = mongoose.model("Developer", DeveloperSchema);