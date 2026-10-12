import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';


export type TrainingModule = 'transposition' | 'intervals' | 'degrees';

export interface ModuleMastery {
  score: number;
  attempts: number;
  correct: number;
  totalMs: number;
}

export const createEmptyModuleMastery = (): ModuleMastery => ({
  score: 0,
  attempts: 0,
  correct: 0,
  totalMs: 0,
});

export class TrainingProgress extends MongoDBModel {

  userId: string = '';
  xp: number = 0;
  streak: number = 0;
  lastSessionDate?: number;
  bestFluency: number = 0;
  mastery: Record<TrainingModule, ModuleMastery> = {
    transposition: createEmptyModuleMastery(),
    intervals: createEmptyModuleMastery(),
    degrees: createEmptyModuleMastery(),
  };
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor() {
    super();
  }

}
