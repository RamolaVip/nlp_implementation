const express = require('express');
const router = express.Router();

// ---------------------------------------------------------------------------
// Word lists
// ---------------------------------------------------------------------------

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing',
  'fantastic', 'best', 'brilliant', 'joy', 'beautiful', 'perfect',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'horrible', 'sad', 'hate', 'awful', 'worst',
  'ugly', 'dreadful', 'poor', 'disappointing', 'failure',
]);

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'am', 'it', 'its', 'of', 'in', 'on', 'at', 'to', 'for', 'by',
  'from', 'with', 'into', 'through', 'during', 'including', 'until',
  'against', 'among', 'throughout', 'despite', 'towards', 'upon',
  'concerning', 'as', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
  'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'they',
  'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
  'whom', 'this', 'that', 'these', 'those', 'not', 'but', 'and', 'or',
  'so',
]);

// Suffixes ordered longest-first so longer matches take precedence
const SUFFIXES = ['tion', 'ness', 'ment', 'able', 'ible', 'ing', 'ed', 'ly', 'er', 'est', 'ful', 'less'];

// ---------------------------------------------------------------------------
// NLP helpers
// ---------------------------------------------------------------------------

/**
 * Split text into lowercase word tokens (strips punctuation).
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Remove stopwords from a token array.
 */
function removeStopwords(tokens) {
  return tokens.filter((t) => !STOPWORDS.has(t));
}

/**
 * Naive suffix-stripping stemmer.
 */
function stem(word) {
  for (const suffix of SUFFIXES) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

/**
 * Generate n-grams of size `n` from a token array.
 */
function buildNgrams(tokens, n) {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

/**
 * Build a bag-of-words frequency map from a token array.
 */
function buildBow(tokens) {
  return tokens.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /api/nlp/tokenize
router.post('/tokenize', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'A non-empty "text" string is required.' });
    }

    const tokens = tokenize(text);
    res.json({ tokens, count: tokens.length });
  } catch (err) {
    res.status(500).json({ error: 'Tokenization failed.', message: err.message });
  }
});

// POST /api/nlp/sentiment
router.post('/sentiment', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'A non-empty "text" string is required.' });
    }

    const tokens = tokenize(text);
    let positiveCount = 0;
    let negativeCount = 0;
    const matchedPositive = [];
    const matchedNegative = [];

    for (const token of tokens) {
      if (POSITIVE_WORDS.has(token)) {
        positiveCount++;
        matchedPositive.push(token);
      } else if (NEGATIVE_WORDS.has(token)) {
        negativeCount++;
        matchedNegative.push(token);
      }
    }

    let sentiment;
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    res.json({
      sentiment,
      positiveCount,
      negativeCount,
      matchedPositive,
      matchedNegative,
    });
  } catch (err) {
    res.status(500).json({ error: 'Sentiment analysis failed.', message: err.message });
  }
});

// POST /api/nlp/preprocess
router.post('/preprocess', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'A non-empty "text" string is required.' });
    }

    const tokens = tokenize(text);
    const withoutStopwords = removeStopwords(tokens);
    const stemmed = withoutStopwords.map(stem);

    res.json({
      original: text,
      tokens,
      withoutStopwords,
      stemmed,
    });
  } catch (err) {
    res.status(500).json({ error: 'Preprocessing failed.', message: err.message });
  }
});

// POST /api/nlp/ngrams
router.post('/ngrams', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'A non-empty "text" string is required.' });
    }

    const tokens = tokenize(text);
    const bigrams = buildNgrams(tokens, 2);
    const trigrams = buildNgrams(tokens, 3);

    res.json({ tokens, bigrams, trigrams });
  } catch (err) {
    res.status(500).json({ error: 'N-gram generation failed.', message: err.message });
  }
});

// POST /api/nlp/bow
router.post('/bow', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'A non-empty "text" string is required.' });
    }

    const tokens = tokenize(text);
    const bow = buildBow(tokens);
    const vocabulary = Object.keys(bow).sort();

    res.json({ bow, vocabulary, totalTokens: tokens.length, uniqueTokens: vocabulary.length });
  } catch (err) {
    res.status(500).json({ error: 'Bag-of-words generation failed.', message: err.message });
  }
});

module.exports = router;
