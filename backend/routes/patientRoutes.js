const express = require('express');
const router = express.Router();
const Disease = require('../models/Disease');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const { addPatient, addConsultation, shareReport } = require('../controllers/patientController');
const Message = require('../models/Message'); // Ensure this is imported at the top!

/**
 * @route   GET api/patients/lookup/:query
 * @desc    Auto-fill disease details using NAMC Code or English Name
 * @access  Private (Doctor only)
 */
router.get('/lookup/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;

    // Search for a match in either the NAMASTE Code or the English Name
    const disease = await Disease.findOne({
      $or: [
        { NAMC_CODE: { $regex: `^${query}$`, $options: 'i' } },
        { name_english: { $regex: query, $options: 'i' } }
      ]
    });

    if (!disease) {
      return res.status(404).json({ msg: "No matching terminology found" });
    }

    // Return the specific fields needed for the AddPatient form auto-fill
    res.json({
      name: disease.name_english,
      namc: disease.NAMC_CODE,
      icd: disease.ICD_11_code,
      symptoms: disease.symptoms || [],
      description: disease.commonDescription
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error during lookup");
  }
});

/**
 * @route   POST api/patients/add
 * @desc    Register a new patient and save the initial consultation
 * @access  Private (Doctor only)
 */
router.post('/add', auth, addPatient);
router.post('/add-consultation', auth, addConsultation);

// GET /api/patients/my-history
// This uses the token to find the patient and return their medicalHistory
// GET /api/patients/my-history


router.post('/share-report', auth, shareReport);
/**
 * @route   GET api/patients/search
 * @desc    Search doctor's patients by Name or Patient ID
 * @access  Private (Doctor only)
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await Patient.find({
      doctor: req.user.id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(patients);
  } catch (err) {
    res.status(500).send("Search Error");
  }
});

router.get('/my-history', auth, async (req, res) => {
  try {
    // The 'auth' middleware puts the user ID in req.user.id
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ msg: "Patient record not found" });
    }

    res.json({
      medicalHistory: patient.medicalHistory || [],
      name: patient.name
    });
  } catch (err) {
    console.error("MY-HISTORY ERROR:", err.message); // Check terminal for the real error
    res.status(500).send("Server Error fetching history");
  }
});
// GET /api/patients/verify/:id
router.get('/verify/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) return res.status(404).json({ msg: "Patient not found" });

    // Only return public info for verification
    res.json({ name: patient.name, id: patient._id });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


// GET /api/patients/unread-messages
router.get('/unread-messages', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) return res.status(404).json({ msg: "Patient not found" });

    // Count how many unread messages are from the Doctor in this patient's room
    const unreadCount = await Message.countDocuments({
      room: patient.patientId,
      senderRole: 'Doctor',
      isRead: false
    });

    res.json({ count: unreadCount });
  } catch (err) {
    console.error("Patient Notification Error:", err);
    res.status(500).send("Server Error fetching notifications");
  }
});

module.exports = router;