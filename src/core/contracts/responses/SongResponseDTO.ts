import { EnharmonicPreference } from '../../domain/Song';


export interface SongResponseDTO {
  id: string;
  title: string;
  artist?: string;
  source: string;
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference: EnharmonicPreference;
  createdAt: number;
  createdAtLabel: string;
  updatedAt: number;
  updatedAtLabel: string;
}
