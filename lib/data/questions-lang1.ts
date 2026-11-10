import type { QSeed } from "./types";

export const LANG1: Record<string, QSeed[]> = {
  langlit: [
    ["Which literary device gives human qualities to non-human things?", ["Personification", "Simile", "Alliteration", "Hyperbole"], 0, "easy", "Personification gives human traits to objects or ideas."],
    ["A comparison using 'like' or 'as' is called a...", ["Metaphor", "Simile", "Personification", "Irony"], 1, "easy", "Similes compare using 'like' or 'as'."],
    ["Which sentence is punctuated correctly?", ["\"Where are you going?\" she asked.", "\"Where are you going\" she asked?", "Where are you going? she asked.", "\"Where are you going?\" She asked"], 0, "easy", "The question mark stays inside the quotation marks and the dialogue tag is lowercase."],
    ["What is the central idea or message of a text called?", ["Theme", "Plot", "Setting", "Rhyme"], 0, "medium", "Theme is the underlying message or central idea."],
    ["An author's attitude toward their subject is called the...", ["Tone", "Mood", "Genre", "Structure"], 0, "medium", "Tone is the writer's attitude; mood is the reader's feeling."],
    ["Which of these is a metaphor?", ["The moon is a silver coin.", "The moon shines like silver.", "The moon is very bright.", "The moon rose slowly."], 0, "medium", "A metaphor states one thing is another without using like or as."],
    ["What is the effect of foreshadowing?", ["It hints at events to come", "It repeats consonant sounds", "It compares two unlike things", "It resolves the conflict"], 0, "hard", "Foreshadowing plants clues about later events."],
    ["In 'The road was a ribbon of moonlight', the device is...", ["Metaphor", "Simile", "Onomatopoeia", "Alliteration"], 0, "hard", "The road is directly described as a ribbon — a metaphor."],
  ],
  spanish_cap: [
    ["¿Cómo se dice 'library' en español?", ["biblioteca", "librería", "libro", "cuaderno"], 0, "easy", "'Biblioteca' is a library; 'librería' is a bookshop."],
    ["¿Cuál es el plural de 'el lápiz'?", ["los lápices", "los lápiz", "las lápices", "el lápices"], 0, "easy", "Words ending in -z change to -ces in the plural."],
    ["Elige el pretérito correcto: Ayer yo ___ al parque.", ["fui", "voy", "iré", "iba"], 0, "medium", "Ayer signals the preterite: yo fui."],
    ["Completa: Ella ___ una estudiante.", ["es", "está", "son", "ser"], 0, "medium", "Permanent characteristics use ser: ella es."],
    ["Elige el subjuntivo correcto: Espero que tú ___ bien.", ["estés", "estás", "estar", "estuviste"], 0, "hard", "Espero que triggers the subjunctive: estés."],
    ["¿Cuál es el opuesto de 'siempre'?", ["nunca", "a veces", "también", "luego"], 0, "hard", "'Siempre' means always; 'nunca' means never."],
  ],
  spanish_em: [
    ["¿Cómo se dice 'hello'?", ["hola", "adiós", "gracias", "por favor"], 0, "easy", "Hola means hello."],
    ["¿Qué número es 'cinco'?", ["5", "4", "6", "7"], 0, "easy", "Cinco = 5."],
    ["Completa: Yo ___ estudiante.", ["soy", "eres", "es", "somos"], 0, "medium", "The yo form of ser is soy."],
    ["¿Cómo se dice 'book'?", ["libro", "mesa", "silla", "puerta"], 0, "medium", "Libro means book."],
    ["Completa: Nosotros ___ amigos.", ["somos", "son", "soy", "es"], 0, "hard", "The nosotros form of ser is somos."],
    ["El día después de lunes es...", ["martes", "domingo", "viernes", "jueves"], 0, "hard", "Tuesday follows Monday: martes."],
  ],
};
