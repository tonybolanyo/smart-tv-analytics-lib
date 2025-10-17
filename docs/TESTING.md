# Guía de testing - Smart TV Analytics

## Índice

- [Visión general](#visión-general)
- [Tests unitarios](#tests-unitarios)
- [Tests de integración](#tests-de-integración)
- [Tests End-to-End (E2E)](#tests-end-to-end-e2e)
- [Configuración de testing](#configuración-de-testing)
- [Cobertura de código](#cobertura-de-código)
- [Automatización y CI/CD](#automatización-y-cicd)
- [Buenas prácticas](#buenas-prácticas)

## Visión general

Smart TV Analytics incluye una suite completa de testing que garantiza la calidad y confiabilidad de la librería en diferentes niveles:

### Estructura de testing

```
testing/
├── unit/                    # Tests unitarios (Jasmine + Karma)
│   ├── services/            # Tests de servicios
│   ├── models/              # Tests de interfaces y tipos
│   └── configurations/      # Tests de configuraciones
├── integration/             # Tests de integración
│   ├── module-integration/  # Tests del módulo completo
│   └── service-interaction/ # Interacción entre servicios
└── e2e/                     # Tests end-to-end (Playwright)
    ├── analytics/           # Tests de analytics
    ├── navigation/          # Tests de navegación
    └── video-tracking/      # Tests de tracking de video
```

### Niveles de testing

| Nivel | Herramienta | Cobertura | Propósito |
|-------|-------------|-----------|-----------|
| **Unit** | Jasmine + Karma | 85%+ | Lógica individual de servicios |
| **Integration** | Angular Testing | 70%+ | Interacción entre componentes |
| **E2E** | Playwright | Funcionalidad completa | Flujos de usuario completos |

## Tests unitarios

### Configuración de Karma

```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false // Para tests determinísticos
      },
      clearContext: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/smart-tv-analytics'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 85,
          branches: 70,
          functions: 85,
          lines: 85
        }
      }
    },
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-web-security']
      }
    },
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

### Comandos de testing

```bash
# Ejecutar todos los tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests para CI (headless)
npm run test:ci

# Tests de un archivo específico
npm run test -- --include='**/smart-tv-analytics.service.spec.ts'
```

### Ejemplo: Test del servicio principal

```typescript
// smart-tv-analytics.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SmartTVAnalyticsService } from './smart-tv-analytics.service';
import { EventBatchingService } from './event-batching.service';
import { SessionService } from './session.service';
import { DeviceInfoService } from './device-info.service';
import { StorageService } from './storage.service';
import { SMART_TV_ANALYTICS_CONFIG } from '../models/tokens';
import { SmartTVAnalyticsConfig } from '../models/config.interface';

describe('SmartTVAnalyticsService', () => {
  let service: SmartTVAnalyticsService;
  let mockEventBatching: jasmine.SpyObj<EventBatchingService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockDeviceInfo: jasmine.SpyObj<DeviceInfoService>;
  let mockStorage: jasmine.SpyObj<StorageService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockConfig: SmartTVAnalyticsConfig = {
    measurementId: 'G-TEST123',
    apiSecret: 'test-secret',
    appName: 'TestApp',
    appVersion: '1.0.0',
    enableDebugMode: true,
    batchSize: 5,
    flushInterval: 10000
  };

  beforeEach(() => {
    // Crear spies para todas las dependencias
    const eventBatchingSpy = jasmine.createSpyObj('EventBatchingService', [
      'initialize', 'addEvent', 'flush', 'getQueueSize'
    ]);
    const sessionSpy = jasmine.createSpyObj('SessionService', [
      'initialize', 'startSession', 'getSessionInfo'
    ]);
    const deviceInfoSpy = jasmine.createSpyObj('DeviceInfoService', [
      'getDeviceInfo', 'getPlatform'
    ]);
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getItem', 'setItem', 'removeItem'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(1, '/test', '/test'))
    });

    TestBed.configureTestingModule({
      providers: [
        SmartTVAnalyticsService,
        { provide: EventBatchingService, useValue: eventBatchingSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: DeviceInfoService, useValue: deviceInfoSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SMART_TV_ANALYTICS_CONFIG, useValue: mockConfig }
      ]
    });

    service = TestBed.inject(SmartTVAnalyticsService);
    mockEventBatching = TestBed.inject(EventBatchingService) as jasmine.SpyObj<EventBatchingService>;
    mockSessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    mockDeviceInfo = TestBed.inject(DeviceInfoService) as jasmine.SpyObj<DeviceInfoService>;
    mockStorage = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with provided config', () => {
      service.initialize(mockConfig);

      expect(mockEventBatching.initialize).toHaveBeenCalledWith(mockConfig);
      expect(mockSessionService.initialize).toHaveBeenCalled();
    });

    it('should throw error with invalid config', () => {
      const invalidConfig = { ...mockConfig, measurementId: '' };

      expect(() => service.initialize(invalidConfig))
        .toThrowError('Invalid measurement ID');
    });
  });

  describe('Event Logging', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should log events with valid parameters', async () => {
      const eventName = 'test_event';
      const params = { param1: 'value1', param2: 123 };

      await service.logEvent(eventName, params);

      expect(mockEventBatching.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: eventName,
          params: jasmine.objectContaining(params)
        })
      );
    });

    it('should validate event names', async () => {
      const invalidEventName = 'invalid-event-name!';

      spyOn(console, 'warn');
      await service.logEvent(invalidEventName);

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/Invalid event name/)
      );
    });

    it('should enrich events with metadata', async () => {
      mockDeviceInfo.getPlatform.and.returnValue('tizen');
      mockSessionService.getSessionInfo.and.returnValue({
        sessionId: 'session123',
        startTime: Date.now(),
        lastActivityTime: Date.now(),
        engagementTime: 0,
        isFirstSession: true
      });

      await service.logEvent('test_event');

      expect(mockEventBatching.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          params: jasmine.objectContaining({
            platform: 'tizen',
            session_id: 'session123'
          })
        })
      );
    });

    it('should handle event logging errors gracefully', async () => {
      mockEventBatching.addEvent.and.throwError('Network error');
      spyOn(console, 'error');

      await service.logEvent('test_event');

      expect(console.error).toHaveBeenCalled();
      // El servicio debe continuar funcionando
      expect(service).toBeTruthy();
    });
  });

  describe('User Properties', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should set user properties', () => {
      const properties = { user_type: 'premium', platform: 'tizen' };

      service.setUserProperties(properties);

      // Verificar que las propiedades se almacenan
      expect(service.getUserProperties()).toEqual(properties);
    });

    it('should set user ID', () => {
      const userId = 'user123';

      service.setUserId(userId);

      expect(service.getUserId()).toBe(userId);
    });
  });

  describe('Collection Control', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should enable/disable collection', async () => {
      service.enableCollection(false);
      spyOn(console, 'log');

      await service.logEvent('test_event');

      expect(mockEventBatching.addEvent).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/Collection disabled/)
      );
    });
  });

  describe('Automatic Events', () => {
    it('should track page views on navigation', () => {
      service.initialize({ ...mockConfig, enablePageViewTracking: true });

      // Simular navegación
      const navigationEvent = new NavigationEnd(1, '/new-page', '/new-page');
      (mockRouter.events as any).next(navigationEvent);

      expect(mockEventBatching.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'page_view',
          params: jasmine.objectContaining({
            page_location: '/new-page'
          })
        })
      );
    });
  });
});
```

### Ejemplo: Test de EventBatchingService

```typescript
// event-batching.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventBatchingService } from './event-batching.service';
import { StorageService } from './storage.service';
import { SmartTVAnalyticsConfig, AnalyticsEvent } from '../models/config.interface';

