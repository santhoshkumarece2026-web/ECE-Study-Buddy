import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated fallback quizzes for high-demand spikes
const FALLBACK_QUIZZES: Record<string, any[]> = {
  'Basic Electronics': [
    {
      question: 'Why does a standard silicon PN junction diode require approximately 0.7V of forward bias before it starts conducting significantly?',
      options: [
        'Because 0.7V is needed to melt the silicon atoms',
        'To overcome the built-in potential barrier created by the depletion region',
        'Because silicon has 7 valence electrons',
        'To reverse the polarity of the external battery source',
      ],
      correctIndex: 1,
      explanation: 'In an unbiased PN junction, diffusion creates a depletion region with immobile ions that set up a barrier potential (~0.7V for silicon, ~0.3V for germanium). The forward bias must exceed this barrier to allow majority carriers to cross.',
      difficulty: 'Core Concept',
      subtopic: 'PN Junction Diode',
    },
    {
      question: "According to Kirchhoff's Current Law (KCL), what is the sum of currents entering and leaving any node in an electrical circuit?",
      options: [
        'Equal to the circuit supply voltage',
        'Always greater than zero',
        'Zero, due to the conservation of electric charge',
        'Dependent on the resistor tolerances only',
      ],
      correctIndex: 2,
      explanation: 'KCL is a direct consequence of the law of conservation of charge: charge cannot accumulate indefinitely at a junction node, so the algebraic sum of currents entering and leaving must equal zero.',
      difficulty: 'Beginner',
      subtopic: "Kirchhoff's Laws",
    },
    {
      question: 'In a common-emitter (CE) BJT amplifier, what is the phase relationship between the input signal voltage and the amplified output signal voltage?',
      options: [
        '0° (In-phase)',
        '90° out of phase',
        '180° out of phase (inverted)',
        '270° out of phase',
      ],
      correctIndex: 2,
      explanation: 'In a CE configuration, as input base-emitter voltage increases, collector current increases, causing a larger voltage drop across the collector resistor R_C, which pulls the collector voltage downward—creating a 180° phase inversion.',
      difficulty: 'Exam Level',
      subtopic: 'BJT Transistor',
    },
  ],
  'C Programming': [
    {
      question: 'If "int *ptr" stores the address of an integer variable "count", what does the operator "*ptr" do?',
      options: [
        'Multiplies the address by 2',
        'Dereferences the pointer to access the value stored at that address',
        'Allocates a new memory block in heap',
        'Returns the hexadecimal memory location of ptr',
      ],
      correctIndex: 1,
      explanation: 'The asterisk (*) operator when used with a pointer is the dereference (or indirection) operator. It accesses the value residing at the address stored inside the pointer.',
      difficulty: 'Beginner',
      subtopic: 'Pointers',
    },
    {
      question: 'What happens if a program allocates memory using malloc() but never calls free() before termination in a continuous process?',
      options: [
        'A compilation error occurs at build time',
        'A memory leak occurs as allocated heap memory is not reclaimed',
        'The CPU automatically reboots',
        'The variable is converted into a static global',
      ],
      correctIndex: 1,
      explanation: 'Memory allocated dynamically on the heap remains reserved until free() is called. Failure to release it creates a memory leak, which can consume system memory over time.',
      difficulty: 'Core Concept',
      subtopic: 'Dynamic Memory Allocation',
    },
    {
      question: 'In C, what is the output of: printf("%d", 5 / 2); ?',
      options: [
        '2.5',
        '2',
        '3',
        'Runtime error',
      ],
      correctIndex: 1,
      explanation: 'Both 5 and 2 are integer literals in C. Integer division truncates the fractional portion toward zero, yielding 2 (not 2.5). To get 2.5, at least one operand must be a float (e.g., 5.0 / 2).',
      difficulty: 'Beginner',
      subtopic: 'Operators & Types',
    },
  ],
  'Engineering Mathematics': [
    {
      question: 'For a square matrix A, which theorem guarantees that the matrix satisfies its own characteristic equation P(A) = 0?',
      options: [
        "Euler's Theorem",
        'Cayley-Hamilton Theorem',
        "L'Hôpital's Rule",
        'Taylor-Maclaurin Series',
      ],
      correctIndex: 1,
      explanation: 'The Cayley-Hamilton theorem states that every square matrix satisfies its own characteristic polynomial equation det(A - λI) = 0, which is extremely useful for calculating A⁻¹ and higher powers of A.',
      difficulty: 'Core Concept',
      subtopic: 'Matrices & Linear Algebra',
    },
    {
      question: 'What is the Laplace transform of the function f(t) = e^(at) for s > a?',
      options: [
        '1 / s',
        '1 / (s - a)',
        'a / (s² + a²)',
        '1 / (s + a)',
      ],
      correctIndex: 1,
      explanation: 'By definition of Laplace transform: L{e^(at)} = ∫[0 to ∞] e^(at) * e^(-st) dt = ∫[0 to ∞] e^(-(s-a)t) dt = 1 / (s - a) for s > a.',
      difficulty: 'Core Concept',
      subtopic: 'Laplace Transforms',
    },
    {
      question: 'If λ₁, λ₂, and λ₃ are the eigenvalues of a 3×3 matrix A, what is the trace of matrix A equal to?',
      options: [
        'λ₁ × λ₂ × λ₃ (Product of eigenvalues)',
        'λ₁ + λ₂ + λ₃ (Sum of eigenvalues)',
        'Zero',
        'The determinant of matrix A',
      ],
      correctIndex: 1,
      explanation: 'A fundamental property of matrix eigenvalues is that the sum of the eigenvalues equals the trace (sum of diagonal elements) of the matrix, while their product equals the determinant.',
      difficulty: 'Exam Level',
      subtopic: 'Eigenvalues & Vectors',
    },
  ],
  'General Engineering': [
    {
      question: "According to Lami's theorem, when three coplanar concurrent forces are in static equilibrium, each force is directly proportional to:",
      options: [
        'The cosine of the angle between the other two forces',
        'The sine of the angle between the other two forces',
        'The square of the distance from the pivot point',
        'The mass of the supporting body',
      ],
      correctIndex: 1,
      explanation: "Lami's theorem states: F₁/sin(α) = F₂/sin(β) = F₃/sin(γ), where each force is proportional to the sine of the angle between the other two concurrent forces.",
      difficulty: 'Core Concept',
      subtopic: 'Engineering Mechanics',
    },
    {
      question: 'In an AC circuit with voltage V and current I, what does the Power Factor (pf) represent?',
      options: [
        'The ratio of Reactive Power to Apparent Power (Q / S)',
        'The ratio of Real/Active Power to Apparent Power (P / S)',
        'The frequency of the alternating current in Hertz',
        'The resistance divided by inductance',
      ],
      correctIndex: 1,
      explanation: 'The power factor is cos(φ) = P / S, representing the fraction of total apparent power (VA) that is converted into useful real work (Watts). Ideal resistive loads have pf = 1.0.',
      difficulty: 'Core Concept',
      subtopic: 'Basic Electrical Engineering',
    },
    {
      question: 'What does the area under the stress-strain curve up to the fracture point measure for an engineering material?',
      options: [
        'Hardness',
        'Modulus of Resilience',
        'Toughness (energy absorbed before fracture)',
        'Thermal conductivity',
      ],
      correctIndex: 2,
      explanation: 'Toughness is the ability of a material to absorb energy and plastically deform without fracturing, represented by the total area under the complete stress-strain curve.',
      difficulty: 'Exam Level',
      subtopic: 'Strength of Materials',
    },
  ],
};

