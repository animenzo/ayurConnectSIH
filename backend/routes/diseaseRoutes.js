const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');

// ==========================================
// 1. STATIC ROUTES (These MUST go first)
// ==========================================
router.get('/stats', diseaseController.getDashboardStats);
router.get('/recent', diseaseController.getRecentMappings);
router.get('/search', diseaseController.advancedSearch); // Ensure it points to advancedSearch!

// ==========================================
// 2. DYNAMIC ROUTES (These MUST go last)
// ==========================================
// Put this line back into your routes file:
router.post('/sync-ai/:id', diseaseController.syncWithAI);

// If you still have the old details route, it goes at the bottom
if (diseaseController.getDiseaseDetails) {
    router.get('/details/:code', diseaseController.getDiseaseDetails);
}
router.get('/',diseaseController.getAllCodes
);
// Add this near your other routes
router.post('/trigger-ai', diseaseController.triggerAiMapping);

module.exports = router;