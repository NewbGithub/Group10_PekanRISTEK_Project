// Membentuk response sukses dengan format yang SAMA di semua endpoint (lihat API_CONTRACT.md bagian 2).
function sendSuccess(res, { status = 200, message, data, meta }) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta; // "meta" hanya ada jika diperlukan (mis. pagination)
  return res.status(status).json(body);
}

module.exports = { sendSuccess };
