export const environment = {
  production: true,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret-here',
    appName: 'SampleSmartTVApp',
    appVersion: '1.0.0',
    // En producción, usar estrategia directa o proxy según tu setup
    sendingStrategy: 'direct' as const,
    mockMode: false,
    enableDebugMode: false
  }
};
