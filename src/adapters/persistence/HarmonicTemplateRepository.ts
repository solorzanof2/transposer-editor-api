import { ObjectId } from 'mongodb';
import { Partition } from '../../core/commons/constants/Partitions';
import { HarmonicTemplate } from '../../core/domain/HarmonicTemplate';
import { MongoRepository } from '../../deepcore/infrastructure/persistence/MongoRepository';


export class HarmonicTemplateRepository extends MongoRepository<HarmonicTemplate> {

  constructor() {
    super(Partition.HarmonicTemplates);
  }

  async findByUser(userId: string): Promise<HarmonicTemplate[]> {
    return this.findAllByFilter({ userId });
  }

  async findByUserAndId(userId: string, templateId: string): Promise<HarmonicTemplate> {
    if (!ObjectId.isValid(templateId)) {
      return Promise.resolve({} as HarmonicTemplate);
    }

    return this.findOneByFilter({
      _id: new ObjectId(templateId),
      userId,
    });
  }

  async deleteByUserAndId(userId: string, templateId: string): Promise<void> {
    if (!ObjectId.isValid(templateId)) {
      return Promise.reject(new Error('invalid_harmonic_template_id'));
    }

    return this.deleteByFilter({
      _id: new ObjectId(templateId),
      userId,
    });
  }

}
