import { Route } from '../../../deepcore/contracts/Route';
import { CloneHarmonicTemplateHandler } from './CloneHarmonicTemplateHandler';
import { CreateHarmonicTemplateHandler } from './CreateHarmonicTemplateHandler';
import { DeleteHarmonicTemplateHandler } from './DeleteHarmonicTemplateHandler';
import { GetHarmonicTemplatesHandler } from './GetAllHarmonicTemplatesHandler';
import { GetHarmonicTemplateHandler } from './GetHarmonicTemplateHandler';
import { PatchHarmonicTemplateHandler } from './PatchHarmonicTemplateHandler';


export const HarmonicTemplateRouting: Route[] = [
  {
    path: '/api/v1/harmonic-templates',
    method: 'get',
    handler: GetHarmonicTemplatesHandler,
  },
  {
    path: '/api/v1/harmonic-templates',
    method: 'post',
    handler: CreateHarmonicTemplateHandler,
  },
  {
    path: '/api/v1/harmonic-templates/:templateId',
    method: 'get',
    handler: GetHarmonicTemplateHandler,
  },
  {
    path: '/api/v1/harmonic-templates/:templateId',
    method: 'patch',
    handler: PatchHarmonicTemplateHandler,
  },
  {
    path: '/api/v1/harmonic-templates/:templateId',
    method: 'delete',
    handler: DeleteHarmonicTemplateHandler,
  },
  {
    path: '/api/v1/harmonic-templates/:templateId/clone',
    method: 'post',
    handler: CloneHarmonicTemplateHandler,
  },
];
