function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

function sendPaginated(res, items, pagination, status = 200) {
  return res.status(status).json({
    success: true,
    items,
    pagination
  });
}

function sendError(res, status, error, detail) {
  const payload = { success: false, error };

  if (detail !== undefined) {
    payload.detail = detail;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError
};
