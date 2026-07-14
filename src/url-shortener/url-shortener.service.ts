// src/url/url-shortener.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Url } from 'src/entities/url.entity';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { encodeBase62 } from 'src/utils/base62.util';
import { Repository } from 'typeorm';

const CACHE_PREFIX = 'url:';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 1 day

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url) private readonly urlRepo: Repository<Url>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
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
    const cacheKey = CACHE_PREFIX + shortCode;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // Cache hit — sliding TTL: refresh the expiry since it was just used
      await this.redis.expire(cacheKey, CACHE_TTL_SECONDS);
      return JSON.parse(cached) as Url;
    }
    const url = await this.urlRepo.findOne({ where: { shortCode } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    await this.redis.set(
      cacheKey,
      JSON.stringify(url),
      'EX',
      CACHE_TTL_SECONDS,
    );
    return url;
  }
}
