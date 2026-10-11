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
    {
      question: 'In an ideal Operational Amplifier (Op-Amp) with negative feedback, why is there a "virtual ground" at the inverting terminal when the non-inverting terminal is grounded?',
      options: [
        'Because the open-loop gain is infinite, forcing the differential input voltage (V+ - V-) to zero',
        'Because the output is physically shorted to earth ground',
        'Because the input impedance is zero ohms',
        'Because current flows directly into the internal power supply',
      ],
      correctIndex: 0,
      explanation: 'Because an ideal op-amp has infinite open-loop voltage gain (A_OL → ∞), for a finite output voltage V_out, the differential input (V+ - V-) must equal V_out / A_OL ≈ 0. When V+ is grounded (0V), V- is held at 0V ("virtual ground").',
      difficulty: 'Core Concept',
      subtopic: 'Operational Amplifiers',
    },
    {
      question: 'What is the ripple frequency of a full-wave bridge rectifier operating on a 50 Hz AC mains supply?',
      options: [
        '25 Hz',
        '50 Hz',
        '100 Hz',
        '200 Hz',
      ],
      correctIndex: 2,
      explanation: 'A full-wave rectifier conducts during both the positive and negative half-cycles of the AC input. Therefore, the output pulsating DC has twice the input line frequency: 2 × 50 Hz = 100 Hz.',
      difficulty: 'Beginner',
      subtopic: 'Rectifiers & Power Supplies',
    },
    {
      question: 'How is a Zener diode normally biased when used as a shunt voltage regulator?',
      options: [
        'Forward biased beyond 0.7V',
        'Reverse biased in its breakdown region',
        'Unbiased (open-circuit)',
        'Alternating between forward and reverse bias',
      ],
      correctIndex: 1,
      explanation: 'A Zener diode maintains a nearly constant terminal voltage (V_Z) across a wide range of reverse currents when operated in its reverse breakdown region, making it ideal for voltage regulation.',
      difficulty: 'Core Concept',
      subtopic: 'Zener Diodes',
    },
    {
      question: 'What is the theoretical input impedance of an ideal operational amplifier?',
      options: [
        'Zero ohms',
        '50 ohms',
        '1 kΩ',
        'Infinite ohms (∞)',
      ],
      correctIndex: 3,
      explanation: 'An ideal op-amp has infinite input impedance (R_in → ∞), which means it draws zero input bias current from the signal source (I+ = I- = 0).',
      difficulty: 'Beginner',
      subtopic: 'Operational Amplifiers',
    },
    {
      question: 'Which logic gate produces a HIGH output (1) if and only if its two inputs are different?',
      options: [
        'AND gate',
        'OR gate',
        'XOR (Exclusive OR) gate',
        'NAND gate',
      ],
      correctIndex: 2,
      explanation: 'The XOR gate outputs 1 when input states differ (0 and 1, or 1 and 0), and outputs 0 when inputs are identical (0 and 0, or 1 and 1).',
      difficulty: 'Beginner',
      subtopic: 'Digital Logic Gates',
    },
    {
      question: 'Why does silicon have superior thermal stability compared to germanium in semiconductor applications?',
      options: [
        'Silicon has a larger energy bandgap (~1.12 eV vs ~0.67 eV), resulting in far smaller reverse saturation leakage current at elevated temperatures',
        'Silicon has higher electrical conductivity at room temperature',
        'Germanium dissolves in air above 25°C',
        'Silicon is cheaper to extract from sand',
      ],
      correctIndex: 0,
      explanation: 'The larger bandgap of silicon (1.12 eV) keeps intrinsic carrier concentration and reverse leakage current (I_S) orders of magnitude smaller than germanium, allowing stable operation up to ~150°C.',
      difficulty: 'Exam Level',
      subtopic: 'Semiconductor Physics',
    },
    {
      question: 'What physical process is responsible for light emission in a Light Emitting Diode (LED)?',
      options: [
        'Thermal incandescence of the silicon filament',
        'Radiative recombination of injected electrons and holes across the bandgap in direct bandgap semiconductors',
        'Nuclear magnetic resonance of dopant atoms',
        'Frictional heating caused by electron drift',
      ],
      correctIndex: 1,
      explanation: 'When an LED is forward-biased, minority carriers recombine with majority carriers across the junction. In direct-bandgap materials (like GaAs), this excess energy is released as photons of light: E = hf.',
      difficulty: 'Core Concept',
      subtopic: 'Optoelectronics',
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
    {
      question: 'What is the size of a pointer variable (such as int* or char*) on a standard 64-bit operating system?',
      options: [
        '1 byte',
        '4 bytes',
        '8 bytes',
        'Depends on the data type it points to',
      ],
      correctIndex: 2,
      explanation: 'All pointer types on a 64-bit architecture store a 64-bit memory address, so sizeof(any_pointer) is always 8 bytes, regardless of whether it points to char (1 byte) or double (8 bytes).',
      difficulty: 'Core Concept',
      subtopic: 'Pointers & Memory Architecture',
    },
    {
      question: 'In C, what is the mandatory character that terminates every standard string in memory?',
      options: [
        'Newline character (\'\\n\')',
        'Null character (\'\\0\') with ASCII code 0',
        'Carriage return (\'\\r\')',
        'Space character (\' \')',
      ],
      correctIndex: 1,
      explanation: 'C strings are contiguous arrays of characters terminated by the null character \'\\0\'. Functions like strlen() and printf("%s") scan until encountering this null sentinel.',
      difficulty: 'Beginner',
      subtopic: 'Strings & Arrays',
    },
    {
      question: 'What is the difference between accessing a structure member via the dot operator (.) versus the arrow operator (->)?',
      options: [
        '. is used for structure variables, while -> is used when accessing members through a pointer to a structure',
        '. is for public members, -> is for private members',
        '-> is used only in C++, never in C',
        '. allocates heap memory, while -> frees stack memory',
      ],
      correctIndex: 0,
      explanation: 'ptr->member is syntactic sugar for (*ptr).member. The dot operator works on structure objects directly, while the arrow operator dereferences a structure pointer first.',
      difficulty: 'Core Concept',
      subtopic: 'Structures & Unions',
    },
    {
      question: 'What is a "dangling pointer" in C?',
      options: [
        'A pointer declared as static',
        'A pointer that points to a deallocated/freed memory location',
        'A pointer that has never been assigned any value',
        'A pointer stored in an array of function pointers',
      ],
      correctIndex: 1,
      explanation: 'A dangling pointer points to memory that has already been released (e.g. after free(ptr) or returning the address of a local stack variable). Dereferencing it yields undefined behavior.',
      difficulty: 'Exam Level',
      subtopic: 'Pointers & Memory Safety',
    },
    {
      question: 'What is the primary condition required to prevent infinite recursion and a stack overflow in a recursive C function?',
      options: [
        'Using at least one while loop inside the function',
        'A clearly defined base case that terminates recursion without further self-calls',
        'Declaring the function with the volatile keyword',
        'Allocating recursive parameters using malloc()',
      ],
      correctIndex: 1,
      explanation: 'Every recursive function must contain a base condition that stops subsequent recursive invocations; otherwise, stack frames accumulate until call stack memory is exhausted (Stack Overflow).',
      difficulty: 'Core Concept',
      subtopic: 'Recursion & Call Stack',
    },
    {
      question: 'If "int arr[5] = {10, 20, 30, 40, 50};", what does *(arr + 3) evaluate to?',
      options: [
        '10',
        '30',
        '40',
        'The memory address of arr[3]',
      ],
      correctIndex: 2,
      explanation: 'In C, array name decays to a pointer to its first element. By pointer arithmetic, *(arr + i) is completely identical to arr[i]. Thus *(arr + 3) accesses index 3, which is 40.',
      difficulty: 'Core Concept',
      subtopic: 'Arrays & Pointer Arithmetic',
    },
    {
      question: 'What is the difference between malloc() and calloc() for dynamic memory allocation in C?',
      options: [
        'malloc() is faster and initializes memory to zero; calloc() leaves memory uninitialized',
        'calloc() initializes all allocated bytes to zero; malloc() leaves memory uninitialized (garbage values)',
        'calloc() allocates stack memory; malloc() allocates heap memory',
        'malloc() takes two arguments; calloc() takes only one argument',
      ],
      correctIndex: 1,
      explanation: 'calloc(n, size) initializes every byte to 0 and checks for multiplication overflow, whereas malloc(total_bytes) allocates uninitialized raw memory leaving whatever garbage values were previously there.',
      difficulty: 'Core Concept',
      subtopic: 'Dynamic Memory Allocation',
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
    {
      question: 'What is the Laplace transform of the unit step function u(t)?',
      options: [
        '1',
        '1 / s',
        's',
        '1 / s²',
      ],
      correctIndex: 1,
      explanation: 'L{u(t)} = ∫[0 to ∞] 1 * e^(-st) dt = [-e^(-st) / s] from 0 to ∞ = 0 - (-1/s) = 1/s for s > 0.',
      difficulty: 'Beginner',
      subtopic: 'Laplace Transforms',
    },
    {
      question: 'For two non-zero vectors u and v, what condition guarantees that they are mutually orthogonal (perpendicular)?',
      options: [
        'Their dot product (scalar product) is zero: u · v = 0',
        'Their cross product is zero',
        'Their magnitudes are equal',
        'Their sum is zero',
      ],
      correctIndex: 0,
      explanation: 'Because u · v = |u||v| cos(θ), two non-zero vectors are perpendicular if and only if cos(θ) = 0, which means u · v = 0.',
      difficulty: 'Beginner',
      subtopic: 'Vector Calculus & Linear Algebra',
    },
    {
      question: 'What is the rank of a matrix defined as in linear algebra?',
      options: [
        'The total number of non-zero entries in the matrix',
        'The maximum number of linearly independent row (or column) vectors in the matrix',
        'The sum of the diagonal entries',
        'The determinant multiplied by the dimension',
      ],
      correctIndex: 1,
      explanation: 'The rank of a matrix is the dimension of the vector space spanned by its rows (or columns), equal to the number of non-zero rows in its row-echelon form.',
      difficulty: 'Core Concept',
      subtopic: 'Matrix Rank & Systems of Equations',
    },
    {
      question: 'What is the order and degree of the differential equation: (d²y/dx²)³ + (dy/dx)⁴ + y = 0 ?',
      options: [
        'Order 2, Degree 3',
        'Order 3, Degree 2',
        'Order 4, Degree 2',
        'Order 2, Degree 4',
      ],
      correctIndex: 0,
      explanation: 'Order is the highest derivative present (d²y/dx², which is 2). Degree is the power of that highest derivative once freed of radicals/fractions, which is 3.',
      difficulty: 'Core Concept',
      subtopic: 'Differential Equations',
    },
    {
      question: 'What is the integrating factor (I.F.) for the first-order linear differential equation: dy/dx + P(x)y = Q(x)?',
      options: [
        'e^(∫ P(x) dx)',
        '∫ P(x) dx',
        'e^(P(x))',
        'Q(x) / P(x)',
      ],
      correctIndex: 0,
      explanation: 'Multiplying both sides by e^(∫ P(x) dx) turns the left-hand side into the exact derivative d/dx [y * e^(∫ P(x) dx)], enabling direct integration.',
      difficulty: 'Exam Level',
      subtopic: 'Differential Equations',
    },
    {
      question: 'In vector calculus, what is the divergence of the curl of any twice continuously differentiable vector field F: ∇ · (∇ × F)?',
      options: [
        'Always zero (0)',
        'Equal to ∇²F',
        'Equal to the gradient of the scalar potential',
        'Infinite',
      ],
      correctIndex: 0,
      explanation: 'The divergence of a curl is identically zero for any smooth vector field: div(curl F) = 0. This is a fundamental identity representing conservation of circulation.',
      difficulty: 'Exam Level',
      subtopic: 'Vector Calculus',
    },
    {
      question: 'If a square matrix A has a determinant of zero (det(A) = 0), what does this imply about the matrix?',
      options: [
        'The matrix is singular and does not possess an inverse (A⁻¹ does not exist)',
        'The matrix has all zero elements',
        'All eigenvalues of A are equal to 1',
        'A is an identity matrix',
      ],
      correctIndex: 0,
      explanation: 'A matrix with det(A) = 0 is non-invertible (singular). Because A⁻¹ = (1/det(A)) * adj(A), division by zero makes the inverse undefined.',
      difficulty: 'Beginner',
      subtopic: 'Matrices & Linear Algebra',
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
    {
      question: 'What is the First Law of Thermodynamics fundamentally an expression of?',
      options: [
        'The conservation of electric charge',
        'The law of conservation of energy (ΔU = Q - W)',
        'The increase of universal entropy',
        'Newton\'s third law of action-reaction',
      ],
      correctIndex: 1,
      explanation: 'The First Law states that energy cannot be created or destroyed, only transferred as heat (Q) or converted into mechanical work (W), resulting in a change in internal energy: ΔU = Q - W.',
      difficulty: 'Beginner',
      subtopic: 'Basic Thermodynamics',
    },
    {
      question: 'What are the reaction forces provided by a frictionless roller support in a 2D beam analysis?',
      options: [
        'A single reaction force perpendicular (normal) to the supporting surface',
        'Two perpendicular forces and a moment',
        'A moment only',
        'Forces in both horizontal and vertical directions without any normal constraint',
      ],
      correctIndex: 0,
      explanation: 'A roller support allows free horizontal motion and rotation, constraining movement solely in the normal direction. Hence, it exerts only one reaction force perpendicular to the surface.',
      difficulty: 'Beginner',
      subtopic: 'Engineering Mechanics',
    },
    {
      question: 'In Hooke\'s Law for linear elastic materials (σ = E · ε), what does E represent?',
      options: [
        'Poisson\'s ratio',
        'Modulus of Elasticity (Young\'s Modulus)',
        'Ultimate tensile strength',
        'Yield stress point',
      ],
      correctIndex: 1,
      explanation: 'Young\'s Modulus E is the constant of proportionality between normal stress σ and normal strain ε in the linear elastic regime of the material.',
      difficulty: 'Beginner',
      subtopic: 'Strength of Materials',
    },
    {
      question: 'What is the RMS (Root Mean Square) value of a sinusoidal AC voltage with peak voltage V_peak?',
      options: [
        'V_peak / 2',
        'V_peak / √2 ≈ 0.707 V_peak',
        '2 * V_peak / π',
        '√3 * V_peak',
      ],
      correctIndex: 1,
      explanation: 'The RMS value of a pure sine wave produces the same heating effect as an equivalent DC voltage, given by V_rms = V_peak / √2 ≈ 0.707 V_peak.',
      difficulty: 'Core Concept',
      subtopic: 'Basic Electrical Engineering',
    },
    {
      question: 'What condition defines resonance in a series RLC AC circuit?',
      options: [
        'Inductive reactance equals capacitive reactance: X_L = X_C',
        'Resistance equals zero: R = 0',
        'Current lags voltage by 90°',
        'Power factor is zero',
      ],
      correctIndex: 0,
      explanation: 'At resonance, inductive reactance X_L (ωL) exactly cancels capacitive reactance X_C (1/ωC). Circuit impedance is purely resistive (Z = R) and current reaches its maximum peak.',
      difficulty: 'Core Concept',
      subtopic: 'AC Circuit Analysis',
    },
    {
      question: 'What is the maximum theoretical thermal efficiency of a Carnot heat engine operating between hot reservoir T_H and cold reservoir T_C (temperatures in Kelvin)?',
      options: [
        'η = 1 - (T_C / T_H)',
        'η = T_H / T_C',
        'η = 100%',
        'η = (T_H - T_C) / T_C',
      ],
      correctIndex: 0,
      explanation: 'The Carnot cycle sets the maximum upper bound on heat engine efficiency: η_carnot = 1 - (T_cold / T_hot), where temperatures must be in absolute Kelvin.',
      difficulty: 'Exam Level',
      subtopic: 'Basic Thermodynamics',
    },
    {
      question: 'What does the parallel axis theorem allow engineers to calculate for an area or structural cross-section?',
      options: [
        'The moment of inertia about an axis parallel to a centroidal axis: I = I_G + A·d²',
        'The center of gravity under dynamic impact',
        'The torsional shear stress in non-circular shafts',
        'The electrical resistance of parallel copper wires',
      ],
      correctIndex: 0,
      explanation: 'The parallel axis theorem states: I_axis = I_centroid + A * d², where d is the perpendicular distance between the two parallel axes and A is the cross-sectional area.',
      difficulty: 'Exam Level',
      subtopic: 'Engineering Mechanics',
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

// Generate Quiz Questions endpoint with count and difficulty options
app.post('/api/quiz', async (req, res) => {
  const { subject, topic, difficulty, count } = req.body;
  const selectedSubject = subject || 'Basic Electronics';
  const numQuestions = Math.min(Math.max(Number(count) || 3, 1), 10);
  const selectedDifficulty = difficulty && typeof difficulty === 'string' && difficulty !== 'All' ? difficulty : undefined;

  const topicContext = topic && topic.trim() ? `focusing on topic: "${topic.trim()}"` : 'covering essential 1st-year foundational concepts';
  const difficultyPrompt = selectedDifficulty ? `Target difficulty level: ${selectedDifficulty}.` : 'Include a balanced variety of Beginner, Core Concept, and Exam Level questions.';

  const prompt = `Generate exactly ${numQuestions} high-quality, conceptual, multiple-choice quiz questions for a first-year engineering student in the subject: "${selectedSubject}", ${topicContext}.
${difficultyPrompt}
Ensure each question tests true understanding rather than mere memorization.
The 4 options should be realistic and educational, with exactly one indisputably correct answer.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await generateWithModelFallback((model) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: `You are an examination specialist for 1st-year engineering students. Return exactly ${numQuestions} questions formatted strictly to the JSON schema. Each question must have 4 options, a 0-based correctIndex, a comprehensive explanation that clarifies the right answer and why common distractors are incorrect, and a difficulty label ('Beginner', 'Core Concept', 'Exam Level').`,
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
        return res.json({ quiz: quiz.slice(0, numQuestions) });
      }
    } catch (err: any) {
      console.warn('Quiz generation fallback triggered:', err?.message);
    }
  }

  // Guaranteed fallback quiz for the selected subject
  const subjectBank = FALLBACK_QUIZZES[selectedSubject] || FALLBACK_QUIZZES['Basic Electronics'];
  let pool = subjectBank;
  if (selectedDifficulty) {
    const filtered = subjectBank.filter((q: any) => q.difficulty === selectedDifficulty);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  // Slice to requested count or cycle if needed
  const fallbackResult: any[] = [];
  for (let i = 0; i < numQuestions; i++) {
    fallbackResult.push(pool[i % pool.length]);
  }

  return res.json({ quiz: fallbackResult });
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
