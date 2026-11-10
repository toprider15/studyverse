export const CLASSES = [
  { id: "c9a", name: "9A", grade: 9 },
  { id: "c9b", name: "9B", grade: 9 },
  { id: "c9c", name: "9C", grade: 9 },
];

export type StudentSeed = {
  id: string;
  username: string;
  name: string;
  cls: string;
  lang: string;
  math: "standard" | "extended";
  xp: number;
  coins: number;
  streak: number;
  emoji: string;
};

export const STUDENTS: StudentSeed[] = [
  { id: "u_alex", username: "alex", name: "Alex Chen", cls: "c9a", lang: "spanish_capable", math: "extended", xp: 2450, coins: 320, streak: 6, emoji: "🦊" },
  { id: "u_maya", username: "maya", name: "Maya Patel", cls: "c9a", lang: "spanish_capable", math: "standard", xp: 1980, coins: 210, streak: 4, emoji: "🦄" },
  { id: "u_liam", username: "liam", name: "Liam O'Connor", cls: "c9a", lang: "french_regular", math: "extended", xp: 2210, coins: 260, streak: 5, emoji: "🐺" },
  { id: "u_zara", username: "zara", name: "Zara Khan", cls: "c9a", lang: "hindi", math: "standard", xp: 1670, coins: 150, streak: 3, emoji: "🦋" },
  { id: "u_noah", username: "noah", name: "Noah Williams", cls: "c9a", lang: "french_emergent", math: "standard", xp: 980, coins: 90, streak: 2, emoji: "🐼" },
  { id: "u_emma", username: "emma", name: "Emma Rossi", cls: "c9a", lang: "spanish_capable", math: "standard", xp: 1410, coins: 120, streak: 4, emoji: "🐱" },
  { id: "u_omar", username: "omar", name: "Omar Haddad", cls: "c9a", lang: "hindi", math: "extended", xp: 1250, coins: 140, streak: 1, emoji: "🦁" },
  { id: "u_chloe", username: "chloe", name: "Chloe Dubois", cls: "c9a", lang: "french_regular", math: "standard", xp: 1100, coins: 100, streak: 3, emoji: "🐰" },
  { id: "u_sofia", username: "sofia", name: "Sofia Alvarez", cls: "c9b", lang: "spanish_emergent", math: "standard", xp: 1320, coins: 130, streak: 5, emoji: "🌻" },
  { id: "u_arjun", username: "arjun", name: "Arjun Mehta", cls: "c9b", lang: "hindi", math: "extended", xp: 1890, coins: 180, streak: 7, emoji: "🐯" },
  { id: "u_priya", username: "priya", name: "Priya Sharma", cls: "c9b", lang: "hindi", math: "standard", xp: 1560, coins: 160, streak: 2, emoji: "🪷" },
  { id: "u_ethan", username: "ethan", name: "Ethan Brooks", cls: "c9b", lang: "french_regular", math: "extended", xp: 1740, coins: 170, streak: 4, emoji: "🦅" },
  { id: "u_lucia", username: "lucia", name: "Lucia Romero", cls: "c9b", lang: "spanish_capable", math: "standard", xp: 2050, coins: 240, streak: 8, emoji: "🌺" },
  { id: "u_ben", username: "ben", name: "Ben Carter", cls: "c9b", lang: "spanish_emergent", math: "extended", xp: 890, coins: 70, streak: 1, emoji: "🐸" },
  { id: "u_nina", username: "nina", name: "Nina Petrova", cls: "c9b", lang: "french_emergent", math: "standard", xp: 760, coins: 60, streak: 0, emoji: "🐨" },
  { id: "u_kabir", username: "kabir", name: "Kabir Singh", cls: "c9b", lang: "hindi", math: "standard", xp: 1180, coins: 110, streak: 3, emoji: "🐲" },
  { id: "u_victor", username: "victor", name: "Victor Schneider", cls: "c9c", lang: "german", math: "extended", xp: 2100, coins: 230, streak: 5, emoji: "🦉" },
  { id: "u_ava", username: "ava", name: "Ava Thompson", cls: "c9c", lang: "spanish_capable", math: "standard", xp: 1820, coins: 190, streak: 6, emoji: "🌟" },
  { id: "u_diego", username: "diego", name: "Diego Morales", cls: "c9c", lang: "spanish_emergent", math: "standard", xp: 1440, coins: 130, streak: 4, emoji: "⚡" },
  { id: "u_fatima", username: "fatima", name: "Fatima Noor", cls: "c9c", lang: "french_regular", math: "standard", xp: 1600, coins: 150, streak: 2, emoji: "🌙" },
  { id: "u_leo", username: "leo", name: "Leo Martins", cls: "c9c", lang: "french_emergent", math: "extended", xp: 1050, coins: 95, streak: 3, emoji: "🐙" },
  { id: "u_anya", username: "anya", name: "Anya Kapoor", cls: "c9c", lang: "spanish_capable", math: "extended", xp: 2300, coins: 280, streak: 9, emoji: "🔮" },
  { id: "u_theo", username: "theo", name: "Theo Laurent", cls: "c9c", lang: "french_regular", math: "standard", xp: 1290, coins: 115, streak: 1, emoji: "🎧" },
  { id: "u_isabel", username: "isabel", name: "Isabel Cruz", cls: "c9c", lang: "spanish_emergent", math: "standard", xp: 950, coins: 80, streak: 0, emoji: "🍀" },
];

export const LANG_SUBJECT: Record<string, string> = {
  spanish_capable: "spanish_cap",
  spanish_emergent: "spanish_em",
  french_regular: "french_reg",
  french_emergent: "french_em",
  hindi: "hindi",
  german: "german",
};

export const DIVISION_LABEL: Record<string, string> = {
  spanish_capable: "Spanish Capable",
  spanish_emergent: "Spanish Emergent",
  french_regular: "French Regular",
  french_emergent: "French Emergent",
  hindi: "Hindi",
  german: "German",
};
