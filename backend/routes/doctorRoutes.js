const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const Message = require('../models/Message'); // Make sure to import the Message model at the top!

// GET: Fetch Doctor Profile and Patient List
router.get('/profile', auth, async (req, res) => {
  try {
    // .populate('patients') grabs the actual patient data, not just the IDs
    const doctor = await Doctor.findById(req.user.id).populate('patients').select('-password');
    res.json(doctor);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});



// GET /api/doctors/unread-messages
router.get('/unread-messages', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).populate('patients');
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    // Get an array of just the patient IDs this doctor manages
    const patientIds = doctor.patients.map(p => p.patientId);

    // MongoDB Aggregation: Find all unread messages from these patients and count them
    const unreadCounts = await Message.aggregate([
      { 
        $match: { 
          room: { $in: patientIds }, 
          senderRole: 'Patient', 
          isRead: false 
        } 
      },
      { 
        $group: { 
          _id: '$room', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Format the data for the frontend
    const formatted = unreadCounts.map(u => ({ patientId: u._id, count: u.count }));
    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error fetching notifications");
  }
});
module.exports = router;