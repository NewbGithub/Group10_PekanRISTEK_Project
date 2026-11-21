// Menggabungkan semua router menjadi satu.
const express = require('express');
const reportRoutes = require('./reportRoutes');
const referenceRoutes = require('./referenceRoutes');

const router = express.Router();

router.use('/reports', reportRoutes); // semua rute di reportRoutes otomatis berawalan /reports
router.use(referenceRoutes);          // /categories dan /locations

module.exports = router;
