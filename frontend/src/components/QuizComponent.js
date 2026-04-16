import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function QuizComponent({ questions = [], moduleId, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [studentName] = useState(() => localStorage.getItem('studentName') || 'Student');

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const isPerfect = score + (answered && selected?.correct ? 0 : 0) === questions.length;

  const handleSelect = useCallback(
    (option, idx) => {
      if (answered) return;
      setSelected({ ...option, idx });
      setAnswered(true);
      if (option.correct) {
        setScore(s => s + 1);
        toast.success('Correct! 🎉', { duration: 1500 });
      } else {
        toast.error('Not quite!', { duration: 1500 });
      }
    },
    [answered]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalScore = score + (selected?.correct ? 0 : 0);
      // finalScore already accumulated; submit
      const total = questions.length;
      const pct = Math.round((score / total) * 100);

      if (pct === 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      // Persist result
      axios
        .post(`${API_BASE}/api/quiz/submit`, {
          studentName,
          moduleId,
          score,
          total,
        })
        .catch(() => {}); // silently ignore network errors

      setFinished(true);
      if (onComplete) onComplete(score, total);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }, [isLast, score, questions.length, studentName, moduleId, onComplete, selected]);

  if (!questions.length) {
    return (
      <div className="card text-center py-10 text-gray-400">
        No quiz questions available for this module yet.
      </div>
    );
  }

  /* ── Finished screen ─────────────────────────────────────────────────── */
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const grade =
      pct === 100 ? { label: 'Perfect! 🏆', color: 'text-yellow-500' }
      : pct >= 80  ? { label: 'Great job! 🎉', color: 'text-emerald-500' }
      : pct >= 60  ? { label: 'Good effort! 👍', color: 'text-blue-500' }
      :              { label: 'Keep practising! 💪', color: 'text-orange-500' };

    return (
      <>
        {showConfetti && (
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={350}
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-10 px-6 max-w-md mx-auto"
        >
          <div className="text-6xl mb-4">{pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-2xl font-bold mb-1">Quiz Complete!</h3>
          <p className={`text-xl font-semibold ${grade.color} mb-2`}>{grade.label}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-5xl font-black gradient-text">{score}</span>
            <span className="text-2xl text-gray-400">/ {questions.length}</span>
          </div>

          {/* Score bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-3 rounded-full ${
                pct === 100 ? 'bg-yellow-400' : pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-blue-400' : 'bg-orange-400'
              }`}
            />
          </div>

          <button
            onClick={() => {
              setCurrent(0);
              setSelected(null);
              setAnswered(false);
              setScore(0);
              setFinished(false);
            }}
            className="btn-secondary w-full"
          >
            Retry Quiz
          </button>
        </motion.div>
      </>
    );
  }

  /* ── Question screen ─────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Question {current + 1} of {questions.length}
        </span>
        <span className="badge bg-primary-100 text-primary-700">
          Score: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
        <motion.div
          animate={{ width: `${((current) / questions.length) * 100}%` }}
          className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple"
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((opt, idx) => {
              let style = 'border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50';
              if (answered) {
                if (opt.correct) {
                  style = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                } else if (selected?.idx === idx && !opt.correct) {
                  style = 'border-red-400 bg-red-50 text-red-800';
                } else {
                  style = 'border-gray-100 bg-gray-50 text-gray-400';
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!answered ? { scale: 1.01 } : {}}
                  whileTap={!answered ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(opt, idx)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium
                    transition-all duration-200 flex items-center gap-3 ${style}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${answered && opt.correct ? 'bg-emerald-500 text-white'
                    : answered && selected?.idx === idx && !opt.correct ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'}`}>
                    {answered && opt.correct ? '✓' : answered && selected?.idx === idx ? '✗' : String.fromCharCode(65 + idx)}
                  </span>
                  {opt.text}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && question.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4"
              >
                <p className="text-sm font-semibold text-blue-700 mb-1">💡 Explanation</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {answered && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="btn-primary w-full justify-center"
            >
              {isLast ? 'See Results' : 'Next Question'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