describe('EventBatchingService', () => {
  let service: EventBatchingService;
  let httpMock: HttpTestingController;
  let mockStorage: jasmine.SpyObj<StorageService>;

  const mockConfig: SmartTVAnalyticsConfig = {
    measurementId: 'G-TEST123',
    apiSecret: 'test-secret',
    appName: 'TestApp',
    appVersion: '1.0.0',
    batchSize: 3,
    flushInterval: 5000,
    requestTimeout: 10000
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getItem', 'setItem', 'removeItem'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EventBatchingService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(EventBatchingService);
    httpMock = TestBed.inject(HttpTestingController);
    mockStorage = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Initialization', () => {
    it('should initialize with config', () => {
      service.initialize(mockConfig);
      expect(service.getConfig()).toEqual(mockConfig);
    });
  });

  describe('Event Batching', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should add events to queue', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        params: { param1: 'value1' }
      };

      service.addEvent(event);

      expect(service.getQueueSize()).toBe(1);
    });

    it('should auto-flush when batch size is reached', () => {
      spyOn(service, 'flush').and.returnValue(Promise.resolve());

      // Agregar eventos hasta alcanzar el batch size
      for (let i = 0; i < mockConfig.batchSize!; i++) {
        service.addEvent({
          name: `event_${i}`,
          params: { index: i }
        });
      }

      expect(service.flush).toHaveBeenCalled();
    });

    it('should flush events via HTTP', async () => {
      const events: AnalyticsEvent[] = [
        { name: 'event1', params: { param: 'value1' } },
        { name: 'event2', params: { param: 'value2' } }
      ];

      events.forEach(event => service.addEvent(event));

      const flushPromise = service.flush();

      // Verificar que se hace el request HTTP correcto
      const req = httpMock.expectOne(req => 
        req.url.includes('google-analytics.com/mp/collect') &&
        req.method === 'POST'
      );

      expect(req.request.body).toEqual(
        jasmine.objectContaining({
          client_id: jasmine.any(String),
          events: jasmine.arrayContaining([
            jasmine.objectContaining({ name: 'event1' }),
            jasmine.objectContaining({ name: 'event2' })
          ])
        })
      );

      req.flush({}); // Simular respuesta exitosa
      await flushPromise;

      expect(service.getQueueSize()).toBe(0);
    });

    it('should handle HTTP errors with retry', async () => {
      const event: AnalyticsEvent = { name: 'test_event' };
      service.addEvent(event);

      const flushPromise = service.flush();

      // Primer intento falla
      const req1 = httpMock.expectOne(req => req.url.includes('mp/collect'));
      req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Segundo intento (retry)
      const req2 = httpMock.expectOne(req => req.url.includes('mp/collect'));
      req2.flush({});

      await flushPromise;
      expect(service.getQueueSize()).toBe(0);
    });
  });

  describe('Timer-based Flushing', () => {
    beforeEach(() => {
      jasmine.clock().install();
      service.initialize(mockConfig);
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should flush events after interval', () => {
      spyOn(service, 'flush').and.returnValue(Promise.resolve());

      service.addEvent({ name: 'test_event' });

      // Avanzar el tiempo
      jasmine.clock().tick(mockConfig.flushInterval! + 1000);

      expect(service.flush).toHaveBeenCalled();
    });
  });
});
```

## Tests de integración

### Configuración de tests de integración

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SmartTVAnalyticsModule } from '../lib/smart-tv-analytics.module';
import { SmartTVAnalyticsConfig } from '../lib/models/config.interface';

export function setupIntegrationTest(config?: Partial<SmartTVAnalyticsConfig>) {
  const defaultConfig: SmartTVAnalyticsConfig = {
    measurementId: 'G-TEST123',
    apiSecret: 'test-secret',
    appName: 'TestApp',
    appVersion: '1.0.0',
    enableDebugMode: true,
    mockMode: true,
    ...config
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SmartTVAnalyticsModule.forRoot(defaultConfig)
      ]
    });
  });

  return TestBed;
}
```

