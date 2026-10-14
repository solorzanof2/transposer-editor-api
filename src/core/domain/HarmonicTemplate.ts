import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';


export type HarmonicTemplateMode = 'major' | 'minor';

export interface HarmonicTemplateSection {
  id?: string;
  name: string;
  degrees: string[];
  order: number;
}

export class HarmonicTemplate extends MongoDBModel {

  userId: string = '';
  name: string = '';
  description?: string;
  sourceSongId?: string;
  sourceTitle?: string;
  sourceArtist?: string;
  mode: HarmonicTemplateMode = 'major';
  tags: string[] = [];
  sections: HarmonicTemplateSection[] = [];
  isDerived: boolean = false;
  parentTemplateId?: string;
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor() {
    super();
  }

}
