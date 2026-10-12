import { ModuleMastery, TrainingModule } from '../../domain/TrainingProgress';
import { RoundType, TrainingAttemptRecord, TrainingMode, TrainingSessionSummary, TrainingSpelling } from '../../domain/TrainingSession';


export interface TrainingProgressDTO {
  xp: number;
  streak: number;
  lastSessionDate?: number;
  bestFluency: number;
  mastery: Record<TrainingModule, ModuleMastery>;
}

export interface UpdateTrainingProgressRequestDTO extends TrainingProgressDTO {}

export interface CreateTrainingSessionRequestDTO {
  mode: TrainingMode;
  roundType: RoundType;
  spelling: TrainingSpelling;
}

export interface TrainingSessionDTO {
  id: string;
  mode: TrainingMode;
  roundType: RoundType;
  spelling: TrainingSpelling;
  startedAt: number;
  completedAt?: number;
  asked: number;
  correct: number;
  bestStreak: number;
  totalMs: number;
  xp: number;
  summary: TrainingSessionSummary;
  attempts: TrainingAttemptRecord[];
}

export interface CreateTrainingAttemptRequestDTO {
  module: TrainingModule;
  challenge: Record<string, unknown>;
  prompt: string;
  expected: string;
  answer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface CompleteTrainingSessionRequestDTO {
  completedAt?: number;
}

export interface TrainingStatsDTO {
  sessions: number;
  attempts: number;
  accuracy: number;
  avgMs: number;
  correctPerMinute: number;
  fluency: number;
  xp: number;
  streak: number;
}

export interface WeakModuleDTO {
  module: TrainingModule;
  score: number;
  accuracy: number;
  avgMs: number;
}
