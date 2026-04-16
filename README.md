# NLP Simulation — CBSE AI Classes 9–12

An interactive, full-stack educational website for learning Natural Language Processing (NLP). Built with **React** (frontend) and **Node.js / Express** (backend), it guides students through 8 hands-on modules — from tokenization to AI Ethics — with animated pipelines, live demos, bilingual support (EN / HI), and scored quizzes.

---

## 🗂 Project Structure

```
nlp_simulation/
├── frontend/          # React app (Create React App + Tailwind CSS)
│   ├── src/
│   │   ├── App.js             # Router, contexts (Language, TeacherMode)
│   │   ├── components/        # Navbar, QuizComponent, StepByStepPipeline
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── ProgressDashboard.js
│   │   │   └── modules/       # One file per module (1–8)
│   │   └── utils/             # nlpHelpers.js, bowHelper.js
│   └── package.json
├── backend/           # Express API
│   ├── server.js
│   ├── routes/        # nlp.js, quiz.js
│   ├── models/        # QuizResult.js (Mongoose)
│   └── package.json
└── README.md
```

---

## 📚 Modules

| # | Title | Key Concepts | Interactive Demo |
|---|-------|-------------|------------------|
| 1 | Intro to NLP | Pipeline, tokenization, real-life apps | Sentence analyser |
| 2 | Text Preprocessing | Stopwords, stemming, lemmatization | Step-by-step pipeline |
| 3 | Bag of Words & TF-IDF | Vocabulary, document vectors | BoW / TF-IDF matrix |
| 4 | Sentiment Analysis | Polarity, lexicons, negation | Live sentiment scorer |
| 5 | N-grams | Bigrams, trigrams, language models | N-gram generator |
| 6 | Chatbot Simulator | Intent detection, rule-based bots | Chat with NLP bot |
| 7 | ML in NLP | Naive Bayes, Laplace smoothing | Spam classifier |
| 8 | AI Ethics | Bias, fairness, privacy, accountability | Bias detection demo |

---

## ⚡ Quick Start (Development)

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| MongoDB | 6.x *(optional — app runs without it)* |

### 1. Clone the repository

```bash
git clone https://github.com/RamolaVip/nlp_simulation.git
cd nlp_simulation
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# In backend/
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nlp_simulation
NODE_ENV=development
```

> **Note:** MongoDB is optional. If it is unavailable the server falls back to an in-memory quiz-result store.

### 4. Start the development servers

Open **two terminal windows**:

```bash
# Terminal 1 – Backend
cd backend
npm run dev        # uses nodemon for auto-restart
```

```bash
# Terminal 2 – Frontend
cd frontend
npm start          # starts CRA dev server on http://localhost:3000
```

The app will be available at **http://localhost:3000**.  
The API will be available at **http://localhost:5000**.

---

## 🌐 Available API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/nlp/tokenize` | Tokenize text |
| POST | `/api/nlp/sentiment` | Lexicon-based sentiment |
| POST | `/api/nlp/preprocess` | Tokenize + stopword removal + stemming |
| POST | `/api/nlp/ngrams` | Generate bigrams & trigrams |
| POST | `/api/nlp/bow` | Bag-of-words frequency map |
| POST | `/api/quiz/save` | Save quiz result (DB or memory) |
| GET | `/api/quiz/results` | List all results |
| GET | `/api/quiz/progress/:studentName` | Progress for a student |

All `POST` endpoints accept `Content-Type: application/json` and expect a `text` (string) field in the request body (quiz endpoints expect `moduleId`, `score`, `totalQuestions`, `studentName`).

---

## 🏗 Production Build

### Build the frontend

```bash
cd frontend
npm run build
```

This produces an optimised static bundle in `frontend/build/`.

### Serve the frontend from the backend

In `backend/server.js`, add the following **after** the existing routes (replace `<path-to-frontend-build>`):

```js
const path = require('path');
// Serve React build
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
```

Then start the backend only:

```bash
cd backend
NODE_ENV=production npm start
```

The full app is now served on **http://localhost:5000** (or whatever `PORT` is set to).

---

## ☁️ Deployment Guide

### Option A — Render.com (recommended, free tier available)

1. **Backend Web Service**
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `PORT`, `MONGODB_URI`, `NODE_ENV=production`

2. **Frontend Static Site** (or include in backend — see above)
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
   - Environment variable: `REACT_APP_API_URL=https://<your-backend>.onrender.com`

### Option B — Railway.app

1. Create a new project → **Deploy from GitHub repo**.
2. Add two services: one for `backend/`, one for `frontend/`.
3. Set the same environment variables as above.
4. Railway auto-detects Node.js and runs `npm start`.

### Option C — Vercel (frontend) + Railway (backend)

1. Import the `frontend/` directory into Vercel.
   - Framework preset: **Create React App**
   - Environment variable: `REACT_APP_API_URL=<your-backend-url>`
2. Deploy the `backend/` directory on Railway or Fly.io.

### Option D — Docker (self-hosted)

Create `Dockerfile` files for each service or use a `docker-compose.yml`:

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    ports: ['5000:5000']
    environment:
      - MONGODB_URI=mongodb://mongo:27017/nlp_simulation
      - NODE_ENV=production
    depends_on: [mongo]

  frontend:
    build: ./frontend
    ports: ['3000:80']
    environment:
      - REACT_APP_API_URL=http://localhost:5000

  mongo:
    image: mongo:6
    volumes: [mongo_data:/data/db]

volumes:
  mongo_data:
```

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP port for the Express server |
| `MONGODB_URI` | `mongodb://localhost:27017/nlp_simulation` | MongoDB connection string |
| `NODE_ENV` | `development` | Runtime environment |

### Frontend (`frontend/.env` or host env)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | Base URL for API calls |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Framer Motion, Tailwind CSS, Recharts, Axios |
| Backend | Node.js 18, Express 4, Mongoose 8, express-rate-limit |
| Database | MongoDB 6 (optional — in-memory fallback included) |
| Styling | Tailwind CSS 3, custom utility classes |

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/your-feature`
2. Make changes, test locally, and ensure `npm run build` succeeds.
3. Open a pull request describing your changes.

---

## 📄 License

MIT © RamolaVip
