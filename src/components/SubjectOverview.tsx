import React from 'react';
import { SubjectInfo } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Code2, 
  Calculator, 
  Wrench, 
  FileText,
  Compass
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';

interface SubjectOverviewProps {
  subject: SubjectInfo;
  onSelectSample: (question: string) => void;
  onSelectTopic: (topic: string) => void;
  onStartQuiz: () => void;
  onOpenFormulas: () => void;
}

interface ModulePillar {
  title: string;
  code: string;
  description: string;
  keyTopics: string[];
  recommendedQuestion: string;
}

const SUBJECT_MODULES: Record<string, {
  courseCode: string;
  semester: string;
  overview: string;
  pillars: ModulePillar[];
}> = {
  electronics: {
    courseCode: 'ECE 101',
    semester: 'Semester 1 & 2',
    overview: 'Foundational study of semiconductor physics, PN junction diodes, transistor amplification, circuit laws, operational amplifiers, and digital logic.',
    pillars: [
      {
        title: 'Semiconductor Diodes & Power',
        code: 'Unit 1',
        description: 'Depletion region formation, 0.7V forward barrier, V-I characteristics, full-wave bridge rectifiers, and Zener voltage regulation.',
        keyTopics: ['PN Junction Diode', 'Bridge Rectifier', 'Zener Regulation'],
        recommendedQuestion: 'Why does a standard silicon PN junction diode require 0.7V forward bias to conduct?',
      },
      {
        title: 'BJT Transistors & Amplifiers',
        code: 'Unit 2',
        description: 'Bipolar Junction Transistor physics, CE/CB/CC configurations, active/saturation regions, Q-point biasing, and 180° phase inversion.',
        keyTopics: ['CE Configuration', 'Q-Point Biasing', 'BJT as Switch'],
        recommendedQuestion: 'In a common-emitter BJT amplifier, why is the output signal voltage 180° out of phase with the input?',
      },
      {
        title: 'Operational Amplifiers & Logic',
        code: 'Unit 3',
        description: 'Golden rules of ideal op-amps, virtual ground principle, inverting and non-inverting summing amplifiers, and basic Boolean logic gates.',
        keyTopics: ['Virtual Ground', 'Inverting Amplifier', 'Boolean Logic'],
        recommendedQuestion: 'Why is there a virtual ground at the inverting terminal of an ideal op-amp with negative feedback?',
      },
    ],
  },
  'c-programming': {
    courseCode: 'CS 102',
    semester: 'Semester 1',
    overview: 'Low-level procedural programming covering memory layout, pointer arithmetic, dynamic heap allocation, data structures, and the C execution model.',
    pillars: [
      {
        title: 'Pointers & Memory Architecture',
        code: 'Unit 1',
        description: 'Memory addresses, address-of (&) and dereference (*) operators, pointer arithmetic, and 64-bit pointer sizes.',
        keyTopics: ['Pointer Dereferencing', 'Pointer Arithmetic', 'Address-of Operator'],
        recommendedQuestion: 'What is the difference between *ptr and &ptr in C with a memory diagram?',
      },
      {
        title: 'Heap & Dynamic Allocation',
        code: 'Unit 2',
        description: 'Heap vs stack lifetimes, malloc() vs calloc(), memory leak prevention, and safe handling of dangling pointers.',
        keyTopics: ['malloc & free', 'calloc Initialization', 'Dangling Pointers'],
        recommendedQuestion: 'What is the difference between malloc() and calloc(), and why must heap memory be freed?',
      },
      {
        title: 'Arrays, Strings & Structures',
        code: 'Unit 3',
        description: 'Contiguous array indexing, null terminator sentinel (\\0), struct memory alignment, and dot (.) vs arrow (->) member access.',
        keyTopics: ['Array-Pointer Decay', 'Null-Terminated Strings', 'Struct Alignment'],
        recommendedQuestion: 'Why do array names decay into pointers in C, and what is *(arr + i) equivalent to?',
      },
    ],
  },
  math: {
    courseCode: 'MAT 101',
    semester: 'Semester 1 & 2',
    overview: 'Core mathematical tools for electrical engineering: linear algebra, matrix transformations, differential equations, and Laplace transforms.',
    pillars: [
      {
        title: 'Matrices & Linear Algebra',
        code: 'Unit 1',
        description: 'Characteristic equation det(A - λI) = 0, eigenvalues, invariant eigenvectors, trace/determinant relations, and Cayley-Hamilton inverse theorem.',
        keyTopics: ['Eigenvalues & Eigenvectors', 'Cayley-Hamilton Theorem', 'Matrix Inverses'],
        recommendedQuestion: 'How do you find the eigenvalues and eigenvectors of a 2x2 matrix step-by-step?',
      },
      {
        title: 'Differential Equations',
        code: 'Unit 2',
        description: 'First-order separable differential equations, second-order linear ODEs with constant coefficients, complementary functions, and particular integrals.',
        keyTopics: ['Second-Order Linear ODEs', 'Auxiliary Equations', 'RLC Circuit Differential Equations'],
        recommendedQuestion: 'How do you solve a second-order linear differential equation with constant coefficients for an RLC circuit?',
      },
      {
        title: 'Laplace Transforms & Calculus',
        code: 'Unit 3',
        description: 's-domain integral transform, unit step u(t), exponential e^(at), s-shift theorem, and partial fraction inversion for circuit analysis.',
        keyTopics: ['Laplace Standard Pairs', 'First Shifting Theorem', 'Partial Fractions Inversion'],
        recommendedQuestion: 'What is the Laplace transform of f(t) = e^(at) and how is it used to solve transient circuit equations?',
      },
    ],
  },
  'general-eng': {
    courseCode: 'ENG 100',
    semester: 'Semester 1',
    overview: 'Engineering science fundamentals: static equilibrium, free body diagrams, thermodynamic cycles, and AC electrical power principles.',
    pillars: [
      {
        title: 'Statics & Free Body Diagrams',
        code: 'Unit 1',
        description: 'Particle and rigid body equilibrium, isolated free body diagrams, support reaction forces (pin and roller), and Lami theorem for concurrent forces.',
        keyTopics: ['Free Body Diagrams', 'Equilibrium Equations', 'Lami Theorem'],
        recommendedQuestion: 'Explain how to draw a Free Body Diagram for a simply supported beam with point loads.',
      },
      {
        title: 'Thermodynamics & Energy',
        code: 'Unit 2',
        description: 'First Law conservation of energy in closed systems (ΔU = Q - W), second law entropy limitations, heat engines, and cycle efficiency.',
        keyTopics: ['First Law of Thermodynamics', 'Second Law & Entropy', 'Carnot Efficiency'],
        recommendedQuestion: 'What is the First Law of Thermodynamics and how is energy conservation applied to a closed piston-cylinder system?',
      },
      {
        title: 'AC Power & Material Behavior',
        code: 'Unit 3',
        description: 'Sinusoidal AC waveforms, RMS voltage, real vs reactive power, power factor, and mild steel tensile stress-strain behavior up to fracture.',
        keyTopics: ['RMS & Peak Voltage', 'Power Factor (cos φ)', 'Stress-Strain Curve'],
        recommendedQuestion: 'What is the difference between Active Power (kW), Reactive Power (kVAR), and Apparent Power (kVA)?',
      },
    ],
  },
};

