import type { QSeed } from "./types";

export const CORE2: Record<string, QSeed[]> = {
  biology: [
    ["Which organelle is known as the powerhouse of the cell?", ["Mitochondria", "Nucleus", "Ribosome", "Golgi apparatus"], 0, "easy", "Mitochondria release energy through respiration."],
    ["In which organelle does photosynthesis take place?", ["Chloroplast", "Mitochondria", "Vacuole", "Nucleus"], 0, "easy", "Chloroplasts contain chlorophyll for photosynthesis."],
    ["What do red blood cells carry?", ["Oxygen", "Digestive enzymes", "Hormones", "Water only"], 0, "easy", "Red blood cells carry oxygen using haemoglobin."],
    ["What is the shape of a DNA molecule?", ["Double helix", "Single strand", "Sphere", "Cube"], 0, "medium", "DNA is a double helix."],
    ["How many chromosomes does a typical human body cell have?", ["46", "23", "48", "44"], 0, "medium", "23 pairs = 46 chromosomes."],
    ["Which structure is found in plant cells but not animal cells?", ["Cell wall", "Nucleus", "Mitochondria", "Cell membrane"], 0, "medium", "Plant cells have a cellulose cell wall."],
    ["What is an enzyme?", ["A biological catalyst", "A type of cell", "A hormone", "A sugar"], 0, "hard", "Enzymes speed up reactions without being used up."],
    ["In a food chain, what is a producer?", ["An organism that makes its own food", "An animal that eats plants", "A decomposer", "A top predator"], 0, "hard", "Producers, such as plants, make their own food."],
  ],
  humanities: [
    ["In which year did the French Revolution begin?", ["1789", "1776", "1815", "1799"], 0, "easy", "The French Revolution began in 1789."],
    ["Which is the largest ocean on Earth?", ["Pacific", "Atlantic", "Indian", "Arctic"], 0, "easy", "The Pacific is the largest ocean."],
    ["When was the United Nations founded?", ["1945", "1919", "1950", "1939"], 0, "easy", "The UN was founded in 1945."],
    ["Lines of latitude run...", ["horizontally around the Earth", "vertically pole to pole", "only through Europe", "at an angle of 45°"], 0, "medium", "Latitude lines run east–west, parallel to the equator."],
    ["Which of these is a primary source?", ["A diary written at the time", "A textbook", "An encyclopedia", "A documentary made in 2020"], 0, "medium", "Primary sources come directly from the period studied."],
    ["Which is a renewable energy source?", ["Solar", "Coal", "Natural gas", "Oil"], 0, "medium", "Solar energy is naturally replenished."],
    ["If demand rises and supply stays the same, price usually...", ["rises", "falls", "stays the same", "becomes zero"], 0, "hard", "Higher demand with fixed supply pushes prices up."],
    ["What is cultural diffusion?", ["The spread of cultural ideas between societies", "The end of a culture", "A type of map projection", "A voting system"], 0, "hard", "Cultural diffusion is the spreading of beliefs, practices and ideas."],
  ],
  logic: [
    ["What comes next: 2, 4, 8, 16, ...?", ["32", "24", "30", "20"], 0, "easy", "Each number doubles."],
    ["If 3 apples cost $6, how much do 5 apples cost?", ["$10", "$8", "$12", "$9"], 0, "easy", "Each apple is $2, so 5 cost $10."],
    ["If today is Tuesday, what day is it 3 days later?", ["Friday", "Thursday", "Saturday", "Monday"], 0, "easy", "Tuesday + 3 = Friday."],
    ["A is taller than B. B is taller than C. Who is shortest?", ["C", "A", "B", "Cannot tell"], 0, "medium", "The chain gives A > B > C."],
    ["What comes next: 1, 1, 2, 3, 5, 8, ...?", ["13", "11", "12", "10"], 0, "medium", "Each term is the sum of the previous two."],
    ["What is the angle between the hands of a clock at 3:00?", ["90°", "45°", "120°", "180°"], 0, "medium", "The hands point at 12 and 3 — a quarter turn."],
    ["Which is the odd one out: square, circle, triangle, cube?", ["Cube", "Square", "Circle", "Triangle"], 0, "medium", "The cube is 3D; the others are 2D shapes."],
    ["All A are B. All B are C. Therefore...", ["All A are C", "All C are A", "No A are C", "Some B are not C"], 0, "hard", "This is a valid transitive argument."],
    ["'All birds can fly. Penguins are birds.' What is the flaw?", ["The first premise is false", "Penguins are not birds", "The conclusion is unrelated", "There is no flaw"], 0, "hard", "Not all birds can fly, so the first premise is false."],
    ["Which does not belong: piano, guitar, violin, trumpet?", ["Trumpet", "Piano", "Guitar", "Violin"], 0, "hard", "The trumpet is a brass instrument; the others are strings."],
  ],
};

export const PENDING: { subject: string; q: QSeed }[] = [
  { subject: "math_std", q: ["A jacket costs $80 and is reduced by 15%. What is the sale price?", ["$68", "$65", "$70", "$72"], 0, "medium", "15% of 80 is 12, so 80 − 12 = 68."] },
  { subject: "math_std", q: ["Solve 5(x − 2) = 20.", ["x = 6", "x = 4", "x = 2", "x = 10"], 0, "medium", "Divide by 5: x − 2 = 4, so x = 6."] },
  { subject: "physics", q: ["A car travels 150 m in 10 s. What is its average speed?", ["15 m/s", "150 m/s", "1.5 m/s", "10 m/s"], 0, "easy", "Speed = 150 / 10 = 15 m/s."] },
  { subject: "physics", q: ["Which energy transfer happens in a falling ball?", ["Gravitational potential to kinetic", "Kinetic to chemical", "Thermal to electrical", "Elastic to nuclear"], 0, "medium", "Height decreases and speed increases."] },
  { subject: "spanish_cap", q: ["Completa: Si ___ tiempo, viajaríamos más.", ["tuviéramos", "tenemos", "tuvimos", "tendremos"], 0, "hard", "The imperfect subjunctive follows a hypothetical 'si' clause."] },
  { subject: "spanish_cap", q: ["¿Qué significa 'sin embargo'?", ["however", "therefore", "meanwhile", "finally"], 0, "medium", "'Sin embargo' means however."] },
  { subject: "humanities", q: ["What is a census?", ["An official count of a population", "A type of election", "A map scale", "A trade agreement"], 0, "easy", "A census counts people and records population data."] },
  { subject: "humanities", q: ["Which body of water separates Europe and Africa at its narrowest point?", ["Strait of Gibraltar", "English Channel", "Bosphorus", "Suez Canal"], 0, "medium", "The Strait of Gibraltar separates Spain and Morocco."] },
];
