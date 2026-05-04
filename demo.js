// Launch the demo server — no PostgreSQL required.
// Usage: node demo.js
// Then open http://localhost:4000 in your browser.

process.env.DEMO_MODE = 'true';
process.env.PORT = process.env.PORT || '4000';
process.env.NODE_ENV = 'production';

require('./src/server');