// Helper for retry on transient 503/429
async function callGeminiWithRetry(fn: () => Promise<any>, retries = 2, delayMs = 1500): Promise<any> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      console.warn(`Gemini call encountered error, retrying in ${delayMs}ms...`, err?.message);
      await new Promise((r) => setTimeout(r, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// Ask AI endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { subject, question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check your environment configuration.',
      });
    }

    const selectedSubject = subject || 'General Engineering';

    const systemInstruction = `You are "ECE Study Buddy", an expert, friendly, and encouraging senior engineering mentor dedicated to first-year undergraduate engineering students.
The student is asking about: "${selectedSubject}".

Your explanation style must be:
- Beginner-friendly: Avoid dense academic jargon without explaining it first.
- Intuitive: Relate abstract concepts to real-world everyday analogies (e.g., water pipe analogies for voltage/current, mailboxes for pointers, physical motion for calculus).
- Structured:
  1. 🎯 Quick Conceptual Summary (1-2 sentences)
  2. 💡 Everyday Analogy or Mental Model
  3. 🔍 Step-by-Step Technical Explanation (with clearly defined terms & formulas)
  4. 📐 Practical Example (If C Programming: provide clean, well-commented C code with output. If Basic Electronics: provide circuit values, formulas with Ohm/Volt/Ampere units. If Math: show a clear step-by-step worked problem. If General Eng: practical engineering scenario).
  5. ⚠️ Common Exam Trap / Beginner Pitfall to watch out for.
Format with clean Markdown, clear headings, bullet points, and code blocks.`;

    const prompt = `Student Question in ${selectedSubject}:
"${question.trim()}"

Please provide a beginner-friendly explanation with intuitive examples and practical application.`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })
    );

    const answer = response.text || 'No response generated. Please try again.';
    res.json({ answer });
  } catch (err: any) {
    console.error('Error in /api/ask:', err);
    let userMsg = 'Failed to generate explanation. Please try again in a moment.';
    if (err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE')) {
      userMsg = 'The AI model is experiencing a temporary spike in traffic. Please wait a few seconds and click Retry.';
    }
    res.status(500).json({
      error: userMsg,
    });
  }
});

