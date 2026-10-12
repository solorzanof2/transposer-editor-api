import { ObjectId } from 'mongodb';
import { Partition } from '../../core/commons/constants/Partitions';
import { Song } from '../../core/domain/Song';
import { MongoRepository } from '../../deepcore/infrastructure/persistence/MongoRepository';


export class SongRepository extends MongoRepository<Song> {

  constructor() {
    super(Partition.Songs);
  }

  async findByUser(userId: string): Promise<Song[]> {
    return this.findAllByFilter({ userId });
  }

  async findByUserAndId(userId: string, songId: string): Promise<Song> {
    if (!ObjectId.isValid(songId)) {
      return Promise.resolve({} as Song);
    }

    return this.findOneByFilter({
      _id: new ObjectId(songId),
      userId,
    });
  }

  async deleteByUserAndId(userId: string, songId: string): Promise<void> {
    if (!ObjectId.isValid(songId)) {
      return Promise.reject(new Error('invalid_song_id'));
    }

    return this.deleteByFilter({
      _id: new ObjectId(songId),
      userId,
    });
  }

}
