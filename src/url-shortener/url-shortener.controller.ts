import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { ShortenUrlDto } from 'src/dtos/shorten-url.dto';
import { ShortenUrlResponseDto } from 'src/dtos/shorten-url-response.dto';
import type { Response } from 'express';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlService: UrlShortenerService) {}

  @Post('shorten')
  async shorten(@Body() dto: ShortenUrlDto): Promise<ShortenUrlResponseDto> {
    const url = await this.urlService.shorten(dto.originalUrl);
    return {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
    };
  }

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlService.findByShortCode(code);
    return res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
