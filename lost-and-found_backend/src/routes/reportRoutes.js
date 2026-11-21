// Peta URL -> fungsi. Router ini dipasang di path "/reports" (lihat routes/index.js).
const express = require('express');
const reportController = require('../controllers/reportController');
const uploadImage = require('../middlewares/uploadImage');

const router = express.Router();

router.get('/', reportController.getReports);          // GET  /reports
router.get('/:id', reportController.getReportById);    // GET  /reports/:id
router.post('/', uploadImage, reportController.createReport); // POST /reports  (uploadImage jalan dulu)

// Tidak ada router.put / router.patch / router.delete -> publik tidak bisa mengubah/menghapus laporan.

module.exports = router;
