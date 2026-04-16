const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const nlpRoutes = require('../backend/routes/nlp');
const quizRoutes = require('../backend/routes/quiz');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/nlp', nlpRoutes);
app.use('/api/quiz', quizRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

module.exports = app;
