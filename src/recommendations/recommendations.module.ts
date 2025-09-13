import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RecommendationsController, TestRecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { GooglePlacesService } from '../external-apis/google/places.service';
import { MapsService } from '../external-apis/google/maps.service';
import { TrendsService } from '../external-apis/google/trends.service';
import { ChatGPTService } from '../external-apis/openai/chatgpt.service';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [
    ConfigModule, 
    DatabaseModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RecommendationsController, TestRecommendationsController],
  providers: [
    RecommendationsService,
    GooglePlacesService,
    MapsService,
    TrendsService,
    ChatGPTService,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}