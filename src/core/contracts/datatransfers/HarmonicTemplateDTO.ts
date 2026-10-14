import { HarmonicTemplateMode, HarmonicTemplateSection } from '../../domain/HarmonicTemplate';


export interface HarmonicTemplateDTO {
  id: string;
  name: string;
  description?: string;
  sourceSongId?: string;
  sourceTitle?: string;
  sourceArtist?: string;
  mode: HarmonicTemplateMode;
  tags: string[];
  sections: HarmonicTemplateSection[];
  isDerived: boolean;
  parentTemplateId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHarmonicTemplateRequestDTO {
  name: string;
  description?: string;
  sourceSongId?: string;
  sourceTitle?: string;
  sourceArtist?: string;
  mode: HarmonicTemplateMode;
  tags?: string[];
  sections: HarmonicTemplateSection[];
}

export interface PatchHarmonicTemplateRequestDTO {
  name?: string;
  description?: string;
  sourceSongId?: string;
  sourceTitle?: string;
  sourceArtist?: string;
  mode?: HarmonicTemplateMode;
  tags?: string[];
  sections?: HarmonicTemplateSection[];
  isDerived?: boolean;
  parentTemplateId?: string;
}

export interface CloneHarmonicTemplateRequestDTO {
  name?: string;
  description?: string;
  tags?: string[];
}
