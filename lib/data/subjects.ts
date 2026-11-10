export const SUBJECTS = [
  { id: "langlit", name: "Language and Literature", slug: "language-and-literature", category: "language", division: null, icon: "📖", color: "#a78bfa", description: "Reading, writing, literary analysis and communication." },
  { id: "spanish_cap", name: "Spanish Capable", slug: "spanish-capable", category: "language", division: "spanish_capable", icon: "🇪🇸", color: "#f59e0b", description: "Spanish for capable learners — grammar, literature and expression." },
  { id: "spanish_em", name: "Spanish Emergent", slug: "spanish-emergent", category: "language", division: "spanish_emergent", icon: "🌮", color: "#fb923c", description: "Spanish for emergent learners — everyday vocabulary and confidence." },
  { id: "french_reg", name: "French Regular", slug: "french-regular", category: "language", division: "french_regular", icon: "🇫🇷", color: "#60a5fa", description: "French for regular learners — grammar, reading and writing." },
  { id: "french_em", name: "French Emergent", slug: "french-emergent", category: "language", division: "french_emergent", icon: "🥐", color: "#38bdf8", description: "French for emergent learners — first steps and everyday phrases." },
  { id: "hindi", name: "Hindi", slug: "hindi", category: "language", division: "hindi", icon: "🇮🇳", color: "#f472b6", description: "Hindi language, literature and grammar." },
  { id: "german", name: "German", slug: "german", category: "language", division: "german", icon: "🇩🇪", color: "#facc15", description: "German language and culture." },
  { id: "math_std", name: "Mathematics Standard", slug: "mathematics-standard", category: "math", division: "standard", icon: "📐", color: "#22d3ee", description: "Number, algebra, geometry and statistics." },
  { id: "math_ext", name: "Mathematics Extended", slug: "mathematics-extended", category: "math", division: "extended", icon: "🧮", color: "#2dd4bf", description: "Advanced algebra, functions, trigonometry and calculus foundations." },
  { id: "physics", name: "Physics", slug: "physics", category: "science", division: null, icon: "⚛️", color: "#818cf8", description: "Forces, motion, energy, waves and electricity." },
  { id: "chemistry", name: "Chemistry", slug: "chemistry", category: "science", division: null, icon: "🧪", color: "#34d399", description: "Atoms, reactions, acids, metals and the periodic table." },
  { id: "biology", name: "Biology", slug: "biology", category: "science", division: null, icon: "🧬", color: "#4ade80", description: "Cells, genetics, ecology and the human body." },
  { id: "humanities", name: "Integrated Humanities", slug: "integrated-humanities", category: "humanities", division: null, icon: "🌍", color: "#fbbf24", description: "Geography, history, civics and economics." },
];

export const HIDDEN_SUBJECT = {
  id: "logic",
  name: "General Knowledge & Logic",
  slug: "general-knowledge-logic",
  category: "logic",
  division: null,
  icon: "🧠",
  color: "#c084fc",
  description: "Language-neutral general knowledge, logic and puzzles.",
};

export const TOPIC_TITLES: Record<string, string[]> = {
  langlit: ["Reading comprehension", "Literary devices", "Writing & grammar"],
  spanish_cap: ["Grammar: tenses", "Vocabulary in context", "Reading & writing"],
  spanish_em: ["Everyday vocabulary", "Present tense basics", "Listening & speaking"],
  french_reg: ["Grammar: tenses", "Vocabulary in context", "Reading & writing"],
  french_em: ["Everyday vocabulary", "Present tense basics", "Listening & speaking"],
  hindi: ["व्याकरण (Grammar)", "शब्दावली (Vocabulary)", "पठन और लेखन (Reading & Writing)"],
  german: ["Grammar: tenses", "Vocabulary in context", "Reading & writing"],
  math_std: ["Number & algebra", "Geometry & measures", "Statistics & probability"],
  math_ext: ["Algebra & functions", "Geometry & trigonometry", "Calculus foundations"],
  physics: ["Forces & motion", "Energy & waves", "Electricity"],
  chemistry: ["Atomic structure", "Chemical reactions", "Acids & metals"],
  biology: ["Cells & organisation", "Genetics & inheritance", "Ecology"],
  humanities: ["Geography & maps", "History & sources", "Civics & economics"],
};

export const LANGUAGE_SUBJECT_IDS = ["spanish_cap", "spanish_em", "french_reg", "french_em", "hindi", "german"];
