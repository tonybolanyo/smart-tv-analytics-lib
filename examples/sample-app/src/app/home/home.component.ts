import { Component, OnInit } from '@angular/core';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  videos = [
    { id: 1, title: 'Video de Ejemplo 1', duration: '10:30' },
    { id: 2, title: 'Video de Ejemplo 2', duration: '15:45' },
    { id: 3, title: 'Video de Ejemplo 3', duration: '8:20' }
  ];

  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit(): void {
    // Evento personalizado: usuario vio la página de inicio
    this.analytics.logEvent('view_home', {
      total_videos: this.videos.length
    });
  }

  onVideoClick(video: any): void {
    // Registrar cuando el usuario selecciona un video
    this.analytics.logEvent('select_content', {
      content_type: 'video',
      content_id: video.id.toString(),
      item_name: video.title
    });
  }
}
