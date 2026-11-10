import type { QSeed } from "./types";

export const CORE1: Record<string, QSeed[]> = {
  math_std: [
    ["What is 12 × 8?", ["96", "88", "104", "84"], 0, "easy", "12 × 8 = 96."],
    ["What is 25% of 80?", ["20", "25", "15", "32"], 0, "easy", "25% is one quarter: 80 ÷ 4 = 20."],
    ["Simplify 8/12.", ["2/3", "3/4", "4/6", "1/2"], 0, "easy", "Divide numerator and denominator by 4."],
    ["Solve: 3x + 5 = 20.", ["x = 5", "x = 3", "x = 6", "x = 7"], 0, "medium", "3x = 15, so x = 5."],
    ["Find the mean of 4, 8, 6 and 10.", ["7", "6", "8", "5"], 0, "medium", "The total is 28; 28 ÷ 4 = 7."],
    ["Solve: x/4 = 9.", ["x = 36", "x = 13", "x = 5", "x = 2.25"], 0, "medium", "Multiply both sides by 4."],
    ["Area of a circle with radius 7 (use π = 22/7).", ["154", "44", "308", "77"], 0, "hard", "A = πr² = 22/7 × 49 = 154."],
    ["Evaluate 7² − 3².", ["40", "58", "16", "20"], 0, "hard", "49 − 9 = 40."],
  ],
  math_ext: [
    ["What is 3⁻²?", ["1/9", "−9", "−6", "1/6"], 0, "easy", "A negative exponent gives the reciprocal: 1/3² = 1/9."],
    ["What is log₂ 8?", ["3", "2", "4", "8"], 0, "easy", "2³ = 8."],
    ["What is sin 30°?", ["1/2", "√3/2", "1", "0"], 0, "easy", "sin 30° = 0.5."],
    ["Simplify (x² − 9)/(x − 3).", ["x + 3", "x − 3", "x² + 3", "3"], 0, "medium", "Factor the difference of squares: (x−3)(x+3)."],
    ["Solve x² − 5x + 6 = 0.", ["x = 2 or x = 3", "x = −2 or x = −3", "x = 1 or x = 6", "x = 0 or x = 5"], 0, "medium", "Factor to (x−2)(x−3) = 0."],
    ["Find the slope through (2, 3) and (4, 7).", ["2", "1/2", "4", "−2"], 0, "medium", "(7−3)/(4−2) = 4/2 = 2."],
    ["Factor x² + 5x + 6.", ["(x + 2)(x + 3)", "(x + 1)(x + 6)", "(x − 2)(x − 3)", "(x + 5)(x + 1)"], 0, "hard", "2 × 3 = 6 and 2 + 3 = 5."],
    ["What is the vertex of y = (x − 2)² + 1?", ["(2, 1)", "(−2, 1)", "(2, −1)", "(1, 2)"], 0, "hard", "Vertex form y = (x−h)² + k gives (h, k) = (2, 1)."],
  ],
  physics: [
    ["What is the unit of force?", ["Newton", "Joule", "Watt", "Pascal"], 0, "easy", "Force is measured in newtons (N)."],
    ["Speed is calculated as...", ["distance ÷ time", "time ÷ distance", "mass × acceleration", "force × distance"], 0, "easy", "Speed = distance / time."],
    ["What is the approximate acceleration due to gravity on Earth?", ["9.8 m/s²", "3.0 m/s²", "19.6 m/s²", "1.6 m/s²"], 0, "easy", "g ≈ 9.8 m/s²."],
    ["A 10 N force acts on a 2 kg mass. What is the acceleration?", ["5 m/s²", "20 m/s²", "0.2 m/s²", "12 m/s²"], 0, "medium", "F = ma, so a = 10 / 2 = 5 m/s²."],
    ["In a series circuit, what is the same through every component?", ["Current", "Voltage", "Resistance", "Power"], 0, "medium", "Series circuits share one path, so current is the same."],
    ["What is the unit of power?", ["Watt", "Newton", "Joule", "Ampere"], 0, "medium", "Power is measured in watts."],
    ["Energy stored in a stretched spring is...", ["elastic potential energy", "kinetic energy", "thermal energy", "chemical energy"], 0, "hard", "A stretched or compressed spring stores elastic potential energy."],
    ["In which medium does light travel fastest?", ["Vacuum", "Water", "Glass", "Diamond"], 0, "hard", "Light travels fastest in a vacuum."],
  ],
  chemistry: [
    ["What is the chemical formula of water?", ["H₂O", "CO₂", "O₂", "NaCl"], 0, "easy", "Water is H₂O."],
    ["The atomic number of an element equals its number of...", ["protons", "neutrons", "electrons in the outer shell", "isotopes"], 0, "easy", "Atomic number = number of protons."],
    ["What element has the symbol Fe?", ["Iron", "Fluorine", "Lead", "Gold"], 0, "easy", "Fe is iron (ferrum)."],
    ["A solution with pH 3 is...", ["acidic", "neutral", "alkaline", "salty"], 0, "medium", "pH below 7 is acidic."],
    ["What is NaCl commonly called?", ["Sodium chloride", "Sodium carbonate", "Nitrogen chloride", "Calcium chloride"], 0, "medium", "NaCl is sodium chloride, or table salt."],
    ["Noble gases are found in which group of the periodic table?", ["Group 18", "Group 1", "Group 2", "Group 17"], 0, "medium", "Noble gases are Group 18."],
    ["Balance: __H₂ + O₂ → __H₂O.", ["2, 1, 2", "1, 1, 1", "2, 2, 2", "1, 2, 1"], 0, "hard", "2H₂ + O₂ → 2H₂O balances both sides."],
    ["Which method separates an insoluble solid from a liquid?", ["Filtration", "Distillation", "Evaporation", "Chromatography"], 0, "hard", "Filtration traps the insoluble solid."],
  ],
};
