const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.kingbaji.live',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '', // remove /api from the start
      },
    })
  );
};
