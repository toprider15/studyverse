export const ARCADE_GAMES = [
  { key: "reaction", name: "Reaction Test", description: "Click the instant the arena turns green. Pure reflex.", icon: "⚡", instructions: "Wait for the green signal, then click as fast as you can. Five rounds. Your score is your average reaction time in milliseconds — lower is better.", score_direction: "low", unit: "ms", max_scores: JSON.stringify({ easy: 6000, medium: 5000, hard: 4000 }), order_index: 1 },
  { key: "memory", name: "Memory Match", description: "Flip cards and match every pair before the clock runs out.", icon: "🧠", instructions: "Click a card to flip it, then find its pair. Match all pairs. Fewer moves and faster finishes score higher.", score_direction: "high", unit: "pts", max_scores: JSON.stringify({ easy: 2000, medium: 3000, hard: 4000 }), order_index: 2 },
  { key: "number", name: "Number Rush", description: "Solve as many quick-fire arithmetic puzzles as you can in 60 seconds.", icon: "🔢", instructions: "Choose the correct answer to each maths problem. You have 60 seconds. Correct answers add points; wrong answers cost a little time.", score_direction: "high", unit: "pts", max_scores: JSON.stringify({ easy: 120, medium: 160, hard: 200 }), order_index: 3 },
  { key: "pattern", name: "Pattern Pulse", description: "Watch the sequence, then repeat it. How deep can you go?", icon: "🎵", instructions: "Four pads light up in a sequence. Repeat it by clicking the pads in the same order. Each round adds one more step.", score_direction: "high", unit: "rounds", max_scores: JSON.stringify({ easy: 60, medium: 90, hard: 120 }), order_index: 4 },
  { key: "word", name: "Word Scramble", description: "Unscramble as many words as you can in 60 seconds.", icon: "🔤", instructions: "Type the word that matches the scrambled letters. Press Enter to submit. You have 60 seconds.", score_direction: "high", unit: "pts", max_scores: JSON.stringify({ easy: 120, medium: 160, hard: 200 }), order_index: 5 },
];

export const EVENTS = [
  { id: "ev_championship", title: "Term 1 Championship", description: "The flagship school-wide academic tournament. Eight qualifiers, one champion, and a place in the StudyVerse Hall of Fame.", category: "tournament", starts_at: 10, ends_at: 10, start_hour: 9, end_hour: 16, location: "Main Hall & Online" },
  { id: "ev_science", title: "Science Fair", description: "Bring your best experiment or engineering build. Visitors from all year groups are welcome.", category: "academic", starts_at: 3, ends_at: 3, start_hour: 10, end_hour: 15, location: "Science Block" },
  { id: "ev_arcade", title: "Arcade Night", description: "Open arcade session with Showdown challenges running all evening. Bring your reflexes.", category: "hangout", starts_at: 5, ends_at: 5, start_hour: 16, end_hour: 19, location: "Student Commons" },
  { id: "ev_sports", title: "Grade 9 Sports Day", description: "House teams compete across track, football and basketball. Come and support your class.", category: "sports", starts_at: 14, ends_at: 14, start_hour: 8, end_hour: 16, location: "Sports Field" },
  { id: "ev_library", title: "Revision Lounge", description: "Quiet revision space with subject mentors on hand. Snacks provided.", category: "academic", starts_at: 7, ends_at: 7, start_hour: 15, end_hour: 18, location: "Library" },
  { id: "ev_showdown", title: "Showdown Finals", description: "The weekly arcade championship finals. Winners take home a limited trophy.", category: "tournament", starts_at: 9, ends_at: 9, start_hour: 17, end_hour: 19, location: "Student Commons" },
  { id: "ev_movie", title: "Friday Movie Social", description: "End the week with a movie in the commons. Vote for the film in homeroom.", category: "hangout", starts_at: 4, ends_at: 4, start_hour: 17, end_hour: 19, location: "Student Commons" },
];

export const MENU_ITEMS: Record<number, { category: string; item: string; description: string; special?: number }[]> = {
  1: [
    { category: "main", item: "Pasta Bolognese", description: "Slow-cooked beef ragu with spaghetti and parmesan." },
    { category: "veg", item: "Caesar Salad", description: "Romaine, croutons, parmesan and a creamy dressing." },
    { category: "dessert", item: "Fruit Cup", description: "Seasonal fruit, freshly cut." },
  ],
  2: [
    { category: "main", item: "Chicken Wrap", description: "Grilled chicken, lettuce, tomato and yogurt sauce." },
    { category: "veg", item: "Roasted Veg Couscous", description: "Couscous with roasted peppers and courgette." },
    { category: "dessert", item: "Oat Cookie", description: "Baked in-house." },
  ],
  3: [
    { category: "main", item: "Veggie Pizza", description: "Cheese and vegetable pizza with tomato base." },
    { category: "veg", item: "Tomato Basil Soup", description: "Warm tomato soup with fresh basil." },
    { category: "dessert", item: "Yogurt Parfait", description: "Layered yogurt, berries and granola." },
  ],
  4: [
    { category: "main", item: "Rice & Curry", description: "Mild chicken curry with steamed rice." },
    { category: "veg", item: "Dal & Rice", description: "Spiced lentils with rice and pickles." },
    { category: "dessert", item: "Mango Sorbet", description: "Dairy-free and refreshing." },
  ],
  5: [
    { category: "main", item: "Beef Burger & Fries", description: "Beef burger with fries and salad.", special: 1 },
    { category: "veg", item: "Halloumi Burger", description: "Grilled halloumi with roasted vegetables." },
    { category: "dessert", item: "Ice Cream", description: "Vanilla scoop with chocolate sauce.", special: 1 },
  ],
};
