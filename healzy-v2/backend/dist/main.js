"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT', 3001);
    const clientUrl = config.get('CLIENT_URL', 'http://localhost:3000');
    app.enableCors({
        origin: [clientUrl, 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    });
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Healzy API')
        .setDescription('Healthcare platform REST API')
        .setVersion('2.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(port);
    common_1.Logger.log(`🚀 Healzy API running on http://localhost:${port}`, 'Bootstrap');
    common_1.Logger.log(`📚 Swagger docs at http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map