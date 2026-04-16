import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../App';
import StepByStepPipeline from '../../components/StepByStepPipeline';
import { getSentiment } from '../../utils/nlpHelpers';

/* ── Bias examples ─────────────────────────────────────────────────────── */

const BIAS_CASES = [
  {
    id: 'negation',
    title: 'Negation & Sarcasm',
    icon: '🙃',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'text-yellow-700',
    pairs: [
      {
        textA: 'Oh great, another meeting on a Friday afternoon!',
        noteA: 'Sarcasm — "great" is being used negatively',
        textB: 'I had a great time at the meeting on Friday afternoon.',
        noteB: 'Sincere use of "great" — genuinely positive',
      },
    ],
    lesson: 'Lexicon-based SA cannot detect sarcasm. "Great" will always score as positive even when used sarcastically.',
  },
  {
    id: 'domain',
    title: 'Domain-Specific Language',
    icon: '🏥',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'text-blue-700',
    pairs: [
      {
        textA: 'The treatment is killing the cancer cells effectively.',
        noteA: 'Medical context — "killing" is POSITIVE here',
        textB: 'The storm was killing the crops and destroying farms.',
        noteB: 'Agriculture context — "killing" is NEGATIVE here',
      },
    ],
    lesson: 'Words like "kill", "destroy", "attack" can be positive in medical or game contexts but negative elsewhere. Generic models miss this.',
  },
  {
    id: 'bias',
    title: 'Demographic Bias',
    icon: '⚖️',
    color: 'bg-rose-50 border-rose-200',
    headerColor: 'text-rose-700',
    pairs: [
      {
        textA: 'The scientist published a groundbreaking research paper.',
        noteA: 'Generic — neutral/positive sentence',
        textB: 'The female scientist published a groundbreaking research paper.',
        noteB: 'Adding "female" should not change sentiment, but biased models may score it differently',
      },
    ],
    lesson: 'Trained on biased corpora, models can assign different sentiment scores to demographically identical statements just because of added descriptors.',
  },
];

const ETHICAL_PRINCIPLES = [
  {
    icon: '🔍', title: 'Transparency', titleHI: 'पारदर्शिता',
    desc: 'AI systems should explain their decisions in understandable terms. Users deserve to know how and why a model reached a conclusion.',
    descHI: 'AI सिस्टम को अपने निर्णयों को समझने योग्य भाषा में समझाना चाहिए।',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    icon: '⚖️', title: 'Fairness', titleHI: 'निष्पक्षता',
    desc: 'Models must not discriminate against people based on gender, race, religion, or other protected attributes. Audit training data for bias.',
    descHI: 'मॉडल को लिंग, जाति, धर्म या अन्य संरक्षित विशेषताओं के आधार पर भेदभाव नहीं करना चाहिए।',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    icon: '🔒', title: 'Privacy', titleHI: 'गोपनीयता',
    desc: 'Language models trained on personal data can inadvertently memorise and reveal private information. Anonymise and de-identify training data.',
    descHI: 'व्यक्तिगत डेटा पर प्रशिक्षित भाषा मॉडल अनजाने में निजी जानकारी उजागर कर सकते हैं।',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    icon: '🙋', title: 'Accountability', titleHI: 'जवाबदेही',
    desc: 'Developers and organisations deploying AI must be responsible for the harm it causes. Clear ownership and redress mechanisms are essential.',
    descHI: 'AI तैनात करने वाले डेवलपर और संगठन उसके कारण हुए नुकसान के लिए जिम्मेदार होने चाहिए।',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    icon: '🛡️', title: 'Safety', titleHI: 'सुरक्षा',
    desc: 'NLP systems should not generate harmful, hateful, or misleading content. Red-teaming, content filters, and ongoing monitoring are crucial.',
    descHI: 'NLP सिस्टम को हानिकारक, घृणास्पद या भ्रामक सामग्री उत्पन्न नहीं करनी चाहिए।',
    color: 'bg-red-50 border-red-200',
  },
  {
    icon: '🌍', title: 'Inclusivity', titleHI: 'समावेशिता',
    desc: 'NLP should serve all languages and communities equally. Low-resource languages need attention to avoid widening the digital divide.',
    descHI: 'NLP को सभी भाषाओं और समुदायों की समान रूप से सेवा करनी चाहिए।',
    color: 'bg-teal-50 border-teal-200',
  },
];

/* ── Pipeline ──────────────────────────────────────────────────────────── */

