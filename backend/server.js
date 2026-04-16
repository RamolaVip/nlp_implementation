require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const nlpRoutes = require('./routes/nlp');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow a comma-separated list of origins via CORS_ORIGIN env var, falling back to localhost for development
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/nlp', nlpRoutes);
app.use('/api/quiz', quizRoutes);

// Serve the React production build when present
const buildDir = path.join(__dirname, '../frontend/build');
const buildIndex = path.join(buildDir, 'index.html');
const hasBuild = fs.existsSync(buildIndex);

if (hasBuild) {
  app.use(express.static(buildDir));
}

const staticLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Catch-all: only handle non-API paths so API routes are never shadowed
app.get('*', staticLimiter, (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  if (!hasBuild) {
    return res.status(404).json({
      error: 'Frontend build not found. Run `npm run build` in the frontend directory.',
    });
  }
  res.sendFile(buildIndex);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`NLP Simulation backend running on port ${PORT}`);
  });
};

startServer();
