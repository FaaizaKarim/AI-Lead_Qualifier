function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey;

  if (!key) {
    return res.status(401).json({ error: 'Missing API key. Pass x-api-key header.' });
  }

  if (key !== process.env.DASHBOARD_API_KEY) {
    return res.status(403).json({ error: 'Invalid API key.' });
  }

  next();
}

module.exports = { requireApiKey };
