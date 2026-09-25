// Dev only: `npm start` forwards /api requests to the Cloudflare Pages Functions
// running under `npm run functions:dev` (port 8788). Used instead of the
// package.json "proxy" field, which crashes react-scripts 5's dev server.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use('/api', createProxyMiddleware({ target: 'http://localhost:8788', changeOrigin: true }));
};
