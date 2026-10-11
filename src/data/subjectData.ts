import { SubjectInfo, FormulaCategory } from '../types';

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'electronics',
    name: 'Basic Electronics',
    shortName: 'Electronics',
    tagline: 'Semiconductors, Diodes, Transistors, Circuit Laws & Logic Gates',
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    borderColor: 'border-blue-500',
    icon: 'Cpu',
    suggestedTopics: [
      'PN Junction Diode & V-I Curve',
      'BJT Operation & Configurations (CE/CB/CC)',
      "Ohm's Law, KCL & KVL",
      'Operational Amplifiers (Inverting & Non-inverting)',
      'Rectifiers (Half & Full Wave) with Filter',
      'Logic Gates & Boolean Algebra',
    ],
    sampleQuestions: [
      'Why does a silicon diode need 0.7V forward bias to conduct?',
      'Explain the difference between KCL and KVL with an example.',
      'How does a Bipolar Junction Transistor (BJT) act as a switch?',
      'What is an ideal Op-Amp and what are the virtual ground concepts?',
    ],
  },
  {
    id: 'c-programming',
    name: 'C Programming',
    shortName: 'C Programming',
    tagline: 'Variables, Pointers, Arrays, Functions, Memory & Control Flow',
    color: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    borderColor: 'border-emerald-500',
    icon: 'Code2',
    suggestedTopics: [
      'Pointers & Pointer Arithmetic',
      'Arrays vs Strings in C',
      'Recursion vs Iteration',
      'Structures & Unions',
      'Dynamic Memory Allocation (malloc, calloc, free)',
      'Bitwise Operators & Shift Logic',
    ],
    sampleQuestions: [
      'What is the difference between *ptr and &ptr in C with a memory diagram?',
      'Explain how recursion works with a factorial program step-by-step.',
      'What is the difference between malloc() and calloc()?',
      'Why is array index 0-based in C, and how is it related to memory addresses?',
    ],
  },
  {
    id: 'math',
    name: 'Engineering Mathematics',
    shortName: 'Engg. Mathematics',
    tagline: 'Matrices, Calculus, Differential Equations & Complex Variables',
    color: 'from-amber-600 to-orange-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    borderColor: 'border-amber-500',
    icon: 'Calculator',
    suggestedTopics: [
      'Eigenvalues & Eigenvectors',
      "Cayley-Hamilton Theorem",
      'Partial Differentiation & Euler Theorem',
      'First & Second Order Differential Equations',
      'Laplace Transforms & Inverse Laplace',
      'Multiple Integrals (Area & Volume)',
    ],
    sampleQuestions: [
      'How do you find the eigenvalues and eigenvectors of a 2x2 matrix step-by-step?',
      'State and explain Cayley-Hamilton theorem with a practical calculation.',
      'How do you solve a second-order linear differential equation with constant coefficients?',
      'What is the intuitive physical meaning of Laplace transform in engineering systems?',
    ],
  },
  {
    id: 'general-eng',
    name: 'General Engineering',
    shortName: 'General Engg.',
    tagline: 'Mechanics, Basic Electrical, Thermodynamics & Engineering Units',
    color: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    borderColor: 'border-purple-500',
    icon: 'Wrench',
    suggestedTopics: [
      "Free Body Diagrams & Lami's Theorem",
      'First & Second Laws of Thermodynamics',
      'AC Fundamentals: RMS, Peak, Power Factor',
      'Stress-Strain Curve for Mild Steel',
      'Centroid & Moment of Inertia',
      'SI Units, Dimensional Analysis & Tolerances',
    ],
    sampleQuestions: [
      'Explain how to draw a Free Body Diagram for a beam with supports.',
      'What is the difference between Active Power, Reactive Power, and Apparent Power?',
      'Walk me through the Stress-Strain curve of mild steel up to fracture point.',
      'What is the First Law of Thermodynamics and how is it applied to a closed system?',
    ],
  },
];

