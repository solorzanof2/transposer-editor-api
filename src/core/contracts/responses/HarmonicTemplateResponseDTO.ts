import { HarmonicTemplateMode, HarmonicTemplateSection } from '../../domain/HarmonicTemplate';


export interface HarmonicTemplateResponseDTO {
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
  createdAtLabel: string;
  updatedAt: number;
  updatedAtLabel: string;
}
