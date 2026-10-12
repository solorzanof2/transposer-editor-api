import { ObjectId } from 'mongodb';
import { SongRepository } from '../../adapters/persistence/SongRepository';
import { CreateSongRequestDTO, PatchSongRequestDTO, SongDTO, UpdateSongRequestDTO } from '../contracts/datatransfers/SongDTO';
import { Song } from '../domain/Song';
import { useReject, useResolve } from '../helpers/functions/Promises';


export class SongService {

  private songRepository: SongRepository = new SongRepository();

  constructor() { }

  async listByUser(userId: string): Promise<SongDTO[]> {
    try {
      const songs = await this.songRepository.findByUser(userId);
      return useResolve(songs.map((song) => this.toDTO(song)));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async getById(userId: string, songId: string): Promise<SongDTO | null> {
    try {
      const song = await this.songRepository.findByUserAndId(userId, songId);

      if (!song?._id) {
        return useResolve(null);
      }

      return useResolve(this.toDTO(song));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async create(userId: string, payload: CreateSongRequestDTO): Promise<SongDTO> {
    try {
      const now = Date.now();
      const song = new Song();

      song.userId = userId;
      song.title = payload.title;
      song.artist = payload.artist;
      song.source = payload.source;
      song.originalKey = payload.originalKey;
      song.lastTargetKey = payload.lastTargetKey;
      song.enharmonicPreference = payload.enharmonicPreference || 'auto';
      song.createdAt = now;
      song.updatedAt = now;

      const id = await this.songRepository.save(song);
      song._id = new ObjectId(id);

      return useResolve(this.toDTO(song));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async replace(userId: string, songId: string, payload: UpdateSongRequestDTO): Promise<SongDTO | null> {
    try {
      const song = await this.songRepository.findByUserAndId(userId, songId);

      if (!song?._id) {
        return useResolve(null);
      }

      song.title = payload.title;
      song.artist = payload.artist;
      song.source = payload.source;
      song.originalKey = payload.originalKey;
      song.lastTargetKey = payload.lastTargetKey;
      song.enharmonicPreference = payload.enharmonicPreference || 'auto';
      song.updatedAt = Date.now();

      await this.songRepository.update(song);

      return useResolve(this.toDTO(song));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async patch(userId: string, songId: string, payload: PatchSongRequestDTO): Promise<SongDTO | null> {
    try {
      const song = await this.songRepository.findByUserAndId(userId, songId);

      if (!song?._id) {
        return useResolve(null);
      }

      if (payload.title !== undefined) song.title = payload.title;
      if (payload.artist !== undefined) song.artist = payload.artist;
      if (payload.source !== undefined) song.source = payload.source;
      if (payload.originalKey !== undefined) song.originalKey = payload.originalKey;
      if (payload.lastTargetKey !== undefined) song.lastTargetKey = payload.lastTargetKey;
      if (payload.enharmonicPreference !== undefined) song.enharmonicPreference = payload.enharmonicPreference;

      song.updatedAt = Date.now();

      await this.songRepository.update(song);

      return useResolve(this.toDTO(song));
    }
    catch (error) {
      return useReject(error);
    }
  }

  async delete(userId: string, songId: string): Promise<boolean> {
    try {
      const song = await this.songRepository.findByUserAndId(userId, songId);

      if (!song?._id) {
        return useResolve(false);
      }

      await this.songRepository.deleteByUserAndId(userId, songId);

      return useResolve(true);
    }
    catch (error) {
      return useReject(error);
    }
  }

  private toDTO(song: Song): SongDTO {
    return {
      id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      source: song.source,
      originalKey: song.originalKey,
      lastTargetKey: song.lastTargetKey,
      enharmonicPreference: song.enharmonicPreference,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };
  }

}
