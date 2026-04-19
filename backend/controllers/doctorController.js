// controllers/doctorController.js
const Doctor = require('../models/Doctor');

exports.getProfile = async (req, res) => {
  try {
    // 1. Find the doctor by the ID provided in the auth token
    // 2. .select('-password') ensures we never accidentally send the password to the frontend
    // 3. .populate('patients') grabs the full patient details instead of just raw IDs!
    const doctor = await Doctor.findById(req.user.id)
      .select('-password')
      .populate('patients'); 

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    // Send the populated doctor object back to React
    res.json({ success: true, doctor });

  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ message: "Server Error while fetching doctor profile." });
  }
};