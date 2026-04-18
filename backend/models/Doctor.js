const mongoose = require("mongoose");
const crypto = require("crypto"); // Built-in Node tool for random strings

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  // We keep 'unique' and 'required', but we remove them from the input form
  doctorId: { type: String, unique: true }, 
  specialization: String,
  clinicName: String,
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }]
}, { timestamps: true });

// --- THE AUTO-GENERATION LOGIC ---
DoctorSchema.pre("save", async function () {
  // Only generate ID if it's a new doctor
  if (!this.isNew) return;

  const year = new Date().getFullYear();
  const randomStr = crypto.randomBytes(2).toString("hex").toUpperCase();
  
  // Format: DOC-2026-A1B2
  this.doctorId = `DOC-${year}-${randomStr}`;
});

module.exports = mongoose.model("Doctor", DoctorSchema);