# Yemeksepeti Entegrasyon Teknik Tasarım

## 1. Sistem Mimarisi

### 1.1 Genel Mimari
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Company Panel  │  Courier Panel  │  Admin Panel            │
│  - Integration  │  - Order List   │  - Monitoring           │
│    Settings     │  - Order Detail │  - Reports              │
│  - Order List   │                 │                         │
└────────┬────────────────────────────────────────────────────┘
         │ HTTPS/WebSocket
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway Layer                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │ Company  │ │ Orders   │ │Yemeksepeti│      │
│  │  Module  │ │  Module  │ │  Module  │ │  Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Integration  │ │  Scheduler   │ │  WebSocket   │        │
│  │   Service    │ │   Service    │ │   Gateway    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Redis   │ │ BullMQ   │ │  Prisma  │ │  Logger  │      │
│  │   Cache   │ │  Queue   │ │    ORM   │ │ (Winston)│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │ Yemeksepeti  │
│   Database   │     │     API      │
└──────────────┘     └──────────────┘
```

### 1.2 Modül Yapısı

#### Yemeksepeti Modülü
```
backend/src/yemeksepeti/
├── yemeksepeti.module.ts
├── yemeksepeti.controller.ts
├── yemeksepeti.service.ts
├── yemeksepeti.scheduler.ts
├── yemeksepeti.processor.ts
├── constants/
│   ├── yemeksepeti.constants.ts
│   └── status-mapping.ts
├── dto/
│   ├── yemeksepeti-order.dto.ts
│   ├── yemeksepeti-auth.dto.ts
│   └── integration-config.dto.ts
├── entities/
│   ├── company-integration.entity.ts
│   └── external-order.entity.ts
├── mappers/
│   ├── order.mapper.ts
│   └── status.mapper.ts
├── guards/
│   └── yemeksepeti-webhook.guard.ts
├── interceptors/
│   └── yemeksepeti-error.interceptor.ts
└── interfaces/
    ├── yemeksepeti-api.interface.ts
    └── integration.interface.ts
```

## 2. Veri Modeli Tasarımı

### 2.1 Database Schema

```sql
-- CompanyIntegration Tablosu
CREATE TABLE company_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    provider VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT,
    webhook_secret TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(20),
    error_message TEXT,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, provider),
    INDEX idx_provider_active (provider, is_active)
);

-- ExternalOrder Tablosu
CREATE TABLE external_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES company_integrations(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    provider VARCHAR(50) NOT NULL,
    external_order_id VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    payload JSONB NOT NULL,
    mapped_order_id UUID REFERENCES orders(id),
    last_sync_status VARCHAR(20),
    last_sync_at TIMESTAMP,
    sync_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, external_order_id),
    INDEX idx_company_status (company_id, status),
    INDEX idx_mapped_order (mapped_order_id)
);

-- Order Tablosu Güncellemesi
ALTER TABLE orders
ADD COLUMN external_source VARCHAR(50),
ADD COLUMN external_order_id VARCHAR(100) UNIQUE,
ADD COLUMN external_data JSONB,
ADD COLUMN external_status VARCHAR(50),
ADD COLUMN is_external BOOLEAN DEFAULT false,
ADD COLUMN last_external_sync_at TIMESTAMP,
ADD COLUMN sync_error TEXT,
ADD INDEX idx_external_source (external_source, external_order_id),
ADD INDEX idx_company_external (company_id, is_external);
```

### 2.2 Prisma Schema

```prisma
model CompanyIntegration {
  id                String   @id @default(uuid())
  companyId         String
  provider          String
  apiKeyEncrypted   String
  apiSecretEncrypted String?
  webhookSecret     String?
  metadata          Json?    @default("{}")
  isActive          Boolean  @default(true)
  lastSyncedAt      DateTime?
  syncStatus        SyncStatus?
  errorMessage      String?
  errorCount        Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])
  externalOrders ExternalOrder[]

  @@unique([companyId, provider])
  @@index([provider, isActive])
}

