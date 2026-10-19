import { ObjectId } from 'mongodb';
import { HarmonicTemplateRepository } from '../../../src/adapters/persistence/HarmonicTemplateRepository';
import { HarmonicTemplate } from '../../../src/core/domain/HarmonicTemplate';
import { HarmonicTemplateService } from '../../../src/core/services/HarmonicTemplateService';
jest.mock('../../../src/adapters/persistence/HarmonicTemplateRepository', () => ({ HarmonicTemplateRepository: jest.fn() }));
const find = jest.fn(); const save = jest.fn(); const update = jest.fn();
const id = new ObjectId(); const cloneId = new ObjectId();
let source: HarmonicTemplate;
beforeEach(() => {
  jest.clearAllMocks();
  source = Object.assign(new HarmonicTemplate(), { _id: id, userId: 'owner', name: 'Original', description: 'Original description', sourceSongId: 'song-id', mode: 'minor', tags: ['jazz'], sections: [{ id: 'section', name: 'VERSO', degrees: ['i', 'V7/VII', 'i'], order: 0 }, { name: 'VERSO', degrees: ['iv9'], order: 1 }], isDerived: true, createdAt: 1, updatedAt: 1 });
  (HarmonicTemplateRepository as jest.Mock).mockImplementation(() => ({ findByUserAndId: find, save, update }));
  find.mockResolvedValue(source); save.mockResolvedValue(cloneId.toHexString()); update.mockResolvedValue(source);
});
describe('harmonic template editing contract', () => {
  it('clones owned data with lineage and independent section/degree arrays', async () => {
    const before = JSON.stringify(source);
    const result = await new HarmonicTemplateService().clone('owner', id.toHexString(), { name: 'Variant' });
    expect(find).toHaveBeenCalledWith('owner', id.toHexString());
    expect(result).toMatchObject({ id: cloneId.toHexString(), name: 'Variant', isDerived: true, parentTemplateId: id.toHexString(), sourceSongId: 'song-id', sections: source.sections });
    const inserted = save.mock.calls[0][0] as HarmonicTemplate;
    expect(inserted.sections).not.toBe(source.sections);
    expect(inserted.sections[0].degrees).not.toBe(source.sections[0].degrees);
    inserted.sections[0].degrees.push('iv');
    expect(JSON.stringify(source)).toBe(before);
  });
  it('preserves the current empty-description inheritance and permits clearing tags in clones', async () => {
    const result = await new HarmonicTemplateService().clone('owner', id.toHexString(), { description: '', tags: [] });
    expect(result.description).toBe('Original description'); expect(result.tags).toEqual([]);
  });
  it('edits a derived template without changing lineage or song reference', async () => {
    source.parentTemplateId = 'parent';
    const result = await new HarmonicTemplateService().patch('owner', id.toHexString(), { name: 'Edited', description: '', sections: [{ name: 'VERSO', degrees: ['i', 'i'], order: 0 }, { name: 'VERSO', degrees: ['V7/VII'], order: 1 }] });
    expect(result).toMatchObject({ name: 'Edited', description: '', isDerived: true, parentTemplateId: 'parent', sourceSongId: 'song-id' });
    expect(result.sections).toHaveLength(2); expect(update).toHaveBeenCalledTimes(1);
  });
  it('does not mutate or clone when the scoped repository cannot find the resource', async () => {
    find.mockResolvedValue({}); const service = new HarmonicTemplateService();
    expect(await service.patch('other-user', id.toHexString(), { name: 'Denied' })).toBeNull();
    expect(await service.clone('other-user', id.toHexString())).toBeNull();
    expect(update).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
  });
});
