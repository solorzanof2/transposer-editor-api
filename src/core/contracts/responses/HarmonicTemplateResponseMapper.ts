import { HarmonicTemplateDTO } from '../datatransfers/HarmonicTemplateDTO';
import { Dates } from '../../helpers/DatesHelper';
import { HarmonicTemplateResponseDTO } from './HarmonicTemplateResponseDTO';


export const toHarmonicTemplateResponseDTO = (template: HarmonicTemplateDTO): HarmonicTemplateResponseDTO => ({
  id: template.id,
  name: template.name,
  description: template.description,
  sourceSongId: template.sourceSongId,
  sourceTitle: template.sourceTitle,
  sourceArtist: template.sourceArtist,
  mode: template.mode,
  tags: template.tags,
  sections: template.sections,
  isDerived: template.isDerived,
  parentTemplateId: template.parentTemplateId,
  createdAt: template.createdAt,
  createdAtLabel: Dates.millisToLocalUserDatetime(template.createdAt),
  updatedAt: template.updatedAt,
  updatedAtLabel: Dates.millisToLocalUserDatetime(template.updatedAt),
});
