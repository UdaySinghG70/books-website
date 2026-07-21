const app = require('../src/app');

// Vercel serverless handler
// All requests are rewritten here via vercel.json rewrites
module.exports = (req, res) => {
  app(req, res);
};
