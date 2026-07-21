// src/index.js — local development server only
// Vercel uses api/index.js instead and never calls app.listen()
const app  = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
