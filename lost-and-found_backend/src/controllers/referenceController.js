// Daftar kategori & lokasi untuk dropdown/filter di frontend.
const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getCategories = asyncHandler(async (req, res) =>
  sendSuccess(res, { message: 'Categories retrieved successfully', data: await reportService.listCategories() })
);

const getLocations = asyncHandler(async (req, res) =>
  sendSuccess(res, { message: 'Locations retrieved successfully', data: await reportService.listLocations() })
);

module.exports = { getCategories, getLocations };
