import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlShortenerModule } from './url-shortener/url-shortener.module';
import { UrlService } from './url/url.service';

@Module({
  imports: [UrlShortenerModule],
  controllers: [AppController],
  providers: [AppService, UrlService],
})
export class AppModule {}
