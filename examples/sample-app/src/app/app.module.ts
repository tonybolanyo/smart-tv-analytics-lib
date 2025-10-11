import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { VideoComponent } from './video/video.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SmartTVAnalyticsModule.forRoot({
      measurementId: environment.analytics.measurementId,
      apiSecret: environment.analytics.apiSecret,
      appName: environment.analytics.appName,
      appVersion: environment.analytics.appVersion,
      enableDebugMode: !environment.production,
      enablePageViewTracking: true,
      enableSessionTracking: true,
      enableEngagementTracking: true,
      // Configuración optimizada para Smart TVs
      batchSize: 5,
      flushInterval: 60000,
      requestTimeout: 15000,
      maxRetryAttempts: 2
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
