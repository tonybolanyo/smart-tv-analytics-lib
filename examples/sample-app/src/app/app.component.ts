import { Component, OnInit } from '@angular/core';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Smart TV Analytics - App de Ejemplo';

  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit(): void {
    // El tracking automático de sesión y páginas ya está activo
    // Aquí se puede registrar un evento personalizado de inicio de app
    this.analytics.logEvent('app_opened', {
      platform: this.detectPlatform()
    });
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('tizen')) return 'Tizen';
    if (userAgent.includes('webos')) return 'WebOS';
    return 'Unknown';
  }
}