// Generate 3 Quiz Questions endpoint
app.post('/api/quiz', async (req, res) => {
  const { subject, topic } = req.body;
  const selectedSubject = subject || 'Basic Electronics';
  const topicContext = topic && topic.trim() ? `focusing on topic: "${topic.trim()}"` : 'covering essential 1st-year foundational concepts';

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Gemini API key is not configured on the server. Please check your environment configuration.',
    });
  }

  try {
    const prompt = `Generate exactly 3 high-quality, conceptual, multiple-choice quiz questions for a first-year engineering student in the subject: "${selectedSubject}", ${topicContext}.
Ensure each question tests understanding rather than mere memorization.
The 4 options should be realistic and educational, with exactly one indisputably correct answer.`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are an examination specialist for 1st-year engineering students. Return exactly 3 questions formatted strictly to the JSON schema. Each question must have 4 options, a 0-based correctIndex, a comprehensive explanation that clarifies the right answer and why common distractors are incorrect, and a difficulty label ('Beginner', 'Core Concept', 'Exam Level').`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: 'The multiple choice question text.',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Exactly 4 answer choices.',
                },
                correctIndex: {
                  type: Type.INTEGER,
                  description: 'The zero-based index of the correct answer (0, 1, 2, or 3).',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Clear, encouraging explanation of why this answer is correct.',
                },
                difficulty: {
                  type: Type.STRING,
                  description: 'Difficulty level: Beginner, Core Concept, or Exam Level.',
                },
                subtopic: {
                  type: Type.STRING,
                  description: 'The subtopic being tested (e.g., Ohm\'s Law, Pointers in C, Eigenvalues).',
                },
              },
              required: ['question', 'options', 'correctIndex', 'explanation', 'difficulty'],
            },
          },
        },
      })
    );

    const jsonText = response.text || '[]';
    const quiz = JSON.parse(jsonText);

    if (!Array.isArray(quiz) || quiz.length === 0) {
      throw new Error('Invalid quiz format received');
    }

    res.json({ quiz });
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    // If external model is temporarily unavailable or hit 503, provide curated syllabus questions
    if (FALLBACK_QUIZZES[selectedSubject]) {
      console.log(`Serving curated fallback quiz for "${selectedSubject}"`);
      return res.json({ quiz: FALLBACK_QUIZZES[selectedSubject] });
    }

    res.status(500).json({
      error: 'Could not generate quiz right now. Please try again in a moment.',
    });
  }
});

// Configure Vite middleware in development vs static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ECE Study Buddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
