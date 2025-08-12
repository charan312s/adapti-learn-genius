export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export interface LearningLevel {
  id: number;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  questions: Question[];
  content: {
    visual: string;
    auditory: string;
    reading: string;
    kinesthetic: string;
  };
  requiredScore: number;
  unlocked: boolean;
}

export interface Question {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  score: number;
  attempts: number;
  completedAt?: Date;
}
