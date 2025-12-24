
export enum AppTab {
  INFOGRAPHIC = 'INFOGRAPHIC',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  PRESENTATION = 'PRESENTATION'
}

export interface InfographicSettings {
  language: 'uz' | 'en' | 'ru';
  orientation: 'horizontal' | 'vertical' | 'square';
  detailLevel: 'low' | 'standard' | 'high';
  description: string;
}

export interface PresentationSettings {
  language: 'uz' | 'en' | 'ru';
  slideCount: 5 | 10 | 15;
  style: 'minimalist' | 'corporate' | 'creative';
  description: string;
}

export interface FlashcardSettings {
  language: 'uz' | 'en' | 'ru';
  cardCount: 8 | 12 | 16;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export interface QuizSettings {
  language: 'uz' | 'en' | 'ru';
  questionCount: 5 | 10 | 20;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export interface Slide {
  title: string;
  content: string[];
  detailedExplanation: string;
  visualPrompt: string;
  speakerNotes: string;
  didacticMethod?: string;
  imageUrl?: string;
}

export interface PresentationData {
  id: string;
  title: string;
  slides: Slide[];
  topicOverview: string;
  createdAt: number;
}

export interface InfographicData {
  id: string;
  title: string;
  imageUrl: string; 
  summary: string;
  keyConcepts: { term: string, definition: string }[];
  promptUsed: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardData {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export interface SourceAnalysis {
  title: string;
  visualPrompt: string;
  summary: string;
  keyConcepts: { term: string, definition: string }[];
}

export interface Source {
  id: string;
  name: string;
  data?: string;
  type: 'pdf' | 'text';
  isAnalyzing: boolean;
  analysis?: SourceAnalysis;
  createdAt: number;
}

export interface ImageEditRequest {
  image: string;
  prompt: string;
}