### Ejemplo: Test de integración del módulo

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SmartTVAnalyticsService } from '../lib/services/smart-tv-analytics.service';
import { setupIntegrationTest } from './integration-test-setup';

@Component({
  template: '<div>Test Component</div>'
})
class TestComponent {
  constructor(private analytics: SmartTVAnalyticsService) {}

  trackEvent() {
    this.analytics.logEvent('test_event', { source: 'component' });
  }
}

describe('SmartTVAnalytics Module Integration', () => {
  setupIntegrationTest();

  it('should provide SmartTVAnalyticsService', () => {
    const service = TestBed.inject(SmartTVAnalyticsService);
    expect(service).toBeTruthy();
  });

  it('should allow components to log events', () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent]
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    spyOn(console, 'log'); // Para capturar logs en mock mode

    component.trackEvent();

    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringMatching(/test_event/)
    );
  });

  it('should track navigation events automatically', () => {
    const router = TestBed.inject(Router);
    const analytics = TestBed.inject(SmartTVAnalyticsService);

    spyOn(analytics, 'logEvent');

    // Simular navegación
    router.navigate(['/test-route']);

    expect(analytics.logEvent).toHaveBeenCalledWith(
      'page_view',
      jasmine.objectContaining({
        page_location: '/test-route'
      })
    );
  });
});
```

## Tests End-to-End (E2E)

### Configuración de Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'tizen-simulation',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36'
      }
    },
    {
      name: 'webos-simulation',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36'
      }
    }
  ],

  webServer: {
    command: 'npm run start',
    port: 4200,
    reuseExistingServer: !process.env.CI
  }
});
```

