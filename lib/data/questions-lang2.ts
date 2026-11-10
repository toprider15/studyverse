import type { QSeed } from "./types";

export const LANG2: Record<string, QSeed[]> = {
  french_reg: [
    ["Comment dit-on 'library' en français ?", ["bibliothèque", "librairie", "livre", "cahier"], 0, "easy", "'Bibliothèque' is a library; 'librairie' is a bookshop."],
    ["Quel est le pluriel de 'le journal' ?", ["les journaux", "les journals", "les journales", "le journaux"], 0, "easy", "Words ending in -al often form -aux plurals."],
    ["Complétez : Hier, je ___ au parc.", ["suis allé", "ai allé", "vais", "irai"], 0, "medium", "Aller uses être in the passé composé: je suis allé."],
    ["Complétez : Elle ___ une étudiante.", ["est", "es", "sont", "être"], 0, "medium", "The elle form of être is est."],
    ["Choisissez le subjonctif : Je veux que tu ___ prêt.", ["sois", "es", "être", "étais"], 0, "hard", "Vouloir que triggers the subjunctive: sois."],
    ["Le contraire de 'toujours' est...", ["jamais", "parfois", "aussi", "ensuite"], 0, "hard", "Toujours = always; jamais = never."],
  ],
  french_em: [
    ["Comment dit-on 'hello' ?", ["bonjour", "au revoir", "merci", "s'il vous plaît"], 0, "easy", "Bonjour means hello."],
    ["Quel nombre est 'cinq' ?", ["5", "4", "6", "7"], 0, "easy", "Cinq = 5."],
    ["Complétez : Je ___ étudiant.", ["suis", "es", "est", "sommes"], 0, "medium", "The je form of être is suis."],
    ["Comment dit-on 'book' ?", ["livre", "table", "chaise", "porte"], 0, "medium", "Livre means book."],
    ["Complétez : Nous ___ amis.", ["sommes", "sont", "suis", "est"], 0, "hard", "The nous form of être is sommes."],
    ["Le jour après lundi est...", ["mardi", "dimanche", "vendredi", "jeudi"], 0, "hard", "Tuesday follows Monday: mardi."],
  ],
  hindi: [
    ["'पुस्तक' का अंग्रेज़ी में अर्थ क्या है?", ["Book", "Pen", "Table", "Chair"], 0, "easy", "पुस्तक means book."],
    ["हिंदी में 'five' क्या है?", ["पाँच", "चार", "छह", "सात"], 0, "easy", "पाँच = five."],
    ["'धन्यवाद' का अर्थ है...", ["Thank you", "Hello", "Goodbye", "Please"], 0, "medium", "धन्यवाद means thank you."],
    ["विलोम शब्द चुनें: 'दिन' का विलोम", ["रात", "सुबह", "शाम", "दोपहर"], 0, "medium", "दिन (day) का विलोम रात (night) है।"],
    ["सही वर्तनी वाला शब्द चुनें:", ["विद्यालय", "विदयालय", "विध्यालय", "विद्यालय़"], 0, "hard", "सही वर्तनी 'विद्यालय' है।"],
    ["'किताब' का बहुवचन है...", ["किताबें", "किताबों", "किताबे", "किताब"], 0, "hard", "'किताब' का बहुवचन 'किताबें' है।"],
  ],
  german: [
    ["Was heißt 'library' auf Deutsch?", ["Bibliothek", "Buchhandlung", "Buch", "Heft"], 0, "easy", "Bibliothek means library."],
    ["Wie lautet der Plural von 'das Buch'?", ["die Bücher", "die Buchs", "die Bucher", "der Bücher"], 0, "easy", "Buch → Bücher."],
    ["Wähle das Perfekt: Gestern ___ ich ins Kino gegangen.", ["bin", "habe", "war", "werde"], 0, "medium", "Gehen uses sein in the perfect tense: ich bin gegangen."],
    ["Ergänze: Sie ___ eine Schülerin.", ["ist", "sind", "bist", "sein"], 0, "medium", "The sie (she) form of sein is ist."],
    ["Wähle den Konjunktiv: Ich möchte, dass du ___.", ["kommst", "komm", "kamst", "kommen"], 0, "hard", "After 'dass du' the verb takes the -st ending: kommst."],
    ["Das Gegenteil von 'immer' ist...", ["nie", "manchmal", "auch", "später"], 0, "hard", "Immer = always; nie = never."],
  ],
};
