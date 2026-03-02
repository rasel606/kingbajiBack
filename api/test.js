module.exports = (req, res) => {
  res.json({
    status: 'success',
    message: 'Minimal test function',
    timestamp: new Date().toISOString()
  });
};
