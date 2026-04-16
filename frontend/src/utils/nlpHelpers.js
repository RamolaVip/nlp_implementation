/**
 * nlpHelpers.js
 * Frontend NLP utility functions for interactive demos.
 */

/* ─── Stopwords ─────────────────────────────────────────────────────────── */

const STOPWORDS = new Set([
  'a','an','the','is','it','in','on','at','to','for','of','and','or','but',
  'not','with','this','that','these','those','i','you','he','she','we','they',
  'me','him','her','us','them','my','your','his','its','our','their','be',
  'am','are','was','were','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','shall','can','need','dare',
  'used','ought','by','from','up','down','as','into','through','after','about',
  'over','then','than','so','if','each','more','most','also','just','only','very',
  'no','nor','yet','both','either','neither','once','while','where','when','who',
  'what','which','how','why','all','any','few','some','such','own','same','other',
]);

/* ─── Word tokenizer ────────────────────────────────────────────────────── */

/**
 * Splits text into lowercase word tokens, stripping punctuation.
 * @param {string} text
 * @returns {string[]}
 */
export function wordTokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^['-]+|['-]+$/g, ''))
    .filter(w => w.length > 0);
}

/* ─── Stopword removal ──────────────────────────────────────────────────── */

/**
 * Removes common English stopwords from a token array.
 * @param {string[]} tokens
 * @returns {string[]}
 */
export function removeStopwords(tokens) {
  if (!Array.isArray(tokens)) return [];
  return tokens.filter(t => !STOPWORDS.has(t.toLowerCase()));
}

/* ─── Simple stemmer ────────────────────────────────────────────────────── */

/**
 * Naive suffix-stripping stemmer (Porter-lite).
 * @param {string} word
 * @returns {string}
 */
export function simpleStem(word) {
  if (!word || word.length <= 3) return word;
  let w = word.toLowerCase();

  // Step 1 – cess/ing/ed
  if (w.endsWith('ational'))  return w.slice(0, -7) + 'ate';
  if (w.endsWith('tional'))   return w.slice(0, -6) + 'tion';
  if (w.endsWith('ization'))  return w.slice(0, -7) + 'ize';
  if (w.endsWith('fulness'))  return w.slice(0, -7) + 'ful';
  if (w.endsWith('ousness'))  return w.slice(0, -7) + 'ous';
  if (w.endsWith('iveness'))  return w.slice(0, -7) + 'ive';
  if (w.endsWith('ization'))  return w.slice(0, -7) + 'ize';
  if (w.endsWith('nesses'))   return w.slice(0, -6);
  if (w.endsWith('ments'))    return w.slice(0, -5);
  if (w.endsWith('ment'))     return w.slice(0, -4);
  if (w.endsWith('ings'))     return w.slice(0, -4);
  if (w.endsWith('ness'))     return w.slice(0, -4);
  if (w.endsWith('tion'))     return w.slice(0, -3) + 'te';
  if (w.endsWith('ing'))      return w.length > 6 ? w.slice(0, -3) : w;
  if (w.endsWith('ies'))      return w.slice(0, -3) + 'y';
  if (w.endsWith('ied'))      return w.slice(0, -3) + 'y';
  if (w.endsWith('sses'))     return w.slice(0, -4) + 'ss';
  if (w.endsWith('ees'))      return w.slice(0, -1);
  if (w.endsWith('ous'))      return w.slice(0, -3);
  if (w.endsWith('ful'))      return w.slice(0, -3);
  if (w.endsWith('er'))       return w.length > 5 ? w.slice(0, -2) : w;
  if (w.endsWith('ly'))       return w.length > 5 ? w.slice(0, -2) : w;
  if (w.endsWith('ed'))       return w.length > 5 ? w.slice(0, -2) : w;
  if (w.endsWith('al'))       return w.length > 5 ? w.slice(0, -2) : w;
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 4) return w.slice(0, -1);
  return w;
}

/* ─── Sentiment analysis ────────────────────────────────────────────────── */

const POSITIVE_WORDS = new Set([
  'good','great','excellent','wonderful','amazing','fantastic','awesome','love',
  'happy','joy','joyful','pleased','glad','excited','positive','brilliant','best',
  'perfect','beautiful','enjoy','liked','nice','fun','cool','helpful','impressive',
  'outstanding','superb','terrific','magnificent','delightful','pleasant','favorable',
  'remarkable','splendid','brilliant','cheerful','thankful','grateful','satisfied',
]);

