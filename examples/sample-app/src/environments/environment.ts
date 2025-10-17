export const environment = {
  production: false,
  analytics: {
    measurementId: 'G-V322J0RJCJ',
    apiSecret: 'vOF3w4GkS2yRdu575esLSQ',
    appName: 'SampleSmartTVApp',
    appVersion: '1.0.0',
    // Configuración para evitar CORS en desarrollo
    sendingStrategy: 'mock' as const,
    mockMode: true,
    enableDebugMode: true
  }
};
