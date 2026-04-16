const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// In-memory store
const memoryStore = [];

// POST /api/quiz/save
router.post('/save', quizLimiter, async (req, res) => {
  try {
    const { moduleId, score, totalQuestions, studentName } = req.body;

    if (!moduleId || score == null || !totalQuestions || !studentName) {
      return res.status(400).json({
        error: 'moduleId, score, totalQuestions, and studentName are all required.',
      });
    }

    if (score < 0 || totalQuestions < 1 || score > totalQuestions) {
      return res.status(400).json({
        error: 'score must be between 0 and totalQuestions; totalQuestions must be at least 1.',
      });
    }

    const payload = {
      moduleId: String(moduleId).trim(),
      score: Number(score),
      totalQuestions: Number(totalQuestions),
      studentName: String(studentName).trim(),
    };

    const record = {
      ...payload,
      percentage: Math.round((payload.score / payload.totalQuestions) * 100),
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.push(record);
    return res.status(201).json({ message: 'Quiz result saved.', result: record });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quiz result.', message: err.message });
  }
});

// GET /api/quiz/results
router.get('/results', quizLimiter, async (req, res) => {
  try {
    const sorted = [...memoryStore].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.json({ results: sorted, count: sorted.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve quiz results.', message: err.message });
  }
});

// GET /api/quiz/progress/:studentName
router.get('/progress/:studentName', quizLimiter, async (req, res) => {
  try {
    const { studentName } = req.params;
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'studentName parameter is required.' });
    }

    let results;
    results = memoryStore
      .filter((r) => r.studentName === studentName)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (results.length === 0) {
      return res.status(404).json({ error: `No results found for student "${studentName}".` });
    }

    const averagePercentage =
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);

    const byModule = results.reduce((acc, r) => {
      if (!acc[r.moduleId]) acc[r.moduleId] = [];
      acc[r.moduleId].push({ score: r.score, totalQuestions: r.totalQuestions, percentage: r.percentage, date: r.createdAt });
      return acc;
    }, {});

    res.json({ studentName, totalAttempts: results.length, averagePercentage, byModule, results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve student progress.', message: err.message });
  }
});

module.exports = router;
