const mongoose = require("mongoose");
const crypto = require("crypto");

const PatientSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  patientId: { type: String, unique: true }, // Auto-generated
  name: { type: String, required: true },
  age: Number,
  gender: String,
  contact: { type: String, required: true },
  email: String,
password: { type: String, required: true, select: false }, // 👈 ADD THIS LINE
  medicalHistory: [{
    doctorName: { type: String }, // 🔴 YOU MUST ADD THIS
    doctorId: { type: String },
    date: { type: Date, default: Date.now },
    diseaseName: String,
    NAMC_CODE: String,
    ICD_11_code: String,
    symptoms: [String],
    diagnosis: String,
    doctorDiagnosis: String, // <-- Make sure this is here
    doctorNotes: String,
    medicines: [{
      name: String,
      dosage: String,
      duration: String
    }]
  }]
}, { timestamps: true });

PatientSchema.pre("save", async function () {
  if (!this.isNew) return;

  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  // Format: PAT-F3B2A1
  this.patientId = `PAT-${randomStr}`;
});

module.exports = mongoose.model("Patient", PatientSchema);