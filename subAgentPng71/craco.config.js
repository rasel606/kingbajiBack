const { when } = require('@craco/craco');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add worker-loader for Web Workers
      webpackConfig.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      });

      // Ensure proper MIME types for worker files
      webpackConfig.output.globalObject = 'this';

      return webpackConfig;
    }
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Ensure proper MIME types for worker files in development
      if (!devServer) {
        return middlewares;
      }

      devServer.app.get('*.worker.js', (req, res, next) => {
        res.set('Content-Type', 'application/javascript');
        next();
      });

      devServer.app.get('*.js', (req, res, next) => {
        if (req.path.includes('worker')) {
          res.set('Content-Type', 'application/javascript');
        }
        next();
      });

      return middlewares;
    }
  }
};