const NEGATIVE_WORDS = new Set([
  'bad','terrible','awful','horrible','poor','hate','sad','angry','upset','negative',
  'worst','ugly','disgusting','disappointing','annoying','frustrated','boring','dull',
  'unpleasant','fail','failed','failure','wrong','error','problem','difficult','hard',
  'painful','hurt','damage','broken','useless','worthless','stupid','foolish','mess',
  'disaster','catastrophe','dreadful','appalling','miserable','unfortunate','unfair',
]);

const INTENSIFIERS = new Set(['very','extremely','absolutely','completely','totally','really','so']);
const NEGATIONS    = new Set(['not','no','never','neither','nor','dont','doesnt','didnt','isnt','arent','wasnt','cant','wont','shouldnt','couldnt','wouldnt']);

/**
 * Simple lexicon-based sentiment analysis.
 * @param {string} text
 * @returns {{ sentiment: 'positive'|'negative'|'neutral', score: number, matchedWords: string[] }}
 */
export function getSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0, matchedWords: [] };
  }

  const tokens = wordTokenize(text);
  let score = 0;
  const matchedWords = [];

  tokens.forEach((token, i) => {
    const prevToken = i > 0 ? tokens[i - 1] : '';
    const isNegated = NEGATIONS.has(prevToken);
    const isIntensified = i > 0 && INTENSIFIERS.has(prevToken);
    const multiplier = isNegated ? -1.5 : isIntensified ? 1.5 : 1;

    if (POSITIVE_WORDS.has(token)) {
      score += 1 * multiplier;
      matchedWords.push({ word: token, type: isNegated ? 'negated-positive' : 'positive' });
    } else if (NEGATIVE_WORDS.has(token)) {
      score -= 1 * multiplier;
      matchedWords.push({ word: token, type: isNegated ? 'negated-negative' : 'negative' });
    }
  });

  const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
  return { sentiment, score: Math.round(score * 10) / 10, matchedWords };
}

/* ─── N-gram generation ─────────────────────────────────────────────────── */

/**
 * Generates n-gram strings from a token array.
 * @param {string[]} tokens
 * @param {number} n  – size of each gram (e.g. 2 = bigrams)
 * @returns {string[]}
 */
export function generateNgrams(tokens, n = 2) {
  if (!Array.isArray(tokens) || tokens.length < n || n < 1) return [];
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

/* ─── TF-IDF ────────────────────────────────────────────────────────────── */

/**
 * Computes TF-IDF scores for an array of document strings.
 * @param {string[]} documents
 * @returns {{ [docIndex: number]: { [term: string]: number } }}
 */
export function computeTFIDF(documents) {
  if (!Array.isArray(documents) || documents.length === 0) return {};

  const tokenizedDocs = documents.map(doc => wordTokenize(doc));
  const N = tokenizedDocs.length;

  // IDF: log((N + 1) / (df + 1)) + 1  (smoothed)
  const df = {};
  tokenizedDocs.forEach(tokens => {
    const uniqueTerms = new Set(tokens);
    uniqueTerms.forEach(term => {
      df[term] = (df[term] || 0) + 1;
    });
  });

  const idf = {};
  Object.keys(df).forEach(term => {
    idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
  });

  // TF-IDF per document
  const result = {};
  tokenizedDocs.forEach((tokens, docIdx) => {
    if (tokens.length === 0) { result[docIdx] = {}; return; }

    // TF (normalised by doc length)
    const tf = {};
    tokens.forEach(token => { tf[token] = (tf[token] || 0) + 1; });
    Object.keys(tf).forEach(term => { tf[term] /= tokens.length; });

    // TF-IDF
    const scores = {};
    Object.keys(tf).forEach(term => {
      scores[term] = Math.round(tf[term] * (idf[term] || 0) * 1000) / 1000;
    });

    // Sort descending by score and keep top 20 for display
    result[docIdx] = Object.fromEntries(
      Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 20)
    );
  });

  return result;
}

/* ─── Vocabulary builder ────────────────────────────────────────────────── */

/**
 * Builds a sorted vocabulary (unique terms) from a list of documents.
 * @param {string[]} documents
 * @returns {string[]}
 */
export function buildVocabulary(documents) {
  const vocab = new Set();
  documents.forEach(doc => wordTokenize(doc).forEach(t => vocab.add(t)));
  return [...vocab].sort();
}

/**
 * Converts a document into a Bag-of-Words count vector aligned to a vocabulary.
 * @param {string} document
 * @param {string[]} vocabulary
 * @returns {number[]}
 */
export function toBagOfWords(document, vocabulary) {
  const tokens = wordTokenize(document);
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  return vocabulary.map(term => freq[term] || 0);
}
