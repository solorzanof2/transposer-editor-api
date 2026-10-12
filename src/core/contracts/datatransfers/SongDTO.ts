import { EnharmonicPreference } from '../../domain/Song';


export interface SongDTO {
  id: string;
  title: string;
  artist?: string;
  source: string;
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference: EnharmonicPreference;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSongRequestDTO {
  title: string;
  artist?: string;
  source: string;
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference?: EnharmonicPreference;
}

export interface UpdateSongRequestDTO extends CreateSongRequestDTO {}

export interface PatchSongRequestDTO {
  title?: string;
  artist?: string;
  source?: string;
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference?: EnharmonicPreference;
}

export type SongRenderFormat = 'txt' | 'md' | 'html' | 'slides' | 'architecture-chords' | 'architecture-degrees';

export interface ParseSongRequestDTO {
  source: string;
}

export interface TransposeSongRequestDTO {
  source: string;
  fromKey?: string;
  toKey: string;
  enharmonicPreference?: EnharmonicPreference;
}

export interface RenderSongRequestDTO {
  source: string;
  format: SongRenderFormat;
  targetKey?: string;
  enharmonicPreference?: EnharmonicPreference;
}

export interface TransposeStoredSongRequestDTO {
  targetKey: string;
  persistLastTargetKey?: boolean;
  enharmonicPreference?: EnharmonicPreference;
}

export interface ExportSongRequestDTO {
  format: SongRenderFormat;
  targetKey?: string;
  enharmonicPreference?: EnharmonicPreference;
}
