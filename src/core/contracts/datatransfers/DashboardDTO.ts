import { WeakModuleDTO } from './TrainingDTO';


export interface DashboardSummaryDTO {
  songs: {
    count: number;
    recent: {
      id: string;
      title: string;
      artist?: string;
      updatedAt: number;
    } | null;
  };
  training: {
    xp: number;
    level: number;
    streak: number;
    accuracy: number;
    bestFluency: number;
    weakModules: WeakModuleDTO[];
  };
}
