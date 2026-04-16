const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'moduleId is required'],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, 'score is required'],
      min: [0, 'score cannot be negative'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'totalQuestions is required'],
      min: [1, 'totalQuestions must be at least 1'],
    },
    studentName: {
      type: String,
      required: [true, 'studentName is required'],
      trim: true,
    },
    percentage: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

quizResultSchema.pre('save', function (next) {
  this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  next();
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
