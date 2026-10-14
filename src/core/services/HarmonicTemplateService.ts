import { ObjectId } from 'mongodb';
import { HarmonicTemplateRepository } from '../../adapters/persistence/HarmonicTemplateRepository';
import { CloneHarmonicTemplateRequestDTO, CreateHarmonicTemplateRequestDTO, HarmonicTemplateDTO, PatchHarmonicTemplateRequestDTO } from '../contracts/datatransfers/HarmonicTemplateDTO';
import { HarmonicTemplate } from '../domain/HarmonicTemplate';
import { useReject, useResolve } from '../helpers/functions/Promises';


export class HarmonicTemplateService {

  private harmonicTemplateRepository: HarmonicTemplateRepository = new HarmonicTemplateRepository();

  constructor() { }

  async listByUser(userId: string): Promise<HarmonicTemplateDTO[]> {
    try {
      const templates = await this.harmonicTemplateRepository.findByUser(userId);
      return useResolve(templates.map((template) => this.toDTO(template)));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async getById(userId: string, templateId: string): Promise<HarmonicTemplateDTO | null> {
    try {
      const template = await this.harmonicTemplateRepository.findByUserAndId(userId, templateId);

      if (!template?._id) {
        return useResolve(null);
      }

      return useResolve(this.toDTO(template));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async create(userId: string, payload: CreateHarmonicTemplateRequestDTO): Promise<HarmonicTemplateDTO> {
    try {
      const now = Date.now();
      const template = new HarmonicTemplate();

      template.userId = userId;
      template.name = payload.name;
      template.description = payload.description;
      template.sourceSongId = payload.sourceSongId;
      template.sourceTitle = payload.sourceTitle;
      template.sourceArtist = payload.sourceArtist;
      template.mode = payload.mode;
      template.tags = payload.tags || [];
      template.sections = payload.sections;
      template.isDerived = !!payload.sourceSongId;
      template.createdAt = now;
      template.updatedAt = now;

      const id = await this.harmonicTemplateRepository.save(template);
      template._id = new ObjectId(id);

      return useResolve(this.toDTO(template));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async patch(userId: string, templateId: string, payload: PatchHarmonicTemplateRequestDTO): Promise<HarmonicTemplateDTO | null> {
    try {
      const template = await this.harmonicTemplateRepository.findByUserAndId(userId, templateId);

      if (!template?._id) {
        return useResolve(null);
      }

      if (payload.name !== undefined) template.name = payload.name;
      if (payload.description !== undefined) template.description = payload.description;
      if (payload.sourceSongId !== undefined) template.sourceSongId = payload.sourceSongId;
      if (payload.sourceTitle !== undefined) template.sourceTitle = payload.sourceTitle;
      if (payload.sourceArtist !== undefined) template.sourceArtist = payload.sourceArtist;
      if (payload.mode !== undefined) template.mode = payload.mode;
      if (payload.tags !== undefined) template.tags = payload.tags;
      if (payload.sections !== undefined) template.sections = payload.sections;
      if (payload.isDerived !== undefined) template.isDerived = payload.isDerived;
      if (payload.parentTemplateId !== undefined) template.parentTemplateId = payload.parentTemplateId;
      template.updatedAt = Date.now();

      await this.harmonicTemplateRepository.update(template);

      return useResolve(this.toDTO(template));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async delete(userId: string, templateId: string): Promise<boolean> {
    try {
      const template = await this.harmonicTemplateRepository.findByUserAndId(userId, templateId);

      if (!template?._id) {
        return useResolve(false);
      }

      await this.harmonicTemplateRepository.deleteByUserAndId(userId, templateId);

      return useResolve(true);
    }
    catch (error) {
      return useReject(error);
    }
  }

  async clone(userId: string, templateId: string, payload: CloneHarmonicTemplateRequestDTO = {}): Promise<HarmonicTemplateDTO | null> {
    try {
      const source = await this.harmonicTemplateRepository.findByUserAndId(userId, templateId);

      if (!source?._id) {
        return useResolve(null);
      }

      const now = Date.now();
      const clone = new HarmonicTemplate();

      clone.userId = userId;
      clone.name = payload.name || `${source.name} - copia`;
      clone.description = payload.description || source.description;
      clone.sourceSongId = source.sourceSongId;
      clone.sourceTitle = source.sourceTitle;
      clone.sourceArtist = source.sourceArtist;
      clone.mode = source.mode;
      clone.tags = payload.tags || [...source.tags];
      clone.sections = source.sections.map((section) => ({
        id: section.id,
        name: section.name,
        degrees: [...section.degrees],
        order: section.order,
      }));
      clone.isDerived = true;
      clone.parentTemplateId = source._id.toString();
      clone.createdAt = now;
      clone.updatedAt = now;

      const id = await this.harmonicTemplateRepository.save(clone);
      clone._id = new ObjectId(id);

      return useResolve(this.toDTO(clone));
    }
    catch (error) {
      return useReject(error);
    }
  }

  private toDTO(template: HarmonicTemplate): HarmonicTemplateDTO {
    return {
      id: template._id.toString(),
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
      updatedAt: template.updatedAt,
    };
  }

}
