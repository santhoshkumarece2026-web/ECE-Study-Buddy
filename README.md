# ECE Study Buddy

An interactive AI-assisted study companion designed specifically for first-year engineering students to master foundational engineering coursework through intuitive conceptual breakdowns and rapid self-assessment.

---

## 1. Problem Statement

First-year engineering students frequently struggle with the steep transition from secondary school to university-level engineering curricula. Foundational courses such as Basic Electronics, C Programming, and Engineering Mathematics introduce abstract theorems, unfamiliar syntax, and complex circuit laws without sufficient intuitive scaffolding.

Traditional textbooks often emphasize dense academic proofs and jargon over mental models, leaving students confused about real-world behavior and vulnerable to standard exam traps. **ECE Study Buddy** addresses this challenge by providing:
- Jargon-free explanations grounded in everyday physical analogies.
- Concrete, worked-out examples with SI units or syntax-highlighted code.
- Immediate conceptual reinforcement through interactive, three-question quizzes with instant feedback and answer rationales.

---

## 2. Key Features

- **Subject Selection**:
  - **Basic Electronics**: Semiconductors, PN junction diodes, BJT configurations, operational amplifiers, and circuit laws (Ohm's Law, KCL, KVL).
  - **C Programming**: Variables, control flow, pointers, memory addresses, dynamic memory allocation (`malloc`, `free`), arrays, and structures.
  - **Engineering Mathematics**: Linear algebra, eigenvalues & eigenvectors, Cayley-Hamilton theorem, differential equations, and Laplace transforms.
  - **General Engineering**: Engineering mechanics, free body diagrams, Lami's theorem, AC fundamentals, and thermodynamics basics.

- **AI-Generated Study Explanations ("Ask AI")**:
  - Plain-language conceptual summaries.
  - Everyday intuitive analogies and mental models.
  - Step-by-step mathematical or architectural breakdowns.
  - Practical examples (commented C code snippets or circuit calculations with units).
  - Highlights of frequent student pitfalls and midterm exam warnings.

- **Three-Question Concept Check Quizzes**:
  - Generates 3 focused multiple-choice questions tailored to the selected subject and current topic.
  - Interactive selection with immediate color-coded validation and icon feedback.
  - Comprehensive explanation disclosures detailing why the correct option is right and the reasoning behind common distractors.
  - Real-time score tallying and option to generate new questions.

- **Additional Study Tools**:
  - **Formula & Concept Cheatsheets**: High-yield formulas, diode equations, pointer syntax, and matrix identities accessible from the top navigation bar.
  - **Local Study History**: Automatically caches previous inquiries and answers in browser storage for rapid offline review.
  - **Dark / Light Mode**: High-contrast theme toggle for comfortable studying in any lighting.

---

## 3. Technologies Used

- **Frontend**:
  - React 19
  - TypeScript
  - Tailwind CSS (v4)
  - Lucide React (Icons)
- **Backend**:
  - Express (Node.js)
  - TypeScript executed via `tsx`
  - `@google/genai` (Official Google Gen AI SDK for Gemini models)
  - `dotenv` (Environment configuration)
- **Build & Development Tools**:
  - Vite 8
  - `@vitejs/plugin-react`
  - `@tailwindcss/vite`
  - `tsc` (TypeScript compiler for type checking and linting)

---

## 4. Architecture & Security

- **Server-Side API Handling**: All requests to the Gemini AI API are processed exclusively on the server (`server.ts`). The API key is never bundled, transmitted, or exposed to the browser client.
- **Client Communication**: The browser client communicates strictly with relative backend routes (`/api/ask`, `/api/quiz`, `/api/health`).
- **Resilience**: The backend includes retry handling and graceful fallbacks for core syllabus topics during high-traffic spikes.

---

## 5. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm` or compatible package manager
- A Google Gemini API key

---

## 6. Environment Variables

Create a local `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Configure the following variable name in your `.env` file:

- `GEMINI_API_KEY`: Required for generating study explanations and dynamic quizzes via the Gemini API.

*Note: Never commit your `.env` file containing real keys to version control. The repository `.gitignore` is preconfigured to prevent tracking `.env*` files.*

---

## 7. Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ece-study-buddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. **Type-checking / Linting**:
   ```bash
   npm run lint
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Run production server**:
   ```bash
   npm run start
   ```

---

## 8. Project Status & Future Improvements

### Current Status
- Fully functional full-stack web application.
- Complete coverage of four core first-year engineering subjects.
- Robust server-side Gemini integration with active error handling.
- Responsive design tailored for laptops, tablets, and smartphones.

### Possible Future Improvements
- **Interactive Circuit Simulation**: Adding lightweight in-browser canvas diagrams for diode rectifiers and Op-Amp gain circuits.
- **Interactive C Code Runner**: Embedding a client-side WebAssembly C sandbox to execute and test code snippets directly.
- **Export Notes to PDF / Markdown**: Allowing students to download generated study guides and quiz review sheets.
- **Subject Expansion**: Adding Semester 2 courses such as Object-Oriented Programming (C++/Java), Signals & Systems foundations, and Digital Logic Design.
