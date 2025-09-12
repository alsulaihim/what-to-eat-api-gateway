"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const configService = app.get(config_1.ConfigService);
        const port = configService.get('PORT') || 3001;
        const corsOrigin = configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'];
        app.use((0, helmet_1.default)());
        app.use((0, compression_1.default)());
        app.enableCors({
            origin: corsOrigin,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            disableErrorMessages: false,
            validationError: {
                target: false,
                value: false,
            },
        }));
        app.setGlobalPrefix('');
        const config = new swagger_1.DocumentBuilder()
            .setTitle('What to Eat - API Gateway')
            .setDescription('Food recommendation API with social intelligence and AI-powered suggestions')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Authentication', 'User authentication and token management')
            .addTag('User Management', 'User profile and preferences management')
            .addTag('Recommendations', 'Food recommendation engine')
            .addTag('Admin', 'Administrative endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'list',
                filter: true,
                showRequestDuration: true,
            },
        });
        await app.listen(port);
        logger.log(`🚀 API Gateway running on port ${port}`);
        logger.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
        logger.log(`🌍 CORS enabled for: ${corsOrigin.join(', ')}`);
    }
    catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map