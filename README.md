# INTERVYN — AI Technical Interview Simulator

INTERVYN is a high-precision, real-time technical interview simulator engineered for software engineers. It ingests resumes, analyzes candidate context against target role descriptions, constructs adaptive interview blueprints, and executes live multi-stage simulations featuring voice interactions, multiple-choice questions, and sandboxed code execution.

---

## Architectural Principles & Core Features

### 1. Ephemeral Client-Side Parsing
Resumes (PDF / DOCX) are parsed on-device to extract technical skills, claimed frameworks, and project architectures without persistent database storage.

### 2. Adaptive Interview Blueprinting
Generates a structured multi-round evaluation plan (~35 minutes) tailored specifically to the candidate's experience level and target job description:
- Stage 01: Resume & Claim Probing
- Stage 02: MCQ Conceptual Assessment
- Stage 03: System Architecture & Behavioral Deep Dive
- Stage 04: Real-Time Coding & Algorithm Arena

### 3. Voice Telemetry & AI Interviewer Visualizer
Integrated speech recognition and text-to-speech engine coupled with a dynamic audio frequency telemetry visualizer.

### 4. Sandboxed Code Execution
Integrated Monaco Editor environment supporting real-time code execution against visible and hidden test suites.

### 5. Private by Design
Operates with zero persistent database tracking. Candidate profiles, transcripts, and telemetry are destroyed upon session clear.

---

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS v4
- Code Editor: Monaco Editor
- Backend Proxy: Node.js, Express, Groq API SDK (Llama 3.3 70B Versatile)
- Design System: Light Luxury Editorial Architecture (#F5F6F3 off-white foundation, geometric drafting lines, muted annotations)

---

## Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/codebrak07/INTERVYN.git
   cd INTERVYN
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=3001
   ```

4. Start Development Server:
   ```bash
   # Terminal 1: Vite Frontend Server (Port 5173)
   npm run dev

   # Terminal 2: Express Backend Proxy (Port 3001)
   npm run server
   ```

5. Access Application:
   Open browser at `http://localhost:5173`.

---

## Production Build

To test the production build locally:
```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

---

## Deploying to Render

1. Log in to Render.com and create a new Web Service.
2. Link the repository `https://github.com/codebrak07/INTERVYN`.
3. Set the build configuration:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run server`
4. Add Environment Variable:
   - `GROQ_API_KEY`: `your_groq_api_key_here`

---

## License

MIT License. Copyright 2026 INTERVYN SYSTEMS. All rights reserved.
