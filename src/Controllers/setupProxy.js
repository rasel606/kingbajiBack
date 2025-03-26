const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://your-vps-ip:5000/proxy",
      changeOrigin: true
    })
  );
};
