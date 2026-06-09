function parsePagination(query, defaultLimit = 10, maxLimit = 50) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);

  const page = Number.isNaN(rawPage) ? 1 : Math.max(rawPage, 1);
  const requestedLimit = Number.isNaN(rawLimit) ? defaultLimit : rawLimit;
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

function buildPaginationMeta(page, limit, totalItems) {
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages
  };
}

function escapeCsvValue(value) {
  const normalized = value ?? '';
  const stringValue = String(normalized).replace(/"/g, '""');
  return `"${stringValue}"`;
}

function sendCsv(res, filename, headers, rows) {
  const csvLines = [
    'sep=,',
    headers.join(','),
    ...rows.map(row => row.map(value => escapeCsvValue(value)).join(','))
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(`\uFEFF${csvLines.join('\n')}`);
}

module.exports = {
  parsePagination,
  buildPaginationMeta,
  sendCsv
};