const EASING = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: EASING,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.16,
      ease: 'easeIn',
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASING },
  },
};

export const SubjectOverview: React.FC<SubjectOverviewProps> = ({
  subject,
  onSelectSample,
  onSelectTopic,
  onStartQuiz,
  onOpenFormulas,
}) => {
  const meta = SUBJECT_MODULES[subject.id] || SUBJECT_MODULES['electronics'];

  const getSubjectIcon = () => {
    switch (subject.id) {
      case 'electronics':
        return <Cpu className="w-5 h-5 text-[#3B82F6]" />;
      case 'c-programming':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'math':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'general-eng':
        return <Wrench className="w-5 h-5 text-violet-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#3B82F6]" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="p-4 sm:p-6 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm space-y-5 w-full min-w-0"
    >
      {/* Subject Academic Header */}
      <motion.div variants={itemVariants} className="pb-4 border-b border-[#2A3850]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#1B2940] border border-[#2A3850] shrink-0 mt-0.5">
              {getSubjectIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7F8DA3] mb-1">
                <span className="font-mono font-semibold text-[#A7B4C8]">{meta.courseCode}</span>
                <span aria-hidden="true" className="select-none text-[#2A3850]">·</span>
                <span>{meta.semester}</span>
                <span aria-hidden="true" className="select-none text-[#2A3850]">·</span>
                <span>First-Year Curriculum</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F1F5F9]">
                {subject.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenFormulas}
              className="px-3 py-1.5 min-h-[34px] text-xs font-medium text-[#F1F5F9] bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#A7B4C8]" />
              <span>Reference Sheet</span>
            </button>
            <button
              type="button"
              onClick={onStartQuiz}
              className="px-3 py-1.5 min-h-[34px] text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Practice Quiz</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A7B4C8] mt-3 leading-relaxed max-w-3xl">
          {meta.overview}
        </p>
      </motion.div>

      {/* Curriculum Competency Pillars */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#A7B4C8]">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#F1F5F9]">Syllabus Competency Units</span>
          </span>
          <span className="text-[11px] font-normal text-[#7F8DA3]">Select a question to inspect step-by-step</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {meta.pillars.map((pillar) => (
            <motion.div
              key={pillar.code}
              variants={itemVariants}
              className="p-3.5 sm:p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between space-y-3 transition-colors hover:border-[#3B82F6]/60"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-[#3B82F6]">{pillar.code}</span>
                  <span className="text-[#7F8DA3] text-[10px]">Core Unit</span>
                </div>
                <h3 className="text-sm font-bold text-[#F1F5F9] leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#A7B4C8] leading-relaxed line-clamp-2">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#2A3850] space-y-2">
                <div className="flex flex-wrap gap-1">
                  {pillar.keyTopics.map((kt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectTopic(kt)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#151F32] text-[#A7B4C8] border border-[#2A3850] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors cursor-pointer"
                    >
                      {kt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSample(pillar.recommendedQuestion)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-[#151F32] border border-[#2A3850] text-[#A7B4C8] hover:text-[#F1F5F9] hover:border-[#3B82F6] transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="line-clamp-1 flex-1 pr-1 text-[11px] font-medium text-[#F1F5F9]">"{pillar.recommendedQuestion}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7F8DA3] group-hover:text-[#3B82F6] shrink-0 transition-colors" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Problem Starter Footer */}
      <motion.div
        variants={itemVariants}
        className="p-3.5 rounded-xl border border-[#2A3850] bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 text-[#A7B4C8]">
          <HelpCircle className="w-4 h-4 text-[#3B82F6] shrink-0" />
          <span>Need help with a lecture derivation or circuit calculation? Type or upload on the left.</span>
        </div>
        <button
          type="button"
          onClick={() => onSelectSample(subject.sampleQuestions[0])}
          className="text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] hover:underline cursor-pointer shrink-0 self-start sm:self-auto flex items-center gap-1"
        >
          <span>Load Starter Problem</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </motion.div>
  );
};
