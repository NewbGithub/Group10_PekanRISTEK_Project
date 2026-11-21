const express = require('express');
const referenceController = require('../controllers/referenceController');

const router = express.Router();

router.get('/categories', referenceController.getCategories); // GET /categories
router.get('/locations', referenceController.getLocations);   // GET /locations

module.exports = router;
