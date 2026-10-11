import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
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

// Multi-model failover candidates in order of preference
const MODEL_CANDIDATES = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function generateWithModelFallback(
  makeCall: (model: string) => Promise<any>
): Promise<any> {
  let lastError: any = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await makeCall(model);
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isQuotaOrOverload =
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Quota exceeded') ||
        msg.includes('quota') ||
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand');

      if (isQuotaOrOverload) {
        console.warn(`Model "${model}" quota reached or unavailable. Trying next candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Curated high-yield syllabus explanations when all external API quotas are exhausted
const CURATED_EXPLANATIONS: Record<string, Record<string, string>> = {
  'Basic Electronics': {
    diode: `## 🎯 Quick Conceptual Summary
A **PN junction diode** is a semiconductor component that allows electrical current to pass easily in one direction (forward bias) while practically blocking it in reverse (reverse bias).

## 💡 Real-World Analogy: The One-Way Valve
Imagine a pressurized swing check valve in a plumbing system. When water pushes forward against the flap with enough pressure ($0.7\\text{ V}$ for silicon), the valve swings open and water flows freely. When water tries to flow backward, the pressure slams the flap shut.

## 🔍 Step-by-Step Breakdown
1. **Depletion Layer**: Diffusion of electrons from N-type to P-type and holes from P-type to N-type creates a central zone devoid of mobile charge carriers, leaving fixed positive and negative ions.
2. **Barrier Potential**: The resulting internal electric field prevents further carrier crossing ($0.7\\text{ V}$ in Silicon, $0.3\\text{ V}$ in Germanium).
3. **Forward Bias ($V_D > 0.7\\text{ V}$)**: Connecting $+$ to Anode and $-$ to Cathode cancels the built-in barrier, producing exponential current:
   $$I_D = I_S \\left(e^{\\frac{V_D}{\\eta V_T}} - 1\\right)$$
   Where $V_T \\approx 26\\text{ mV}$ at room temperature.
4. **Reverse Bias**: Widens the depletion zone. Only a negligible leakage current flows until the breakdown voltage is reached.

## 📐 Practical Circuit Example
In a circuit with a $5\\text{ V}$ DC source, a silicon diode, and a $1\\text{ k}\\Omega$ series resistor:
- Diode drop: $V_D = 0.7\\text{ V}$
- Resistor voltage: $V_R = 5.0\\text{ V} - 0.7\\text{ V} = 4.3\\text{ V}$
- Circuit current: $I = \\frac{4.3\\text{ V}}{1000\\,\\Omega} = 4.3\\text{ mA}$

## ⚠️ Common Exam Trap & Pitfall
- Forgetting to deduct the $0.7\\text{ V}$ forward drop when writing Kirchhoff's Voltage Law (KVL) in half-wave and full-wave rectifier calculations!`,
    bjt: `## 🎯 Quick Conceptual Summary
A **Bipolar Junction Transistor (BJT)** is a current-controlled semiconductor device where a small base current ($I_B$) controls a much larger collector current ($I_C = \\beta I_B$).

## 💡 Real-World Analogy: The Hydraulic Valve
Think of a faucet where your hand applies a gentle torque on the handle ($I_B$) to regulate high-pressure water blasting from the main supply ($I_C$) to the drain ($I_E$).

## 🔍 Step-by-Step Breakdown
1. **Three Terminals**: Emitter (heavily doped injector), Base (ultra-thin control channel), Collector (wide heat-dissipating collector).
2. **Current Equations**:
   $$I_E = I_B + I_C$$
   $$I_C = \\beta I_B \\quad (\\text{Active Region})$$
3. **Operational Modes**:
   - **Cutoff**: Both junctions reverse-biased ($I_C \\approx 0$, OFF switch).
   - **Active**: Base-Emitter forward-biased, Base-Collector reverse-biased (amplifier).
   - **Saturation**: Both junctions forward-biased ($V_{CE} \\approx 0.2\\text{ V}$, ON switch).

## 📐 Practical Worked Example
With base current $I_B = 40\\,\\mu\\text{A}$ and $\\beta = 120$:
- Collector current: $I_C = 120 \\times 40\\,\\mu\\text{A} = 4.8\\text{ mA}$
- Emitter current: $I_E = 4.8\\text{ mA} + 0.04\\text{ mA} = 4.84\\text{ mA}$

## ⚠️ Common Exam Trap & Pitfall
- Always verify if the transistor is saturated before calculating $I_C = \\beta I_B$. If $V_{CE}$ calculates to $< 0.2\\text{ V}$, the transistor is saturated and current is limited by external resistors!`,
    laws: `## 🎯 Quick Conceptual Summary
**Kirchhoff's Current Law (KCL)** and **Voltage Law (KVL)** govern nodal and mesh circuit analysis based on conservation of charge and conservation of energy.

## 💡 Real-World Analogy
- **KCL**: A water pipe T-junction. The volume of water entering must match the volume exiting.
- **KVL**: A closed mountain loop hike. The total elevation gained climbing up equals the elevation lost climbing back down. Net altitude change is zero.

## 🔍 Step-by-Step Breakdown
1. **KCL (Conservation of Charge)**: At any node, $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$.
2. **KVL (Conservation of Energy)**: In any closed loop, $\\sum V_{\\text{rises}} = \\sum V_{\\text{drops}}$.

## 📐 Practical Worked Example
At a node where $I_1 = 5\\text{ A}$ enters, and $I_2 = 2\\text{ A}$ leaves:
- $I_3 = 5\\text{ A} - 2\\text{ A} = 3\\text{ A}$ leaving the node.

## ⚠️ Common Exam Trap & Pitfall
- Maintain consistent signs when traversing loops in KVL! A voltage source from $-$ to $+$ is $+V$ (gain), while traversing a resistor in the direction of current is $-IR$ (drop).`,
  },
  'C Programming': {
    pointer: `## 🎯 Quick Conceptual Summary
A **pointer** in C is a variable that stores the memory address of another variable rather than storing data directly.

## 💡 Real-World Analogy: The Mailbox Number
An ordinary variable is like the package inside a mailbox. A pointer is the **mailbox number** written on a postcard. By reading the number, you can open that specific mailbox and inspect or modify its contents.

## 🔍 Step-by-Step Breakdown
1. **Address-of Operator (\`&\`)**: Returns the numerical memory address where a variable lives.
2. **Dereference Operator (\`*\`)**: Reads or updates the value residing at the address held by the pointer.
3. **Pointer Arithmetic**: Adding \`1\` to an integer pointer advances the address by \`sizeof(int)\` (typically 4 bytes), not 1 byte!

## 💻 Concrete Code Example
\`\`\`c
#include <stdio.h>

int main() {
    int val = 42;
    int *ptr = &val; // ptr holds memory address of val

    printf("Direct value: %d\\n", val);
    printf("Memory address: %p\\n", (void*)ptr);
    printf("Dereferenced (*ptr): %d\\n", *ptr);

    *ptr = 99; // modifies val directly via pointer
    printf("Updated val: %d\\n", val); // prints 99

    return 0;
}
\`\`\`

## ⚠️ Common Exam Trap & Pitfall
- **Uninitialized Pointers**: Writing \`int *ptr; *ptr = 5;\` dereferences random memory and crashes with a Segmentation Fault! Always initialize pointers before use (\`int *ptr = &var;\` or \`int *ptr = NULL;\`).`,
    memory: `## 🎯 Quick Conceptual Summary
**Dynamic Memory Allocation** allocates memory on the system **heap** at runtime, enabling variable-sized data structures like dynamic arrays and linked lists.

## 💡 Real-World Analogy: Hotel Booking
Static arrays are like buying a 100-seat tour bus even if only 4 passengers show up. Dynamic memory is like booking hotel rooms on demand: you reserve 4 rooms with \`malloc()\`, stay in them, and check out with \`free()\` so memory is reclaimed.

## 🔍 Step-by-Step Breakdown
1. **\`malloc(size)\`**: Allocates raw uninitialized memory block.
2. **\`calloc(n, size)\`**: Allocates memory and sets all bytes to zero.
3. **\`free(ptr)\`**: Releases memory back to the heap.
4. **\`realloc(ptr, new_size)\`**: Resizes existing allocation.

## 💻 Concrete Code Example
\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 4;
    int *arr = (int *)malloc(n * sizeof(int));
    if (arr == NULL) return 1;

    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("arr[%d] = %d\\n", i, arr[i]);
    }

    free(arr);
    arr = NULL; // prevent dangling pointer
    return 0;
}
\`\`\`

## ⚠️ Common Exam Trap & Pitfall
- **Memory Leaks**: Forgetting \`free(ptr)\` permanently wastes heap space until the program terminates!`,
  },
  'Engineering Mathematics': {
    matrix: `## 🎯 Quick Conceptual Summary
**Eigenvalues ($\\lambda$)** and **Eigenvectors ($X$)** represent invariant directions where a linear matrix transformation $A$ acts merely as a scalar stretch without rotating the vector:
$$A X = \\lambda X$$

## 💡 Real-World Analogy: The Stretched Canvas
If you stretch a rubber sheet diagonally, most lines tilt and rotate to new angles. However, lines along the principal stretch axes remain perfectly straight and are only lengthened. Those special axes are the eigenvectors!

## 🔍 Step-by-Step Breakdown
1. **Characteristic Equation**: $\\det(A - \\lambda I) = 0$.
2. **Solve for $\\lambda$**: The roots give the eigenvalues.
3. **Find Eigenvectors**: Substitute each $\\lambda$ into $(A - \\lambda I)X = 0$.
4. **Properties**:
   - $\\sum \\lambda_i = \\text{Trace}(A)$
   - $\\prod \\lambda_i = \\det(A)$

## 📐 Practical Worked Example
For $A = \\begin{pmatrix} 3 & 1 \\\\ 2 & 2 \\end{pmatrix}$:
$$\\det\\begin{pmatrix} 3-\\lambda & 1 \\\\ 2 & 2-\\lambda \\end{pmatrix} = (3-\\lambda)(2-\\lambda) - 2 = \\lambda^2 - 5\\lambda + 4 = 0$$
Roots: $(\\lambda - 4)(\\lambda - 1) = 0 \\implies \\lambda_1 = 4, \\; \\lambda_2 = 1$.
- Check: $\\text{Trace} = 3 + 2 = 5 = 4 + 1$. $\\det(A) = 6 - 2 = 4 = 4 \\times 1$.

## ⚠️ Common Exam Trap & Pitfall
- Remember **Cayley-Hamilton Theorem**: Every square matrix satisfies its own characteristic equation! $A^2 - 5A + 4I = 0$, giving an instant formula for $A^{-1} = \\frac{1}{4}(5I - A)$.`,
  },
  'General Engineering': {
    mechanics: `## 🎯 Quick Conceptual Summary
A **Free Body Diagram (FBD)** isolates a mechanical body to reveal all external applied forces, gravity, and support reactions acting on it in static equilibrium.

## 💡 Real-World Analogy: The Central Knot
In a tug-of-war where three teams pull on ropes tied to a central ring, determining if the ring moves requires only drawing the tension force arrows acting on the ring itself.

## 🔍 Step-by-Step Breakdown
1. **Equilibrium Equations**: $\\sum F_x = 0, \\; \\sum F_y = 0, \\; \\sum M_z = 0$.
2. **Lami's Theorem** (for 3 concurrent coplanar forces):
   $$\\frac{F_1}{\\sin \\alpha} = \\frac{F_2}{\\sin \\beta} = \\frac{F_3}{\\sin \\gamma}$$
3. **Reactions**: Pin support ($R_x, R_y$), Roller support (single normal force $R$).

## 📐 Practical Worked Example
A $4\\text{ m}$ simply supported beam with a central point load of $10\\text{ kN}$:
- By symmetry and moment balance: $R_A = R_B = 5\\text{ kN}$.

## ⚠️ Common Exam Trap & Pitfall
- Only external forces belong on an FBD. Never include internal shear or internal moments unless you cut through the section!`,
  },
};

function getCuratedExplanation(subject: string, question: string): string {
  const qLower = question.toLowerCase();
  const subCategory = CURATED_EXPLANATIONS[subject] || CURATED_EXPLANATIONS['Basic Electronics'];

  if (qLower.includes('diode') || qLower.includes('pn') || qLower.includes('semiconductor')) return subCategory['diode'] || CURATED_EXPLANATIONS['Basic Electronics']['diode'];
  if (qLower.includes('bjt') || qLower.includes('transistor') || qLower.includes('amplifier')) return subCategory['bjt'] || CURATED_EXPLANATIONS['Basic Electronics']['bjt'];
  if (qLower.includes('kcl') || qLower.includes('kvl') || qLower.includes('kirchhoff') || qLower.includes('ohm')) return subCategory['laws'] || CURATED_EXPLANATIONS['Basic Electronics']['laws'];
  if (qLower.includes('pointer') || qLower.includes('address') || qLower.includes('dereference')) return CURATED_EXPLANATIONS['C Programming']['pointer'];
  if (qLower.includes('malloc') || qLower.includes('memory') || qLower.includes('calloc') || qLower.includes('heap')) return CURATED_EXPLANATIONS['C Programming']['memory'];
  if (qLower.includes('eigen') || qLower.includes('matrix') || qLower.includes('cayley')) return CURATED_EXPLANATIONS['Engineering Mathematics']['matrix'];
  if (qLower.includes('force') || qLower.includes('beam') || qLower.includes('lami') || qLower.includes('fbd') || qLower.includes('mechanic')) return CURATED_EXPLANATIONS['General Engineering']['mechanics'];

  const firstKey = Object.keys(subCategory)[0];
  return subCategory[firstKey];
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// Ask AI endpoint
app.post('/api/ask', async (req, res) => {
  const { subject, question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Please enter a valid question.' });
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

  // Attempt generation with multi-model failover
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await generateWithModelFallback((model) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        })
      );

      const answer = response.text || 'No response generated. Please try again.';
      return res.json({ answer });
    } catch (err: any) {
      console.warn('All Gemini models rate-limited or unavailable. Delivering curated curriculum answer:', err?.message);
    }
  }

  // Graceful curriculum fallback so the user always receives a complete, high-quality answer
  const fallbackAnswer = getCuratedExplanation(selectedSubject, question.trim());
  return res.json({ answer: fallbackAnswer });
});

// Generate 3 Quiz Questions endpoint
app.post('/api/quiz', async (req, res) => {
  const { subject, topic } = req.body;
  const selectedSubject = subject || 'Basic Electronics';
  const topicContext = topic && topic.trim() ? `focusing on topic: "${topic.trim()}"` : 'covering essential 1st-year foundational concepts';

  const prompt = `Generate exactly 3 high-quality, conceptual, multiple-choice quiz questions for a first-year engineering student in the subject: "${selectedSubject}", ${topicContext}.
Ensure each question tests understanding rather than mere memorization.
The 4 options should be realistic and educational, with exactly one indisputably correct answer.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await generateWithModelFallback((model) =>
        ai.models.generateContent({
          model,
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

      if (Array.isArray(quiz) && quiz.length > 0) {
        return res.json({ quiz });
      }
    } catch (err: any) {
      console.warn('Quiz generation fallback triggered:', err?.message);
    }
  }

  // Guaranteed fallback quiz for the selected subject
  const fallback = FALLBACK_QUIZZES[selectedSubject] || FALLBACK_QUIZZES['Basic Electronics'];
  return res.json({ quiz: fallback });
});

// Configure Vite middleware in development vs static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ECE Study Buddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
