import { Component, ElementRef, ViewChild } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-kezdolap',
  imports: [RouterModule, CommonModule],
  templateUrl: './kezdolap.component.html',
  styleUrl: './kezdolap.component.scss'
})
export class KezdolapComponent {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    });
  }
}
