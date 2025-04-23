// gyik.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-gyik',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './gyik.component.html',
  styleUrls: ['./gyik.component.scss'],
  animations: [
    trigger('toggleHeight', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      transition('closed => open', [
        animate('300ms ease')
      ]),
      transition('open => closed', [
        animate('300ms ease')
      ])
    ])
  ]
})
export class GyikComponent {
  isOpen: { [key in 'answer1' | 'answer2' | 'answer3' | 'answer4' | 'answer5' | 'answer6' | 'answer7' | 'answer8' | 'answer9' | 'answer10']: boolean } = {
    answer1: false,
    answer2: false,
    answer3: false,
    answer4: false,
    answer5: false,
    answer6: false,
    answer7: false,
    answer8: false,
    answer9: false,
    answer10: false
  };

  toggleAnswer(id: 'answer1' | 'answer2' | 'answer3' | 'answer4' | 'answer5' | 'answer6' | 'answer7' | 'answer8' | 'answer9' | 'answer10') {
    this.isOpen[id] = !this.isOpen[id];
  }

  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
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