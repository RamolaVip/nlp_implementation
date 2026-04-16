import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherMode } from '../App';

export default function StepByStepPipeline({ steps = [], title = 'Pipeline' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { teacherMode } = useTeacherMode();

  const duration = teacherMode ? 0.7 : 0.35;

  function goNext() {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  }

  function goTo(idx) {
    setDirection(idx > currentStep ? 1 : -1);
    setCurrentStep(idx);
  }

  if (!steps.length) return null;

  const step = steps[currentStep];

  const variants = {
    enter: (d) => ({
      x: d > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration, ease: 'easeOut' },
    },
    exit: (d) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: duration * 0.7, ease: 'easeIn' },
    }),
  };

  return (
    <div className="w-full">
      {/* Title + slow-mode badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-700">{title}</h3>
        {teacherMode && (
          <span className="badge bg-emerald-100 text-emerald-700 text-xs">
            🐢 Slow Mode
          </span>
        )}
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-300 rounded-full focus:outline-none
              ${idx === currentStep
                ? 'w-8 h-3 bg-primary-500 shadow-glow'
                : idx < currentStep
                ? 'w-3 h-3 bg-primary-300'
                : 'w-3 h-3 bg-gray-200 hover:bg-gray-300'
              }`}
            aria-label={`Go to step ${idx + 1}`}
          />
        ))}
        <span className="ml-auto text-xs text-gray-400 font-medium">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Pipeline flow visualization */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <button
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                text-xs font-medium transition-all duration-200
                ${idx === currentStep
                  ? `${s.color || 'bg-primary-500'} text-white shadow-md scale-105`
                  : idx < currentStep
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-gray-50 text-gray-400 border border-dashed border-gray-200'
                }`}
            >
              <span className="text-base">{s.icon}</span>
              <span className="max-w-[60px] text-center leading-tight">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`flex-shrink-0 h-0.5 w-6 transition-colors duration-300 ${
                idx < currentStep ? 'bg-primary-400' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main step card */}
      <div className="relative overflow-hidden rounded-2xl min-h-[180px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`card border-l-4 ${step.color ? '' : 'border-l-primary-500'}`}
            style={step.color ? { borderLeftColor: undefined } : {}}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0
                  ${step.color || 'bg-primary-100'}`}
              >
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-gray-800 mb-1">{step.label}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>

                {step.example && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-1">Example</p>
                    <p className="font-mono text-sm text-gray-700">{step.example}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step counter badge */}
            <div className="absolute top-3 right-3">
              <span className="badge bg-white border border-gray-200 text-gray-500">
                Step {currentStep + 1}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goPrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
            ${currentStep === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'btn-secondary'
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </motion.button>

        {/* Restart */}
        {currentStep > 0 && (
          <button
            onClick={() => { setDirection(-1); setCurrentStep(0); }}
            className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
          >
            ↺ Restart
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
            ${currentStep === steps.length - 1
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'btn-primary'
            }`}
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
