const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://35.207.202.6:5000",
      changeOrigin: true
    })
  );
};
