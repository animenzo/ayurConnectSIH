const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

exports.addPatient = async (req, res) => {
    try {
        const { name, age, gender, contact, email, diseaseName, NAMC_CODE, ICD_11_code, symptoms, diagnosis, medicines } = req.body;

        // 1. Create the new patient object
        const newPatient = new Patient({
            doctor: req.user.id, // From auth middleware
            name,
            age,
            gender,
            contact,
            email,
            medicalHistory: [{
                diseaseName,
                NAMC_CODE,
                ICD_11_code,
                symptoms,
                diagnosis,
                medicines
            }]
        });

        // 2. Save the patient (This triggers the PAT-ID middleware we wrote earlier)
        const savedPatient = await newPatient.save();

        // 3. Link this patient to the Doctor's record
        await Doctor.findByIdAndUpdate(req.user.id, {
            $push: { patients: savedPatient._id }
        });

        res.status(201).json({
            msg: "Patient record created successfully",
            patientId: savedPatient.patientId,
            patient: savedPatient
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error while saving patient");
    }
};

exports.addConsultation = async (req, res) => {
  try {
    const { NAMC_CODE, diseaseName, icdCode, symptoms, diagnosis, medicines, patientId } = req.body;

    // 1. FIRST: We must fetch and define the 'doctor' variable
    const doctor = await Doctor.findById(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    // 2. SECOND: Now that 'doctor' exists, we can safely use doctor.name
    const newRecord = {
      doctorName: doctor.name,       
      doctorId: doctor.doctorId,     
      NAMC_CODE,
      diseaseName,
      icdCode,
      symptoms,
      diagnosis,
      medicines,
      date: new Date()
    };

    // 3. THIRD: Find the patient and save
    const patient = await Patient.findOne({ patientId: patientId.toUpperCase() });
    
    if (!patient) {
        return res.status(404).json({ msg: "Patient not found" });
    }

    patient.medicalHistory.push(newRecord);
    await patient.save();

    res.json({ msg: "Consultation Saved", patient });
  } catch (err) {
    console.error("ADD CONSULTATION ERROR:", err);
    res.status(500).send("Error saving record");
  }
};

// controllers/patientController.js

exports.shareReport = async (req, res) => {
    try {
        const { patientId } = req.body;

        // Find the patient
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ msg: "Patient not found" });
        }

        // Since the record is already in patient.medicalHistory from the 'add-consultation' step,
        // sharing here acts as a confirmation/trigger for the patient's portal.

        // Optional: You could add a 'isShared: true' flag to the last history item if you want
        // to control visibility, but usually, just confirming the sync is enough.

        res.json({
            msg: `Medical report officially shared with ${patient.name}`,
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error during report sharing");
    }
};