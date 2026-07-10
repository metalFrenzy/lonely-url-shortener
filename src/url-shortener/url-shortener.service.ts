// src/url/url-shortener.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from 'src/entities/url.entity';
import { encodeBase62 } from 'src/utils/base62.util';
import { Repository } from 'typeorm';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url) private readonly urlRepo: Repository<Url>,
  ) {}

  async shorten(originalUrl: string): Promise<Url> {
    // Grab the next id from Postgres's own sequence, atomically,
    // WITHOUT inserting a row yet.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.urlRepo.query(
      `SELECT nextval('urls_id_seq') AS id`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nextId = Number(result[0].id);

    const shortCode = encodeBase62(nextId);

    // Now insert once, with id and shortCode already known.
    const url = this.urlRepo.create({
      id: String(nextId), // matches the string type on the entity
      shortCode,
      originalUrl,
    });

    return this.urlRepo.save(url);
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const url = await this.urlRepo.findOne({ where: { shortCode } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    return url;
  }
}