### Comandos E2E

```bash
# Ejecutar todos los tests E2E
npm run e2e

# Tests en modo headed (con UI)
npm run e2e:headed

# Tests con UI interactiva
npm run e2e:ui

# Tests en modo debug
npm run e2e:debug

# Generar y ver reporte
npm run e2e:report

# Tests específicos
npm run e2e -- analytics.spec.ts

# Tests en navegador específico
npm run e2e -- --project=tizen-simulation
```

### Ejemplo: Test E2E de Analytics

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Analytics Integration', () => {
  let consoleLogs: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capturar logs de consola para verificar eventos analytics
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[Analytics]')) {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/');
  });

  test('should track page view on navigation', async ({ page }) => {
    // Navegar a página de movies
    await page.click('[data-testid="nav-movies"]');
    await page.waitForURL('**/movies');

    // Verificar que se registró el page view
    expect(consoleLogs.some(log => 
      log.includes('page_view') && log.includes('/movies')
    )).toBeTruthy();
  });

  test('should track video play events', async ({ page }) => {
    await page.goto('/video/sample-video');
    
    // Reproducir video
    await page.click('[data-testid="play-button"]');
    
    // Verificar evento de video play
    expect(consoleLogs.some(log => 
      log.includes('video_play') && log.includes('sample-video')
    )).toBeTruthy();
  });

  test('should track user interactions', async ({ page }) => {
    // Buscar contenido
    await page.fill('[data-testid="search-input"]', 'action movies');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verificar evento de búsqueda
    expect(consoleLogs.some(log => 
      log.includes('search_performed') && log.includes('action movies')
    )).toBeTruthy();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simular fallo de red
    await page.route('**/google-analytics.com/**', route => 
      route.abort('connectionrefused')
    );

    // Realizar acción que genere eventos
    await page.click('[data-testid="nav-series"]');

    // Verificar que la app sigue funcionando
    await expect(page.getByTestId('series-page')).toBeVisible();
    
    // Verificar logs de retry
    expect(consoleLogs.some(log => 
      log.includes('retry') || log.includes('failed')
    )).toBeTruthy();
  });
});
```

### Test E2E de video player

```typescript
import { test, expect } from '@playwright/test';

test.describe('Video Player Analytics', () => {
  test('should track complete video playback session', async ({ page }) => {
    const analyticsEvents: any[] = [];

    // Interceptar requests de analytics
    await page.route('**/mp/collect', async route => {
      const postData = route.request().postDataJSON();
      analyticsEvents.push(...postData.events);
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/video/sample-video');

    // Secuencia completa de reproducción
    await page.click('[data-testid="play-button"]');
    await page.waitForTimeout(5000); // Simular reproducción
    
    await page.click('[data-testid="pause-button"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="seek-forward"]');
    await page.click('[data-testid="play-button"]');
    await page.waitForTimeout(2000);
    
    await page.click('[data-testid="complete-button"]'); // Simular completar

    // Verificar eventos generados
    const eventNames = analyticsEvents.map(e => e.name);
    expect(eventNames).toContain('video_play');
    expect(eventNames).toContain('video_pause');
    expect(eventNames).toContain('video_seek_button');
    expect(eventNames).toContain('video_complete');

    // Verificar parámetros del evento
    const playEvent = analyticsEvents.find(e => e.name === 'video_play');
    expect(playEvent.params).toMatchObject({
      video_id: 'sample-video',
      content_type: expect.any(String)
    });
  });
});
```

## Configuración de testing

### Jest (alternativa a Karma)

```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|ts)',
    '<rootDir>/src/**/?(*.)(spec|test).(js|ts)'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/test.ts'
  ],
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 70,
      functions: 85,
      lines: 85
    }
  },
  testEnvironment: 'jsdom'
};
```

### Utilidades para los tests

```typescript
import { SmartTVAnalyticsConfig } from '../lib/models/config.interface';