model ExternalOrder {
  id                String   @id @default(uuid())
  integrationId     String
  companyId         String
  provider          String
  externalOrderId   String
  status            String
  payload           Json
  mappedOrderId     String?
  lastSyncStatus    SyncStatus?
  lastSyncAt        DateTime?
  syncError         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  integration CompanyIntegration @relation(fields: [integrationId], references: [id])
  company     Company @relation(fields: [companyId], references: [id])
  order       Order?  @relation(fields: [mappedOrderId], references: [id])

  @@unique([provider, externalOrderId])
  @@index([companyId, status])
  @@index([mappedOrderId])
}

enum SyncStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
}

enum IntegrationProvider {
  YEMEKSEPETI
  GETIR
  TRENDYOL
}
```

## 3. API Tasarımı

### 3.1 REST Endpoints

#### Integration Management
```typescript
// Company Integration Endpoints
POST   /api/companies/:companyId/integrations
GET    /api/companies/:companyId/integrations
GET    /api/companies/:companyId/integrations/:provider
PUT    /api/companies/:companyId/integrations/:provider
DELETE /api/companies/:companyId/integrations/:provider
POST   /api/companies/:companyId/integrations/:provider/test
POST   /api/companies/:companyId/integrations/:provider/sync

// Webhook Endpoint
POST   /api/webhooks/yemeksepeti
```

### 3.2 WebSocket Events

```typescript
// Server -> Client Events
interface ServerToClientEvents {
  'external-order-received': (data: ExternalOrderEvent) => void;
  'integration-status-changed': (data: IntegrationStatusEvent) => void;
  'sync-progress': (data: SyncProgressEvent) => void;
  'sync-error': (data: SyncErrorEvent) => void;
}

// Event Payloads
interface ExternalOrderEvent {
  orderId: string;
  externalOrderId: string;
  provider: string;
  companyId: string;
  status: string;
  timestamp: Date;
}