const PIPELINE_STEPS = [
  {
    icon: '🔍', label: 'Identify Problem', color: 'bg-rose-100',
    description: 'Identify potential ethical concerns before deployment: bias, privacy risks, misuse potential, and impact on underrepresented groups.',
    example: 'Question: Does our hiring tool score women\'s CVs lower than men\'s for identical qualifications?',
  },
  {
    icon: '📊', label: 'Measure Bias', color: 'bg-orange-100',
    description: 'Quantify bias using fairness metrics: Demographic Parity, Equal Opportunity, Calibration. Audit training data distribution.',
    example: 'Female applicants scored 12% lower on average — detected via demographic parity test.',
  },
  {
    icon: '🛠️', label: 'Mitigate', color: 'bg-yellow-100',
    description: 'Apply mitigation strategies: re-sample training data, debias word embeddings (e.g., GloVe), use fairness-aware training objectives.',
    example: 'Re-balance training data; remove gender pronouns from embeddings; retrain with fairness constraint.',
  },
  {
    icon: '🔄', label: 'Monitor', color: 'bg-emerald-100',
    description: 'Continuously monitor deployed models for drift, emerging bias, and new edge cases. Set up human-in-the-loop review for high-stakes decisions.',
    example: 'Monthly bias audit reports; alert if demographic parity gap exceeds 5%.',
  },
  {
    icon: '📋', label: 'Report', color: 'bg-blue-100',
    description: 'Publish model cards, datasheets, and impact assessments. Transparency helps users and regulators evaluate the system responsibly.',
    example: 'Model card: "Trained on X dataset; known limitations include Y; not suitable for Z applications."',
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function AIEthics() {
  const { language } = useLanguage();
  const [activeBias, setActiveBias] = useState(null);
  const [biasResults, setBiasResults] = useState({});

  function runBiasDemo(caseId, textA, textB) {
    const rA = getSentiment(textA);
    const rB = getSentiment(textB);
    setBiasResults(prev => ({ ...prev, [caseId]: { rA, rB } }));
    setActiveBias(caseId);
  }

  const sentimentBadge = (r) => {
    const cfg = { positive: 'bg-emerald-100 text-emerald-700', negative: 'bg-red-100 text-red-700', neutral: 'bg-gray-100 text-gray-600' };
    const emoji = { positive: '😊', negative: '😠', neutral: '😐' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg[r.sentiment]}`}>
        {emoji[r.sentiment]} {r.sentiment} ({r.score > 0 ? '+' : ''}{r.score})
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg mb-4">⚖️</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 8</p>
        <h1 className="text-4xl font-black gradient-text mb-3">
          {language === 'EN' ? 'AI Ethics' : 'AI नैतिकता'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          {language === 'EN'
            ? 'Bias, fairness and responsible AI in natural language processing.'
            : 'NLP में पूर्वाग्रह, निष्पक्षता और जिम्मेदार AI।'}
        </p>
      </motion.div>

      {/* ── Concept Card ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-2">
          💡 {language === 'EN' ? 'Why Ethics Matters in AI' : 'AI में नैतिकता क्यों महत्वपूर्ण है'}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {language === 'EN'
            ? 'Language models learn from human-generated text — which contains our societal biases, stereotypes, and prejudices. Without careful design and oversight, AI systems can amplify discrimination, violate privacy, and cause real harm to real people. Ethical AI is not optional — it\'s essential.'
            : 'भाषा मॉडल मानव-निर्मित टेक्स्ट से सीखते हैं जिसमें हमारे सामाजिक पूर्वाग्रह शामिल हैं।'}
        </p>
      </motion.div>

      {/* ── Pipeline ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <StepByStepPipeline
          steps={PIPELINE_STEPS}
          title={language === 'EN' ? 'Responsible AI Pipeline' : 'जिम्मेदार AI पाइपलाइन'}
        />
      </motion.div>

      {/* ── Bias Demo ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            🔍 {language === 'EN' ? 'Bias Detection Demo' : 'पूर्वाग्रह पहचान डेमो'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'EN'
              ? 'See how a simple lexicon-based SA model can produce different results for semantically similar text. Click "Run Bias Test" on each case.'
              : 'देखें कैसे एक साधारण lexicon-based SA मॉडल समान टेक्स्ट के लिए अलग-अलग परिणाम दे सकता है।'}
          </p>
        </div>

        {BIAS_CASES.map(bc => {
          const pair = bc.pairs[0];
          const res = biasResults[bc.id];
          return (
            <div key={bc.id} className={`rounded-2xl border-2 p-5 space-y-4 ${bc.color}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bc.icon}</span>
                <h3 className={`font-bold text-lg ${bc.headerColor}`}>{bc.title}</h3>
                <button onClick={() => runBiasDemo(bc.id, pair.textA, pair.textB)}
                  className="ml-auto text-xs px-4 py-1.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-semibold text-gray-600">
                  {language === 'EN' ? '▶ Run Bias Test' : '▶ परीक्षण चलाएं'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { text: pair.textA, note: pair.noteA, result: res?.rA, label: 'A' },
                  { text: pair.textB, note: pair.noteB, result: res?.rB, label: 'B' },
                ].map(({ text, note, result: r, label }) => (
                  <div key={label} className="bg-white/70 rounded-xl p-3 space-y-1 border border-white">
                    <p className="text-xs font-bold text-gray-400 uppercase">Text {label}</p>
                    <p className="text-sm text-gray-700 italic">"{text}"</p>
                    <p className="text-xs text-gray-500">{note}</p>
                    {r && (
                      <AnimatePresence>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {sentimentBadge(r)}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>

              {res && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 rounded-xl p-3 border border-white">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    💡 {language === 'EN' ? 'What this reveals:' : 'यह क्या दर्शाता है:'}
                  </p>
                  <p className="text-sm text-gray-600">{bc.lesson}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ── Ethical Principles ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🏛️ {language === 'EN' ? '6 Principles of Responsible AI' : 'जिम्मेदार AI के 6 सिद्धांत'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ETHICAL_PRINCIPLES.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border-2 p-5 ${p.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-bold text-gray-800">
                  {language === 'EN' ? p.title : p.titleHI}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'EN' ? p.desc : p.descHI}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link to="/module/7" className="btn-secondary">← Module 7</Link>
        <Link to="/progress" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          📊 {language === 'EN' ? 'View Progress' : 'प्रगति देखें'}
        </Link>
        <div />
      </div>

    </div>
  );
}