export const FORMULA_SHEETS: FormulaCategory[] = [
  {
    subjectId: 'electronics',
    category: 'Basic Electronics Core Formulas',
    items: [
      {
        title: "Ohm's Law",
        formula: 'V = I × R   |   P = V × I = I²R = V²/R',
        note: 'V in Volts (V), I in Amperes (A), R in Ohms (Ω), P in Watts (W)',
      },
      {
        title: "Kirchhoff's Current Law (KCL)",
        formula: '∑ I_in = ∑ I_out  (at any junction)',
        note: 'Conservation of electrical charge',
      },
      {
        title: "Kirchhoff's Voltage Law (KVL)",
        formula: '∑ V_drops = ∑ V_sources  (in any closed loop)',
        note: 'Conservation of electrical energy',
      },
      {
        title: 'Diode Shockley Equation',
        formula: 'I_D = I_S × (e^(V_D / (n × V_T)) - 1)',
        note: 'Thermal voltage V_T ≈ 26mV at room temp (300K). Silicon barrier ≈ 0.7V',
      },
      {
        title: 'BJT Current Relations',
        formula: 'I_E = I_B + I_C   |   I_C = β × I_B   |   α = β / (1 + β)',
        note: 'Typical current gain β (h_fe) ranges from 50 to 300',
      },
      {
        title: 'Op-Amp Inverting Gain',
        formula: 'A_v = - (R_f / R_in)',
        note: 'Negative sign indicates 180° phase inversion. Virtual ground at inverting terminal',
      },
      {
        title: 'Op-Amp Non-Inverting Gain',
        formula: 'A_v = 1 + (R_f / R_in)',
        note: 'Gain is always ≥ 1 and in-phase with input signal',
      },
    ],
  },
  {
    subjectId: 'c-programming',
    category: 'C Programming Key Syntax & Cheatsheet',
    items: [
      {
        title: 'Common Format Specifiers',
        formula: '%d (int), %f (float), %lf (double), %c (char), %s (string), %p (pointer address)',
        note: 'Always pass address &var for scanf("%d", &var)',
      },
      {
        title: 'Pointer Syntax',
        formula: 'int *ptr = &x;   // ptr holds address of x\nint val = *ptr;  // * dereferences ptr to get x',
        note: '& = address-of operator, * = dereference/indirection operator',
      },
      {
        title: 'Dynamic Memory Allocation',
        formula: 'int *arr = (int*)malloc(n * sizeof(int));\nfree(arr); // always free allocated memory!',
        note: 'malloc allocates uninitialized bytes; calloc initializes memory to zero',
      },
      {
        title: 'String Length & Copy',
        formula: '#include <string.h>\nstrlen(str);  strcpy(dest, src);  strcat(dest, src);',
        note: 'Strings in C must always end with null terminator \'\\0\'',
      },
      {
        title: 'Structures Syntax',
        formula: 'struct Student { int id; char name[50]; float gpa; };\nstruct Student s1;  s1.gpa = 3.8;',
        note: 'Use s->gpa when accessing struct fields through a pointer',
      },
    ],
  },
  {
    subjectId: 'math',
    category: 'Engineering Mathematics Foundations',
    items: [
      {
        title: 'Characteristic Equation & Eigenvalues',
        formula: '|A - λI| = 0',
        note: 'Trace(A) = ∑ λ_i   and   det(A) = ∏ λ_i',
      },
      {
        title: 'Cayley-Hamilton Theorem',
        formula: 'Every square matrix satisfies its own characteristic equation: P(A) = 0',
        note: 'Used for computing matrix powers (A^n) and matrix inverses (A^-1)',
      },
      {
        title: '2×2 Matrix Inverse',
        formula: 'A⁻¹ = (1 / (ad - bc)) × [ d, -b ; -c, a ]',
        note: 'det(A) = ad - bc must be non-zero for inverse to exist',
      },
      {
        title: 'Euler\'s Formula',
        formula: 'e^(iθ) = cos(θ) + i sin(θ)',
        note: 'Fundamental identity for AC phasor analysis and Fourier series',
      },
      {
        title: 'Common Laplace Transforms',
        formula: 'L{1} = 1/s  |  L{t^n} = n!/s^(n+1)  |  L{e^(at)} = 1/(s - a)  |  L{sin(ωt)} = ω/(s² + ω²)',
        note: 'Transforms differential equations in time domain (t) to algebraic equations in (s)',
      },
    ],
  },
  {
    subjectId: 'general-eng',
    category: 'General Engineering Fundamentals',
    items: [
      {
        title: "Newton's Second Law & Weight",
        formula: 'F = m × a   |   W = m × g (g ≈ 9.81 m/s²)',
        note: 'Force in Newtons (N), mass in kg, acceleration in m/s²',
      },
      {
        title: "Lami's Theorem",
        formula: 'F₁ / sin(α) = F₂ / sin(β) = F₃ / sin(γ)',
        note: 'Applies to three coplanar concurrent forces in static equilibrium',
      },
      {
        title: 'Stress & Strain',
        formula: 'Stress (σ) = Force / Area (N/m² or Pa)\nStrain (ε) = ΔL / L (dimensionless)\nYoung\'s Modulus (E) = σ / ε',
        note: 'Hooke\'s Law applies within the proportional/elastic limit',
      },
      {
        title: 'First Law of Thermodynamics',
        formula: 'ΔU = Q - W',
        note: 'ΔU = Change in internal energy, Q = Heat added to system, W = Work done by system',
      },
      {
        title: 'AC Power Triangle',
        formula: 'S = V_rms × I_rms (Apparent, VA)\nP = S × cos(φ) (Real, Watts)\nQ = S × sin(φ) (Reactive, VAR)',
        note: 'Power factor (pf) = cos(φ) = P / S',
      },
    ],
  },
];
