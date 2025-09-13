import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApifyController } from './apify.controller';
import { ApifyService } from './apify.service';
import { ApifyClientService } from '../external-apis/apify/apify-client.service';
import { InstagramScraperService } from '../external-apis/apify/instagram-scraper.service';
import { TwitterScraperService } from '../external-apis/apify/twitter-scraper.service';
import { RedditScraperService } from '../external-apis/apify/reddit-scraper.service';
import { TikTokScraperService } from '../external-apis/apify/tiktok-scraper.service';
import { YouTubeScraperService } from '../external-apis/apify/youtube-scraper.service';
import { FacebookScraperService } from '../external-apis/apify/facebook-scraper.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ApifyController],
  providers: [
    ApifyService,
    ApifyClientService,
    InstagramScraperService,
    TwitterScraperService,
    RedditScraperService,
    TikTokScraperService,
    YouTubeScraperService,
    FacebookScraperService,
  ],
  exports: [
    ApifyService,
    ApifyClientService,
    InstagramScraperService,
    TwitterScraperService,
    RedditScraperService,
    TikTokScraperService,
    YouTubeScraperService,
    FacebookScraperService,
  ],
})
export class ApifyModule {}