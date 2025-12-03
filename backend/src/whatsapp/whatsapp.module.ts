import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppApiService } from './whatsapp-api.service';
import { WhatsAppFlowService } from './whatsapp-flow.service';
import { WhatsAppWebhookGuard } from './guards/whatsapp-webhook.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    WhatsAppApiService,
    WhatsAppFlowService,
    WhatsAppWebhookGuard,
  ],
  exports: [
    WhatsAppService,
    WhatsAppApiService,
    WhatsAppFlowService,
  ],
})
export class WhatsAppModule {}
