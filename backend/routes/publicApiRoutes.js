// backend/routes/publicApiRoutes.js
const express = require('express');
const router = express.Router();
const publicApiController = require('../controllers/publicApiController');
const { requireApiKey } = require('../middleware/apiAuth');

// Apply the API Key middleware to all routes in this file
router.use(requireApiKey);

// Routes
router.get('/mappings/search', publicApiController.searchMappings);
router.get('/mappings/:code', publicApiController.getMappingByCode);

module.exports = router;