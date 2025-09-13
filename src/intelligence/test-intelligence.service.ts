import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestIntelligenceService {
  private readonly logger = new Logger(TestIntelligenceService.name);

  constructor() {}

  async testMethod(): Promise<string> {
    return 'Test service working';
  }
}