interface IntegrationStatusEvent {
  companyId: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
}
```

### 3.3 DTO Definitions

```typescript
// Integration Config DTO
export class CreateIntegrationDto {
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

// Yemeksepeti Order DTO
export class YemeksepetiOrderDto {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 4. Servis Tasarımları

### 4.1 YemeksepetiApiService

```typescript
@Injectable()
export class YemeksepetiApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  // API Authentication
  async authenticate(apiKey: string, apiSecret?: string): Promise<string> {
    // Implementation
  }

  // Get Orders
  async getOrders(
    token: string,
    params: GetOrdersParams
  ): Promise<YemeksepetiOrder[]> {
    // Implementation with retry logic
  }

  // Update Order Status
  async updateOrderStatus(
    token: string,
    orderId: string,
    status: string
  ): Promise<void> {
    // Implementation
  }

  // Test Connection
  async testConnection(apiKey: string): Promise<boolean> {
    // Implementation
  }
}
```

### 4.2 IntegrationSyncService

```typescript
@Injectable()
export class IntegrationSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly yemeksepetiApi: YemeksepetiApiService,
    private readonly orderMapper: OrderMapperService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Sync Orders for Company
  async syncOrders(companyId: string): Promise<SyncResult> {
    // 1. Get integration config
    // 2. Fetch orders from API
    // 3. Map and save orders
    // 4. Emit events
    // 5. Update sync status
  }

  // Process Single Order
  async processExternalOrder(
    externalOrder: YemeksepetiOrderDto,
    integration: CompanyIntegration
  ): Promise<Order> {
    // 1. Check for duplicates
    // 2. Map to internal format
    // 3. Create/update order
    // 4. Emit notifications
  }
}
```

### 4.3 Scheduler Service

```typescript
@Injectable()
export class YemeksepetiSchedulerService {
  constructor(
    private readonly syncService: IntegrationSyncService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('*/30 * * * * *') // Every 30 seconds
  async handleCron() {
    const activeIntegrations = await this.getActiveIntegrations();

    for (const integration of activeIntegrations) {
      await this.syncIntegration(integration);
    }
  }

  private async syncIntegration(integration: CompanyIntegration) {
    try {
      await this.syncService.syncOrders(integration.companyId);
    } catch (error) {
      await this.handleSyncError(integration, error);
    }
  }
}
```

## 5. Queue ve Event Sistemi

### 5.1 BullMQ Queue Configuration

```typescript
// Queue Names
export enum QueueName {
  YEMEKSEPETI_SYNC = 'yemeksepeti-sync',
  ORDER_PROCESSING = 'order-processing',
  NOTIFICATION = 'notification',
}

// Queue Jobs
export interface YemeksepetiSyncJob {
  companyId: string;
  integrationId: string;
  priority?: number;
}

// Queue Processor
@Processor(QueueName.YEMEKSEPETI_SYNC)
export class YemeksepetiSyncProcessor {
  @Process()
  async process(job: Job<YemeksepetiSyncJob>) {
    // Process sync job
  }
}
```

### 5.2 Event-Driven Architecture

```typescript
// Event Names
export enum IntegrationEvent {
  ORDER_RECEIVED = 'integration.order.received',
  SYNC_STARTED = 'integration.sync.started',
  SYNC_COMPLETED = 'integration.sync.completed',
  SYNC_FAILED = 'integration.sync.failed',
  CONNECTION_ESTABLISHED = 'integration.connection.established',
  CONNECTION_LOST = 'integration.connection.lost',
}

// Event Handlers
@Injectable()
export class IntegrationEventHandler {
  @OnEvent(IntegrationEvent.ORDER_RECEIVED)
  async handleOrderReceived(payload: ExternalOrderEvent) {
    // Send notifications
    // Update dashboards
    // Trigger workflows
  }
}
```

## 6. Güvenlik Tasarımı

### 6.1 API Key Encryption

```typescript
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(data: EncryptedData): string {
    // Decryption implementation
  }
}
```

### 6.2 Webhook Security

```typescript
@Injectable()
export class YemeksepetiWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-yemeksepeti-signature'];

    if (!signature) return false;

    const payload = JSON.stringify(request.body);
    const expectedSignature = this.calculateHmac(payload);

    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private calculateHmac(payload: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }
}
```

## 7. Error Handling ve Retry Logic

### 7.1 Circuit Breaker Pattern

```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = new Date();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 7.2 Retry Strategy

```typescript
export class RetryStrategy {
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 2,
      maxDelay = 30000,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) break;

        const waitTime = Math.min(
          delay * Math.pow(backoff, attempt - 1),
          maxDelay
        );

