import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Test Service
import { TestIntelligenceService } from './test-intelligence.service';
import { DemographicIntelligenceSimpleService } from './demographic-intelligence-simple.service';
import { DemographicIntelligenceSimpleController } from './demographic-intelligence-simple.controller';

// Simplified External API Services
import { ExternalWeatherSimpleService } from './external-weather-simple.service';
import { ExternalNewsSimpleService } from './external-news-simple.service';
import { ExternalEventsSimpleService } from './external-events-simple.service';

// External API Services
import { OpenWeatherService } from '../external-apis/weather/openweather.service';
import { NewsApiService } from '../external-apis/news/newsapi.service';
import { EventbriteService } from '../external-apis/events/eventbrite.service';
import { FederalReserveService } from '../external-apis/government/fed.service';
import { CdcService } from '../external-apis/government/cdc.service';

// Common Services
import { DatabaseModule } from '../common/database/database.module';
import { FirebaseModule } from '../common/firebase/firebase.module';
import { ApifyModule } from '../apify/apify.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 second timeout for external API calls
      maxRedirects: 3,
    }),
    ConfigModule,
    DatabaseModule,
    FirebaseModule,
    ApifyModule,
  ],
  controllers: [DemographicIntelligenceSimpleController],
  providers: [
    // Test Service
    TestIntelligenceService,
    DemographicIntelligenceSimpleService,
    // Simplified External API Services
    ExternalWeatherSimpleService,
    ExternalNewsSimpleService,
    ExternalEventsSimpleService,
  ],
  exports: [
    // Export test service
    TestIntelligenceService,
    DemographicIntelligenceSimpleService,
    // Export simplified external API services
    ExternalWeatherSimpleService,
    ExternalNewsSimpleService,
    ExternalEventsSimpleService,
  ],
})
export class IntelligenceModule {}