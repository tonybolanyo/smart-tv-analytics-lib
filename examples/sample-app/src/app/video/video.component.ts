import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
  videoId: string = '';
  videoTitle: string = '';
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 600; // 10 minutos de ejemplo
  private playStartTime: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analytics: SmartTVAnalyticsService
  ) {}

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id') || '1';
    this.videoTitle = `Video de Ejemplo ${this.videoId}`;
    
    // Registrar que el usuario comenzó a ver el video
    this.analytics.logEvent('video_start', {
      video_id: this.videoId,
      video_title: this.videoTitle
    });
  }

  ngOnDestroy(): void {
    if (this.isPlaying) {
      this.onPause();
    }
  }

  onPlay(): void {
    this.isPlaying = true;
    this.playStartTime = Date.now();
    
    this.analytics.logEvent('video_play', {
      video_id: this.videoId,
      video_title: this.videoTitle,
      video_current_time: this.currentTime
    });
  }

  onPause(): void {
    if (this.isPlaying) {
      const watchTime = Math.floor((Date.now() - this.playStartTime) / 1000);
      
      this.analytics.logEvent('video_pause', {
        video_id: this.videoId,
        video_title: this.videoTitle,
        video_current_time: this.currentTime,
        watch_time_seconds: watchTime
      });
      
      this.isPlaying = false;
    }
  }

  onSeek(seconds: number): void {
    this.currentTime = Math.min(this.duration, Math.max(0, this.currentTime + seconds));
    
    this.analytics.logEvent('video_seek', {
      video_id: this.videoId,
      video_title: this.videoTitle,
      video_current_time: this.currentTime
    });
  }

  onComplete(): void {
    this.analytics.logEvent('video_complete', {
      video_id: this.videoId,
      video_title: this.videoTitle,
      video_duration: this.duration
    });
    
    this.currentTime = 0;
    this.isPlaying = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
