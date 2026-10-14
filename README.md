# ECE Study Buddy

An intelligent, high-performance study companion and engineering reasoning console built specifically for first-year undergraduate Electrical and Computer Engineering (ECE) students. ECE Study Buddy demystifies foundational concepts across Linear Algebra, Circuit Analysis, Semiconductor Devices, and C Programming using intuitive mental models, multimodal problem solving, and adaptive conceptual assessment.

---

## 1. Project Overview

First-year engineering curricula present a notoriously steep learning curve. Students transitioning into university-level engineering frequently grapple with abstract theorems, unfamiliar pointer mechanics, and intricate matrix algebra without immediate intuitive feedback.

**ECE Study Buddy** serves as a 24/7 senior engineering mentor with:
- **Core Subject Coverage**:
  - **Basic Electronics**: Semiconductors, PN junction diodes, BJT configurations, operational amplifiers, and circuit laws (Ohm's Law, KCL, KVL).
  - **Engineering Mathematics**: Linear algebra, eigenvalues & eigenvectors, Cayley-Hamilton theorem, system of equations, and calculus.
  - **C Programming**: Pointers, memory addresses, heap memory management (`malloc`, `calloc`, `free`), control flow, and data structures.
  - **General Engineering**: Engineering mechanics, Free Body Diagrams (FBD), Lami's theorem, AC circuits, and work-energy fundamentals.
- **Multimodal Input Processing**:
  - Accepts text questions, typed queries, and uploaded/pasted files (**images**, **circuit screenshots**, **handwritten assignment photos**, and **PDF documents**).
  - Automatically transcribes printed and handwritten mathematical formulas, matrices, circuits, and problem diagrams before walking through step-by-step solutions.
- **Interactive Knowledge Assessment**:
  - Dynamic conceptual quizzes with configurable difficulty (**Beginner**, **Core Concept**, **Exam Level**) and length (3, 5, or 10 questions).
  - Interactive immediate grading with distractor rationale explanations and retry mode for missed questions.
- **Generate Similar Practice Problem**:
  - Automatically synthesizes a new practice problem on the same subject and difficulty with fresh circuit values and parameters.
  - Features an interactive collapsible **"Show Step-by-Step Solution"** toggle keeping the derivation hidden until the student is ready to self-evaluate.
- **Explain Intuitively Quick-Action**:
  - One-click transformation of complex technical explanations into accessible two-paragraph physical analogies before presenting formal mathematical derivations.
- **ASCII Circuit Schematic Engine**:
  - Automatically diagrams electrical circuits (voltage dividers, KCL/KVL loops, op-amps, rectifiers, and diode models) in clean, text-based monospaced ASCII before calculating numbered steps.
- **Adaptive Student Analytics & Revision**:
  - Tracks study streaks, question accuracy, and subject mastery locally.
  - Automatically identifies weak topics and recommends targeted revision sessions.
- **Daily Study Goals & Session Tracking**:
  - Configurable daily study targets for problems solved (AI questions asked and generated practice exercises) and quiz questions answered.
  - Quick presets (Casual, Balanced, Exam Prep) and custom daily targets with real-time progress bars, live Navbar status badges, and manual adjustment logging.
  - Automatic daily rollover and streak synchronization with local storage persistence.

---

## 2. Strict Plain-Text Formatting Rules

Engineering and mathematics education tools frequently suffer from broken LaTeX rendering, misaligned equations, or cluttered Markdown headers. ECE Study Buddy enforces a **custom, strict plain-text mathematical formatting engine** across all prompts and response rendering:

### 1. Rejection of LaTeX & Math Delimiters
- **Strictly Prohibited**: Never outputs LaTeX commands (such as `\lambda`, `\mathbf`, `\frac`, `\begin{pmatrix}`) or LaTeX dollar signs (`$` or `$$`).
- All mathematical expressions are rendered directly in plain text with native Unicode glyphs.

### 2. Elimination of Markdown Heading Hashes
- **Strictly Prohibited**: Heading hashes (`#`, `##`, `###`, `####`) are disallowed in AI responses.
- Section divisions and subtopics are denoted using clean uppercase labels or simple bold tags:
  - `**QUICK CONCEPTUAL SUMMARY:**`
  - `**TRANSCRIBED PROBLEM & EQUATIONS:**`
  - `**EVERYDAY ANALOGY / INTUITION:**`
  - `**STEP-BY-STEP SOLUTION:**`
  - `**PRACTICAL WORKED EXAMPLE:**`
  - `**COMMON EXAM TRAP & PITFALL:**`

### 3. Native Unicode Mathematical Notation
- **Greek Symbols & Quantifiers**: Directly formatted with Unicode:
  - Greek letters: `λ`, `β`, `μ`, `Ω`, `Σ`, `π`, `θ`, `α`, `γ`, `φ`, `η`, `Δ`
  - Quantifiers: Explicit universal quantifier `∀` for general conditions (e.g., `∀ λ ∈ ℝ`), `∈`, `∉`, `≈`, `≠`, `≤`, `≥`, `√`, `∫`
  - Superscripts/Subscripts: `²`, `³`, `ⁿ`, `₁`, `₂`
- **Explicit Multiplication**: The explicit Unicode multiplication symbol `×` is required for matrix/vector operations and scalar multiplication (e.g., `A × v`, `2 × 2 matrix`, `5 × 10⁻³ A`).
- **Standard Vector & Matrix Identifiers**: Represented as standard characters (`v`, `A`, `I`) rather than bold LaTeX macros.

### 4. Multi-Line Unicode Matrix Bracket Walls
Python list-style brackets (`[[a, b], [c, d]]`) and row commas are strictly disallowed for matrix equations. Matrices are constructed using multi-line Unicode bracket walls (`⎡`, `⎣`, `⎤`, `⎦`):

```text
⎡ (4 - 5)     2   ⎤   ⎡ x ⎤   ⎡ 0 ⎤
⎣    1     (3 - 5) ⎦ × ⎣ y ⎦ = ⎣ 0 ⎦

⎡  -1    2 ⎤   ⎡ x ⎤   ⎡ 0 ⎤
⎣   1   -2 ⎦ × ⎣ y ⎦ = ⎣ 0 ⎦
```

### 5. Horizontal & Vertical Alignment
- Operators (`×`, `=`, `+`, `-`) and matrices align in parallel across identical horizontal baseline rows.
- Matrix entries are padded with spaces so vertical columns align uniformly.
- Mathematical signs inside matrix entries have explicit padding (e.g., `(4 - 5)` instead of `4-5`) to prevent visually merging numbers.

### 6. ASCII Circuit Schematic Engine & Dedicated Component
For electrical circuit analysis (KCL, KVL, voltage dividers, resistors, diodes, rectifiers, and operational amplifiers), the system produces text-based ASCII circuit schematics:
- **Standard Component Indicators**:
  - Resistors: `[R1]`, `[R2]`, `[RL]`
  - DC/AC Sources: `(V1)`, `(Vs)`, `(Is)`
  - Ground: `GND`, `_|_`
  - Diodes & Op-Amps: `[D1]`, `[Op-Amp]`, `|>`
  - Connections & Nodes: `+---`, `---|`, `Node A`, `(Va)`, `-> i1`
- **Dedicated UI Component (`CircuitRenderer.tsx`)**:
  - **Pre-Tag & Schematic Detection**: Automatically detects HTML `<pre>` tags (`<pre>...</pre>`, `<pre class="circuit">`), markdown code fences (```circuit / ```text), and raw text schematics.
  - **Strict Monospace Grid**: Enforces `ui-monospace`, `JetBrains Mono`, `font-variant-ligatures: none`, and `font-feature-settings: "liga" 0` to prevent font kerning or ligatures from shifting vertical wires or ASCII brackets.
  - **Multi-Theme High-Contrast Modes**: Supports **Auto** (synced with app light/dark theme), **High-Contrast Paper** (crisp ink on clean white/light surface), **CAD Blueprint** (cyan/emerald on midnight obsidian), **Phosphor CRT** (luminous green terminal), and **Amber CRT** for optimal readability in both light and dark environments.
  - **Interactive Controls**: Multi-level zoom (+, -, reset to 100%), fullscreen modal inspection, one-click copy with toast feedback, and auto-detected component chips (resistors, voltage/current sources, diodes, ground, nodes).

---

## 3. Model Infrastructure & Fallback Architecture

### 3-Tier Reasoning Toggle
Users can dynamically switch AI reasoning modes in the top navigation bar depending on their immediate workflow:

| Tier Mode | Model ID | Optimized For | Latency Profile |
| :--- | :--- | :--- | :--- |
| **Fast** | `gemini-3.1-flash-lite` | Instant concept definitions, quick formula checks, and lightweight MCQs | Sub-second (~1-2s) |
| **Balanced** *(Default)* | `gemini-3.8-flash` | The recommended daily companion: ideal balance of speed, multimodal file analysis, and math derivations | High speed (~3-5s) |
| **Deep Reasoning** | `gemini-3.1-pro` | Complex multi-step circuit analysis, matrix proofs, and comprehensive derivations | Maximum depth (~6-12s) |

The selected model mode is saved to browser `localStorage` (`ece_study_model`) and transmitted with every backend request.

### Automatic Multi-Model Failover Chain & 503 Resilience
To prevent disruptions caused by API capacity spikes (`503 UNAVAILABLE` / "This model is currently experiencing high demand"), rate limits, or transient quota constraints:
1. **503 Transient Spike Recovery**: When a temporary 503 surge is detected, the engine applies a rapid 350ms jitter pause before seamless retry.
2. **Instant Failover to `gemini-3.1-flash-lite`**: If the primary model remains constrained, requests immediately route to `gemini-3.1-flash-lite` (which runs on a high-throughput pool with near-zero queueing) followed by `gemini-flash-latest`.
3. **Curriculum Engine Guarantee**: If all cloud endpoints are unreachable or unconfigured, the system automatically falls back to curated first-year syllabus solutions and quizzes, ensuring zero downtime.

```text
Selected Model (gemini-3.8-flash / gemini-3.1-flash-lite / gemini-3.1-pro)
                                │
                        (On Error / Rate Limit)
                                ▼
                       gemini-3.8-flash
                                │
                        (On Error / Rate Limit)
                                ▼
                     gemini-3.1-flash-lite
                                │
                        (On Error / Rate Limit)
                                ▼
                      gemini-flash-latest
                                │
                      (If All APIs Exhausted)
                                ▼
           Curated High-Yield Syllabus Knowledge Base
```

If all cloud model calls fail, the server automatically delivers a curated syllabus explanation or pre-validated quiz bank so the student never encounters a blank screen or broken workflow.

---

## 4. API Endpoints

The backend server exposes REST endpoints to service student inquiries, multimodal file processing, and quiz generation:

### `POST /api/ask`
Generates conceptual study breakdowns or solves uploaded problems.

- **Request Body**:
  ```json
  {
    "subject": "Basic Electronics",
    "question": "Why does a silicon diode need 0.7V forward bias?",
    "selectedModel": "gemini-3.8-flash",
    "file": {
      "name": "diode_circuit.png",
      "type": "image/png",
      "size": 42100,
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
  ```
- **Fields**:
  - `subject` *(string, optional)*: Active course module (e.g., `"Basic Electronics"`, `"C Programming"`, `"Engineering Mathematics"`, `"General Engineering"`).
  - `question` *(string, optional)*: Student's query or problem notes.
  - `selectedModel` *(string, optional)*: Model preset (`"gemini-3.1-flash-lite"`, `"gemini-3.8-flash"`, or `"gemini-3.1-pro"`). Defaults to `"gemini-3.8-flash"`.
  - `file` *(object, optional)*: Multimodal attachment containing file metadata and base64-encoded image or document data.
- **Success Response** (`200 OK`):
  ```json
  {
    "answer": "**QUICK CONCEPTUAL SUMMARY:**\nA PN junction diode requires approximately 0.7V...\n\n**STEP-BY-STEP SOLUTION:**\n..."
  }
  ```

---

### `POST /api/quiz`
Generates dynamic, multiple-choice assessment questions structured strictly to a typed JSON schema.

- **Request Body**:
  ```json
  {
    "subject": "Engineering Mathematics",
    "topic": "Eigenvalues of 2x2 matrices",
    "difficulty": "Core Concept",
    "count": 3,
    "selectedModel": "gemini-3.8-flash"
  }
  ```
- **Fields**:
  - `subject` *(string, optional)*: Subject module name. Defaults to `"Basic Electronics"`.
  - `topic` *(string, optional)*: Targeted subtopic to focus questions on.
  - `difficulty` *(string, optional)*: Difficulty filter (`"Beginner"`, `"Core Concept"`, or `"Exam Level"`).
  - `count` *(number, optional)*: Number of questions (clamped between 1 and 10, default: 3).
  - `selectedModel` *(string, optional)*: AI model mode. Defaults to `"gemini-3.8-flash"`.
- **Success Response** (`200 OK`):
  ```json
  {
    "quiz": [
      {
        "question": "What is the characteristic equation used to determine eigenvalues λ for a square matrix A?",
        "options": [
          "det(A - λ × I) = 0",
          "det(A + λ × I) = 1",
          "trace(A) × λ = 0",
          "A × λ = I"
        ],
        "correctIndex": 0,
        "explanation": "Eigenvalues satisfy the equation det(A - λ × I) = 0, which yields the non-trivial solutions for (A - λ × I) × v = 0.",
        "difficulty": "Core Concept",
        "subtopic": "Eigenvalues & Eigenvectors"
      }
    ]
  }
  ```

---

### `GET /api/health`
Checks server status and verifies whether the Gemini API key is configured.

- **Success Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "hasApiKey": true
  }
  ```

---

## 5. Tech Stack

- **Frontend**:
  - **Framework**: React 19 SPA
  - **Language**: TypeScript 5.7+
  - **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
  - **Icons**: Lucide React (`GraduationCap`, `Sparkles`, `Zap`, `Brain`, `Award`, `BookMarked`, etc.)
  - **Bundler & Tooling**: Vite 8 with HMR error shielding
- **Backend**:
  - **Server**: Node.js with Express
  - **Execution**: `tsx` for high-performance direct TypeScript execution
  - **SDK**: `@google/genai` (Official Google Gen AI SDK)
  - **Config**: `dotenv`
- **Data & Storage**:
  - Client-side persistence using browser `localStorage` for history, bookmarks, quiz attempt analytics, and UI theme preferences.

---

## 6. Local Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm` (version 9 or later)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ece-study-buddy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

> **Security Note**: Never commit API keys to version control. The repository `.gitignore` automatically excludes `.env` and local credentials.

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`. In development mode, Express mounts Vite middlewares to serve the React SPA with near-instant hot reloads.

### 5. Build & Run in Production
To verify and create an optimized production build:
```bash
# Type check and lint
npm run lint

# Build the client bundle
npm run build

# Start the full-stack production server
npm run start
```

---

## 7. License

Distributed under the MIT License. Designed for students, educators, and engineering learners.
