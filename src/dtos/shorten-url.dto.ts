import { IsUrl } from 'class-validator';

export class ShortenUrlDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsUrl({ require_protocol: true })
  originalUrl!: string;
}