export const createMockConfig = (
  overrides: Partial<SmartTVAnalyticsConfig> = {}
): SmartTVAnalyticsConfig => ({
  measurementId: 'G-TEST123',
  apiSecret: 'test-secret',
  appName: 'TestApp',
  appVersion: '1.0.0',
  enableDebugMode: true,
  mockMode: true,
  batchSize: 5,
  flushInterval: 10000,
  ...overrides
});

export const createMockEvent = (name: string, params: any = {}) => ({
  name,
  params: {
    timestamp: Date.now(),
    ...params
  }
});

export const waitForAsyncOperation = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

export class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}
```

## Cobertura de código

### Configuración de cobertura

```json
// Configuración en package.json
{
  "scripts": {
    "test:coverage": "ng test --code-coverage --watch=false",
    "test:coverage:ci": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "coverage:report": "open coverage/smart-tv-analytics/index.html",
    "coverage:check": "nyc check-coverage --statements 85 --branches 70 --functions 85 --lines 85"
  }
}
```

### Objetivos de cobertura

| Componente | Statements | Branches | Functions | Lines |
|------------|------------|----------|-----------|-------|
| Services | 90%+ | 80%+ | 90%+ | 90%+ |
| Models | 95%+ | 85%+ | 95%+ | 95%+ |
| Utils | 85%+ | 70%+ | 85%+ | 85%+ |
| **Global** | **85%+** | **70%+** | **85%+** | **85%+** |

### Análisis de cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte HTML
npm run coverage:report

# Verificar umbrales
npm run coverage:check

# Cobertura por archivo
npx nyc report --reporter=text-summary
```

## Automatización y CI/CD

### Scripts de testing automatizado

```bash
#!/bin/bash
# scripts/run-all-tests.sh

set -e

echo "Running Smart TV Analytics Test Suite"

# Unit tests
echo "Running unit tests..."
npm run test:ci

# Integration tests
echo "Running integration tests..."
npm run test:integration

# Build library
echo "Building library..."
npm run build

# E2E tests
echo "Running E2E tests..."
cd examples/sample-app
npm run e2e

echo "All tests passed!"
```

## Buenas prácticas

### 1. Estructura de tests

```typescript
describe('FeatureName', () => {
  describe('Scenario', () => {
    describe('Given precondition', () => {
      it('should do something when action is performed', () => {
        // Arrange
        const input = createTestData();
        
        // Act
        const result = performAction(input);
        
        // Assert
        expect(result).toEqual(expectedOutput);
      });
    });
  });
});
```

### 2. Estrategia de mocks

```typescript
// Mock solo lo necesario
const mockService = jasmine.createSpyObj('Service', ['method1', 'method2']);

// Usar datos reales cuando sea posible
const realConfig = createMockConfig(); // Función helper

// Mock timers para tests determinísticos
beforeEach(() => jasmine.clock().install());
afterEach(() => jasmine.clock().uninstall());
```

### 3. Gestión de datos para tests

```typescript
export const TEST_CONFIGS = {
  MINIMAL: createMockConfig({ enableDebugMode: false }),
  DEBUG: createMockConfig({ enableDebugMode: true, mockMode: true }),
  TIZEN: createMockConfig({ ...TIZEN_CONFIG, mockMode: true }),
  WEBOS: createMockConfig({ ...WEBOS_CONFIG, mockMode: true })
};

export const TEST_EVENTS = {
  VIDEO_PLAY: createMockEvent('video_play', { video_id: 'test123' }),
  PAGE_VIEW: createMockEvent('page_view', { page_location: '/test' })
};
```

### 4. Depuración de tests

```typescript
// Habilitar logs detallados en tests
beforeEach(() => {
  if (process.env.DEBUG_TESTS) {
    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'warn').and.callThrough();
  }
});

// Test con timeout extendido para debugging
it('should work', (done) => {
  // Test logic
  setTimeout(done, 100);
}, 10000); // 10 second timeout
```

### 5. Test de rendimiento

```typescript
// performance.spec.ts
describe('Performance Tests', () => {
  it('should initialize within 100ms', () => {
    const start = performance.now();
    
    service.initialize(mockConfig);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle 1000 events efficiently', () => {
    const events = Array.from({ length: 1000 }, (_, i) => 
      createMockEvent(`event_${i}`)
    );

    const start = performance.now();
    
    events.forEach(event => service.logEvent(event.name, event.params));
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // 1 second for 1000 events
  });
});
```
