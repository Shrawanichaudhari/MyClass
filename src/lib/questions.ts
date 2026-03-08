// Shared questions data for the quiz engine
export interface Question {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  conceptTag: string;
  hint: string;
}

export const QUESTIONS: Question[] = [
  // Algebra
  {
    id: 'alg-1', topic: 'Algebra', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'easy', question: 'Solve for x: 2x + 5 = 13',
    options: ['x = 2', 'x = 3', 'x = 4', 'x = 9'],
    correct: 2,
    explanation: 'Step 1: Subtract 5 from both sides → 2x = 8. Step 2: Divide both sides by 2 → x = 4.',
    conceptTag: 'linear_equations', hint: 'Isolate x by moving constants to the other side first.',
  },
  {
    id: 'alg-2', topic: 'Algebra', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'medium', question: 'Expand: 2(x + 3)',
    options: ['2x + 3', '2x + 6', 'x + 6', '2x + 5'],
    correct: 1,
    explanation: 'Apply the distributive property: 2 × x = 2x and 2 × 3 = 6. So 2(x + 3) = 2x + 6.',
    conceptTag: 'distributive_property', hint: 'Multiply the number outside the bracket by each term inside.',
  },
  {
    id: 'alg-3', topic: 'Algebra', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'hard', question: 'If 3x − 7 = 2x + 5, find the value of x.',
    options: ['x = 7', 'x = 12', 'x = −2', 'x = 5'],
    correct: 1,
    explanation: 'Step 1: 3x − 2x = 5 + 7. Step 2: x = 12.',
    conceptTag: 'linear_equations', hint: 'Move all x terms to one side and constants to the other.',
  },
  // Geometry
  {
    id: 'geo-1', topic: 'Geometry', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'easy', question: 'What is the sum of interior angles of a triangle?',
    options: ['90°', '180°', '270°', '360°'],
    correct: 1,
    explanation: 'The angle sum property states that the three interior angles of any triangle always add up to 180°.',
    conceptTag: 'angle_sum_property', hint: 'Think about what happens when you tear the corners of a triangle and line them up.',
  },
  {
    id: 'geo-2', topic: 'Geometry', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'medium', question: 'The area of a rectangle is 48 cm². If its width is 6 cm, what is its length?',
    options: ['6 cm', '8 cm', '10 cm', '12 cm'],
    correct: 1,
    explanation: 'Area = Length × Width. So Length = Area ÷ Width = 48 ÷ 6 = 8 cm.',
    conceptTag: 'area_formulas', hint: 'Use the formula: Area = Length × Width and rearrange.',
  },
  {
    id: 'geo-3', topic: 'Geometry', subject: 'Mathematics', grade: 'Class 8',
    difficulty: 'medium', question: 'Using the Pythagorean theorem, find the hypotenuse if the other two sides are 3 cm and 4 cm.',
    options: ['5 cm', '6 cm', '7 cm', '8 cm'],
    correct: 0,
    explanation: 'a² + b² = c². So 3² + 4² = c². 9 + 16 = 25. c = √25 = 5 cm.',
    conceptTag: 'pythagorean_theorem', hint: 'Remember: a² + b² = c² where c is the hypotenuse.',
  },
  // Fractions
  {
    id: 'fra-1', topic: 'Fractions', subject: 'Mathematics', grade: 'Class 6',
    difficulty: 'easy', question: 'What is 1/2 + 1/4?',
    options: ['2/6', '3/4', '2/4', '1/4'],
    correct: 1,
    explanation: 'Find LCM of 2 and 4 = 4. Convert: 1/2 = 2/4. Then 2/4 + 1/4 = 3/4.',
    conceptTag: 'fraction_addition', hint: 'Make the denominators equal before adding.',
  },
  {
    id: 'fra-2', topic: 'Fractions', subject: 'Mathematics', grade: 'Class 6',
    difficulty: 'medium', question: 'Which fraction is equivalent to 2/3?',
    options: ['4/9', '6/9', '4/6', '8/9'],
    correct: 2,
    explanation: 'Multiply both numerator and denominator by 2: 2×2=4, 3×2=6. So 4/6 = 2/3.',
    conceptTag: 'equivalent_fractions', hint: 'Multiply or divide both parts by the same number.',
  },
  // Science
  {
    id: 'sci-1', topic: 'Newton\'s Laws', subject: 'Science', grade: 'Class 9',
    difficulty: 'easy', question: 'Which of Newton\'s Laws states that every action has an equal and opposite reaction?',
    options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
    correct: 2,
    explanation: 'Newton\'s Third Law of Motion states: For every action, there is an equal and opposite reaction.',
    conceptTag: 'newtons_laws', hint: 'Think about what happens when you push against a wall.',
  },
  {
    id: 'sci-2', topic: 'Cell Biology', subject: 'Science', grade: 'Class 8',
    difficulty: 'medium', question: 'Which organelle is known as the "powerhouse of the cell"?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Body'],
    correct: 2,
    explanation: 'Mitochondria produce ATP (adenosine triphosphate), the energy currency of cells, through cellular respiration.',
    conceptTag: 'cell_organelles', hint: 'This organelle is responsible for energy production.',
  },
  // History
  {
    id: 'his-1', topic: 'Indian History', subject: 'Social Science', grade: 'Class 8',
    difficulty: 'medium', question: 'In which year did India gain independence?',
    options: ['1945', '1947', '1950', '1952'],
    correct: 1,
    explanation: 'India gained independence from British rule on 15th August 1947.',
    conceptTag: 'modern_history', hint: 'This event is celebrated every year on 15th August.',
  },
  {
    id: 'his-2', topic: 'Indian History', subject: 'Social Science', grade: 'Class 8',
    difficulty: 'easy', question: 'Who is known as the "Father of the Nation" in India?',
    options: ['Jawaharlal Nehru', 'Bal Gangadhar Tilak', 'B.R. Ambedkar', 'Mahatma Gandhi'],
    correct: 3,
    explanation: 'Mahatma Gandhi, born Mohandas Karamchand Gandhi, is called the Father of the Nation for his leadership in India\'s independence movement through non-violent civil disobedience.',
    conceptTag: 'freedom_struggle', hint: 'He led the non-cooperation and civil disobedience movements.',
  },
];

export const getQuestionsByTopic = (topic: string) =>
  QUESTIONS.filter(q => q.topic === topic);

export const getQuestionsByDifficulty = (acc: number): Question[] => {
  const difficulty = acc < 50 ? 'easy' : acc < 80 ? 'medium' : 'hard';
  return QUESTIONS.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
