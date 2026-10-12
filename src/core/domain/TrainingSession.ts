import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';
import { TrainingModule } from './TrainingProgress';


export type TrainingMode = TrainingModule | 'mix';
export type RoundType = 'timed' | 'count';
export type TrainingSpelling = 'sharps' | 'flats';

export interface TrainingAttemptRecord {
  id: string;
  module: TrainingModule;
  challenge: Record<string, unknown>;
  prompt: string;
  expected: string;
  answer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  createdAt: number;
}

export interface TrainingSessionSummary {
  accuracy: number;
  avgMs: number;
  correctPerMinute: number;
  fluency: number;
}

export class TrainingSession extends MongoDBModel {

  userId: string = '';
  mode: TrainingMode = 'mix';
  roundType: RoundType = 'count';
  spelling: TrainingSpelling = 'sharps';
  startedAt: number = Date.now();
  completedAt?: number;
  asked: number = 0;
  correct: number = 0;
  bestStreak: number = 0;
  totalMs: number = 0;
  xp: number = 0;
  summary: TrainingSessionSummary = {
    accuracy: 0,
    avgMs: 0,
    correctPerMinute: 0,
    fluency: 0,
  };
  attempts: TrainingAttemptRecord[] = [];

  constructor() {
    super();
  }

}
