import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguage } from '../App';

const API_BASE = process.env.REACT_APP_API_URL || '';

const MODULE_LABELS = [
  'Intro NLP',
  'Preprocessing',
  'Bag of Words',
  'Sentiment',
  'N-grams',
  'Chatbot',
  'ML in NLP',
  'AI Ethics',
];

const DEFAULT_RADAR = MODULE_LABELS.map(label => ({ module: label, score: 0, fullMark: 100 }));
const DEFAULT_BAR   = MODULE_LABELS.map(label => ({ module: label, attempts: 0, avgScore: 0 }));

export default function ProgressDashboard() {
  const { language } = useLanguage();
  const [studentName, setStudentName] = useState(() => localStorage.getItem('studentName') || '');
  const [inputName, setInputName] = useState(localStorage.getItem('studentName') || '');
  const [radarData, setRadarData] = useState(DEFAULT_RADAR);
  const [barData, setBarData] = useState(DEFAULT_BAR);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchProgress = useCallback(async (name) => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/quiz/progress/${encodeURIComponent(name.trim())}`);
      const data = res.data;

      localStorage.setItem('studentName', name.trim());
      setStudentName(name.trim());

      // Build radar data (module id 1-8 -> index 0-7)
      const radar = MODULE_LABELS.map((label, i) => {
        const moduleId = i + 1;
        const mod = data.modules?.find(m => m.moduleId === moduleId);
        return { module: label, score: mod ? Math.round((mod.bestScore / mod.total) * 100) : 0, fullMark: 100 };
      });
      setRadarData(radar);

      // Build bar data
      const bar = MODULE_LABELS.map((label, i) => {
        const moduleId = i + 1;
        const mod = data.modules?.find(m => m.moduleId === moduleId);
        return {
          module: label,
          attempts: mod?.attempts || 0,
          avgScore: mod ? Math.round((mod.avgScore / mod.total) * 100) : 0,
        };
      });
      setBarData(bar);

      // Table
      const table = MODULE_LABELS.map((label, i) => {
        const moduleId = i + 1;
        const mod = data.modules?.find(m => m.moduleId === moduleId);
        return {
          moduleId,
          label,
          attempts: mod?.attempts || 0,
          bestScore: mod ? `${mod.bestScore}/${mod.total}` : '—',
          pct: mod ? Math.round((mod.bestScore / mod.total) * 100) : 0,
          completed: mod ? mod.bestScore === mod.total : false,
        };
      });
      setTableData(table);
      setFetched(true);
      toast.success(`Loaded progress for ${name.trim()}`);
    } catch {
      toast.error('Could not load progress. Showing sample data.');
      // Show placeholder data so UI is still useful
      setRadarData(MODULE_LABELS.map((label, i) => ({ module: label, score: Math.floor(Math.random() * 80 + 10), fullMark: 100 })));
      setBarData(MODULE_LABELS.map((label) => ({ module: label, attempts: Math.floor(Math.random() * 5), avgScore: Math.floor(Math.random() * 90 + 10) })));
      setTableData(MODULE_LABELS.map((label, i) => ({
        moduleId: i + 1, label, attempts: 0, bestScore: '—', pct: 0, completed: false,
      })));
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const overallPct = fetched
    ? Math.round(radarData.reduce((s, d) => s + d.score, 0) / radarData.length)
    : 0;

  const completedCount = tableData.filter(r => r.completed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          {language === 'EN' ? '📊 Progress Dashboard' : '📊 प्रगति डैशबोर्ड'}
        </h1>
        <p className="section-subtitle">
          {language === 'EN'
            ? 'Track your quiz performance across all 8 NLP modules.'
            : 'सभी 8 NLP मॉड्यूल में अपने प्रदर्शन को ट्रैक करें।'
          }
        </p>
      </div>

      {/* Name input card */}
      <div className="card mb-8">
        <h2 className="font-bold text-gray-700 mb-4">
          {language === 'EN' ? '👤 Your Student Name' : '👤 आपका नाम'}
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProgress(inputName)}
            placeholder={language === 'EN' ? 'Enter your name…' : 'अपना नाम दर्ज करें…'}
            className="input-field flex-1"
          />
          <button
            onClick={() => fetchProgress(inputName)}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              language === 'EN' ? 'Load' : 'लोड करें'
            )}
          </button>
        </div>
        {studentName && fetched && (
          <p className="text-sm text-gray-400 mt-2">
            {language === 'EN' ? `Showing data for: ` : `डेटा दिखाया जा रहा है: `}
            <strong className="text-primary-600">{studentName}</strong>
          </p>
        )}
      </div>

      {/* Summary stats */}
      {fetched && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: language === 'EN' ? 'Overall Score' : 'कुल स्कोर', value: `${overallPct}%`, icon: '🏆', color: 'text-yellow-500' },
            { label: language === 'EN' ? 'Modules Done' : 'मॉड्यूल पूरे', value: `${completedCount}/8`, icon: '✅', color: 'text-emerald-500' },
            { label: language === 'EN' ? 'Total Attempts' : 'कुल प्रयास', value: tableData.reduce((s, r) => s + r.attempts, 0), icon: '🔄', color: 'text-blue-500' },
            { label: language === 'EN' ? 'Best Module' : 'सर्वश्रेष्ठ मॉड्यूल', icon: '⭐', color: 'text-orange-500',
              value: radarData.reduce((best, d) => d.score > best.score ? d : best, { score: 0, module: '—' }).module },
          ].map((stat, i) => (
            <div key={i} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Charts row */}
      {fetched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Radar chart */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4">
              {language === 'EN' ? '🕸 Module Skill Radar' : '🕸 मॉड्यूल कौशल रडार'}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="module" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Score %"
                  dataKey="score"
                  stroke="#6C63FF"
                  fill="#6C63FF"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4">
              {language === 'EN' ? '📈 Quiz Attempts & Avg Score' : '📈 क्विज़ प्रयास और औसत स्कोर'}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="attempts" name="Attempts" fill="#a78bfa" radius={[4,4,0,0]} />
                <Bar dataKey="avgScore" name="Avg %" fill="#34d399" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Completion table */}
      {fetched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <h3 className="font-bold text-gray-700 mb-4">
            {language === 'EN' ? '📋 Module Completion Table' : '📋 मॉड्यूल पूर्णता तालिका'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 rounded-tl-xl">#</th>
                  <th className="text-left px-4 py-3">Module</th>
                  <th className="text-center px-4 py-3">Attempts</th>
                  <th className="text-center px-4 py-3">Best Score</th>
                  <th className="text-center px-4 py-3">Progress</th>
                  <th className="text-center px-4 py-3 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={row.moduleId} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3 font-bold text-gray-400">{row.moduleId}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.attempts}</td>
                    <td className="px-4 py-3 text-center font-mono text-gray-600">{row.bestScore}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className={`h-2 rounded-full ${row.pct >= 80 ? 'bg-emerald-400' : row.pct >= 50 ? 'bg-blue-400' : 'bg-gray-300'}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10">{row.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.completed ? (
                        <span className="badge bg-emerald-100 text-emerald-700">✅ Done</span>
                      ) : row.attempts > 0 ? (
                        <span className="badge bg-blue-100 text-blue-700">🔄 In Progress</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">Not Started</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!fetched && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium">
            {language === 'EN' ? 'Enter your name above to load your progress.' : 'अपनी प्रगति लोड करने के लिए ऊपर अपना नाम दर्ज करें।'}
          </p>
        </div>
      )}
    </div>
  );
}
