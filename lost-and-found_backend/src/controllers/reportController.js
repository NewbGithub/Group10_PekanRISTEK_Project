// Controller = "penerima tamu": ambil data dari request -> validasi -> panggil service -> kirim response.
const reportService = require('../services/reportService');
const { validateListQuery, validateCreateBody } = require('../validators/reportValidator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

// GET /reports
const getReports = asyncHandler(async (req, res) => {
  const { errors, value } = validateListQuery(req.query);          // req.query = bagian ?a=b&c=d
  if (errors.length > 0) throw new AppError(400, 'Validation failed', errors);

  const result = await reportService.listReports(value);
  return sendSuccess(res, {
    message: 'Reports retrieved successfully',
    data: result.data,
    meta: { pagination: result.pagination },
  });
});

// GET /reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(req.params.id); // req.params.id = bagian :id pada URL
  return sendSuccess(res, { message: 'Report retrieved successfully', data: report });
});

// POST /reports
const createReport = asyncHandler(async (req, res) => {
  // req.body berisi field teks (dari multer atau express.json). Bisa undefined jika body kosong.
  const { errors, value } = validateCreateBody(req.body || {});
  if (errors.length > 0) throw new AppError(400, 'Validation failed', errors);

  const report = await reportService.createReport(value, req.file); // req.file = foto (jika ada)

  res.location(`/reports/${report.id}`); // header Location: alamat resource baru
  return sendSuccess(res, { status: 201, message: 'Report created successfully', data: report });
});

module.exports = { getReports, getReportById, createReport };
