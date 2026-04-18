const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Doctor Routes
router.post('/register', authController.registerDoctor);
router.post('/login', authController.loginDoctor);

// --- ADD PATIENT ROUTES HERE ---
// This must match the URL: /api/auth/patient/register
router.post('/patient/register', authController.registerPatient); 
router.post('/patient/login', authController.loginPatient);

module.exports = router;