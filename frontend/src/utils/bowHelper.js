/* ============================================================
   bowHelper.js — Bag of Words & Document Vector utilities
   ============================================================ */
import { wordTokenize } from './nlpHelpers';

/** Build sorted vocabulary from an array of document strings */
export function buildVocabulary(documents) {
  const words = new Set();
  documents.forEach(doc => wordTokenize(doc).forEach(w => words.add(w)));
  return [...words].sort();
}

/** Count occurrences of each vocabulary word in a single document */
export function buildBOWVector(document, vocabulary) {
  const tokens = wordTokenize(document);
  const countMap = {};
  tokens.forEach(t => { countMap[t] = (countMap[t] || 0) + 1; });
  return vocabulary.map(word => countMap[word] || 0);
}

/** Build full BoW matrix (array of vectors, one per document) */
export function buildBOWMatrix(documents, vocabulary) {
  return documents.map(doc => buildBOWVector(doc, vocabulary));
}

/**
 * Returns animated build steps for classroom demo:
 * [ { phase: 'vocab', word, index }, { phase: 'cell', docIdx, wordIdx, value }, ... ]
 */
export function getBOWAnimationSteps(documents, vocabulary) {
  const steps = [];
  // Phase 1: vocabulary building
  vocabulary.forEach((word, i) => steps.push({ phase: 'vocab', word, index: i }));
  // Phase 2: matrix filling
  const matrix = buildBOWMatrix(documents, vocabulary);
  documents.forEach((_, di) => {
    vocabulary.forEach((__, wi) => {
      steps.push({ phase: 'cell', docIdx: di, wordIdx: wi, value: matrix[di][wi] });
    });
  });
  return steps;
}