        await this.sleep(waitTime);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 8. Monitoring ve Logging

### 8.1 Metrics Collection

```typescript
// Prometheus Metrics
export class IntegrationMetrics {
  private readonly syncCounter = new Counter({
    name: 'yemeksepeti_sync_total',
    help: 'Total number of sync operations',
    labelNames: ['company_id', 'status'],
  });

  private readonly syncDuration = new Histogram({
    name: 'yemeksepeti_sync_duration_seconds',
    help: 'Duration of sync operations',
    labelNames: ['company_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  });

  private readonly orderCounter = new Counter({
    name: 'yemeksepeti_orders_total',
    help: 'Total number of orders processed',
    labelNames: ['company_id', 'status'],
  });
}
```

### 8.2 Logging Strategy

```typescript
// Winston Logger Configuration
export const loggerConfig = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/yemeksepeti-error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/yemeksepeti-combined.log',
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
};

// Structured Logging
export class IntegrationLogger {
  log(level: string, message: string, meta?: any) {
    this.logger.log(level, message, {
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'yemeksepeti-integration',
      correlationId: this.getCorrelationId(),
    });
  }
}
```

## 9. Frontend Tasarımı

### 9.1 Component Hierarchy

```
├── IntegrationSettings/
│   ├── IntegrationForm.tsx
│   ├── ConnectionStatus.tsx
│   ├── TestConnection.tsx
│   └── SyncHistory.tsx
├── OrderList/
│   ├── ExternalOrderBadge.tsx
│   ├── OrderFilters.tsx
│   └── OrderActions.tsx
├── CourierAssignment/
│   ├── ExternalOrderSelector.tsx
│   ├── AutoFillForm.tsx
│   └── AssignmentModal.tsx
└── Dashboard/
    ├── IntegrationMetrics.tsx
    ├── SyncStatus.tsx
    └── ErrorLog.tsx
```

### 9.2 State Management

```typescript
// Zustand Store
export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: [],
  activeIntegration: null,
  syncStatus: 'idle',
  lastSyncTime: null,
  errors: [],

  // Actions
  fetchIntegrations: async (companyId: string) => {
    // Implementation
  },

  createIntegration: async (data: CreateIntegrationDto) => {
    // Implementation
  },

  testConnection: async (provider: string) => {
    // Implementation
  },

  triggerSync: async () => {
    // Implementation
  },
}));
```

### 9.3 Real-time Updates

```typescript
// Socket Context
export const useIntegrationSocket = () => {
  const { socket } = useSocket();
  const updateOrder = useOrderStore((state) => state.updateOrder);

  useEffect(() => {
    if (!socket) return;

    socket.on('external-order-received', (data) => {
      // Handle new external order
      updateOrder(data);
      toast.success(`Yeni Yemeksepeti siparişi: ${data.orderNumber}`);
    });

    socket.on('sync-progress', (data) => {
      // Update sync progress UI
    });

    return () => {
      socket.off('external-order-received');
      socket.off('sync-progress');
    };
  }, [socket]);
};
```

## 10. Deployment Architecture

### 10.1 Infrastructure

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - INTEGRATION_ENCRYPTION_KEY=${INTEGRATION_ENCRYPTION_KEY}
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  bull-board:
    image: deadly0/bull-board
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
```

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Yemeksepeti Integration

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

## 11. Performance Considerations

### 11.1 Database Optimization

```sql
-- Indexes for Performance
CREATE INDEX idx_external_orders_sync
ON external_orders(company_id, last_sync_status, created_at DESC);

CREATE INDEX idx_orders_external_lookup
ON orders(external_source, external_order_id)
WHERE external_source IS NOT NULL;

-- Partitioning for Large Tables
CREATE TABLE external_orders_2024_q1 PARTITION OF external_orders
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### 11.2 Caching Strategy

```typescript
// Redis Caching
export class IntegrationCacheService {
  private readonly TTL = 300; // 5 minutes

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>
  ): Promise<T> {
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const value = await factory();
    await this.redis.setex(key, this.TTL, JSON.stringify(value));

    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// yemeksepeti.service.spec.ts
describe('YemeksepetiService', () => {
  let service: YemeksepetiService;
  let httpService: HttpService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YemeksepetiService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: CryptoService,
          useValue: createMock<CryptoService>(),
        },
      ],
    }).compile();

    service = module.get<YemeksepetiService>(YemeksepetiService);
  });

  describe('getOrders', () => {
    it('should fetch and return orders', async () => {
      // Test implementation
    });

    it('should handle API errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### 12.2 Integration Tests

```typescript
// integration.e2e-spec.ts
describe('Yemeksepeti Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  describe('POST /companies/:id/integrations', () => {
    it('should create integration with encrypted API key', async () => {
      // Test implementation
    });
  });

  describe('Sync Flow', () => {
    it('should sync orders from Yemeksepeti', async () => {
      // Test implementation
    });
  });
});
```

## 13. Migration Plan

### 13.1 Database Migrations

```bash
# Migration commands
npx prisma migrate dev --name add_yemeksepeti_integration
npx prisma generate
npx prisma db seed
```

### 13.2 Data Migration Script

```typescript
// scripts/migrate-external-orders.ts
async function migrateExternalOrders() {
  const prisma = new PrismaClient();

  try {
    // 1. Create default integrations for existing companies
    const companies = await prisma.company.findMany();

    for (const company of companies) {
      await prisma.companyIntegration.create({
        data: {
          companyId: company.id,
          provider: 'YEMEKSEPETI',
          apiKeyEncrypted: '',
          isActive: false,
        },
      });
    }

    // 2. Migrate existing orders if needed
    // Implementation

  } finally {
    await prisma.$disconnect();
  }
}
```