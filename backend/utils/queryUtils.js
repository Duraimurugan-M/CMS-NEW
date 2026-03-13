export const parsePagination = (req) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const parseSort = (req, defaultSort = "-createdAt") => {
  const sort = req.query.sort ? String(req.query.sort) : defaultSort;
  return sort;
};

export const parseDateRange = (req, field = "createdAt") => {
  const { from, to } = req.query;
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return { [field]: range };
};

