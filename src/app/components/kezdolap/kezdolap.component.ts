import { Component, ElementRef, ViewChild } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule, ViewportScroller } from '@angular/common';
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
  private videoRetryInterval: any;
  private retryCount = 0;
  private maxRetries = 5;
  // Hozzáadott változók a visszaszámlálóhoz
  mainCountdown: string = '';
  vipCountdown: string = '';

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

     // Ez a változó felelős a rejtett programok megjelenítéséért
   showAllPrograms: boolean = false;

   // Funkció, ami a gomb kattintásakor fut le
   togglePrograms() {
     this.showAllPrograms = !this.showAllPrograms;
   }

   ngAfterViewInit() {
    const video = this.videoElement.nativeElement;

    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.playsInline = true;
      
      video.play().catch(err => {
        console.warn("Autoplay failed, trying one more time:", err);
        // Egy második próbálkozás, ha az első nem sikerül
        setTimeout(() => video.play().catch(e => console.error("Final play attempt failed:", e)), 100);
      });
    }, 100);
    
    // Próbáljuk meg elindítani a videót
    const playPromise = video.play();
  
    // Ha a Promise elutasításra kerül (pl. böngésző blokkolja)
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error("Autoplay failed, trying fallback:", err);
        // Alternatív megoldás: mutassunk egy play gombot
        video.controls = true;
        // Vagy adjunk hozzá egy click eseményfigyelőt az oldalra
        document.body.addEventListener('click', () => {
          video.play().catch(e => console.error("Still cannot play:", e));
        }, { once: true });
      });
    }
  }



  private initializeVideo() {
    const video = this.videoElement.nativeElement;
    
    // Fontos beállítások
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('playsinline', '');
    
    // Első próbálkozás
    this.attemptPlayVideo(video);

    // Ha nem sikerül, próbálkozzunk újra időközönként
    this.videoRetryInterval = setInterval(() => {
      if (this.retryCount < this.maxRetries) {
        this.attemptPlayVideo(video);
        this.retryCount++;
      } else {
        clearInterval(this.videoRetryInterval);
        // this.showFallbackButton(video);
      }
    }, 300);
  }

  private attemptPlayVideo(video: HTMLVideoElement) {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        clearInterval(this.videoRetryInterval);
      }).catch(error => {
        console.warn('Video play attempt failed:', error);
      });
    }
  }

  // private showFallbackPlayButton(video: HTMLVideoElement) {
  //   // Létrehozunk egy play gombot, ha az autoplay nem működik
  //   const playButton = document.createElement('div');
  //   playButton.innerHTML = '▶';
  //   playButton.style.position = 'absolute';
  //   playButton.style.top = '50%';
  //   playButton.style.left = '50%';
  //   playButton.style.transform = 'translate(-50%, -50%)';
  //   playButton.style.fontSize = '60px';
  //   playButton.style.cursor = 'pointer';
  //   playButton.style.zIndex = '10';
  //   playButton.style.color = 'white';
  //   playButton.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    
  //   playButton.addEventListener('click', () => {
  //     video.play().catch(e => console.error("Manual play failed:", e));
  //     playButton.remove();
  //   }, { once: true });

  //   video.parentElement?.appendChild(playButton);
  // }

  // VIP és fő visszaszámlálók cél dátumai
  private mainTargetDate: Date = new Date('2025-06-07T09:00:00');
  private mainInterval: any;

  private vipTargetDate: Date = new Date('2025-05-20T23:59:59');
  private vipInterval: any;

  constructor(private viewportScroller: ViewportScroller) { }

  ngOnInit(): void {
    this.startVipCountdown();  // VIP countdown
    this.startMainCountdown(); // Fő countdown
  }

  scrollToPrograms(): void {
    const element = document.getElementById('programok');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setTimeout(() => {
        const yOffset = -80; // Opcionális eltolás, ha van fix fejléc
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.vipInterval) {
      clearInterval(this.vipInterval);
    }
    if (this.mainInterval) {
      clearInterval(this.mainInterval);
    }
    if (this.videoRetryInterval) {
      clearInterval(this.videoRetryInterval);
    }
  }

  startVipCountdown(): void {
    this.updateVipCountdown();  // Az első VIP countdown frissítése
    this.vipInterval = setInterval(() => this.updateVipCountdown(), 1000);  // 1 másodpercenként frissíti az időt
  }

  startMainCountdown(): void {
    this.updateMainCountdown();  // Az első fő countdown frissítése
    this.mainInterval = setInterval(() => this.updateMainCountdown(), 1000);  // 1 másodpercenként frissíti az időt
  }

  updateVipCountdown(): void {
    const now = new Date();
    const timeRemaining = this.vipTargetDate.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      clearInterval(this.vipInterval);
      this.vipCountdown = "Lejárt a regisztráció!";
      return;
    }

    // Napok, órák, percek és másodpercek kiszámítása
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Az idő frissítése a változóban
    this.vipCountdown = `${days} nap ${hours} óra ${minutes} perc ${seconds} mp`;
  }

  updateMainCountdown(): void {
    const now = new Date();
    const timeRemaining = this.mainTargetDate.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      clearInterval(this.mainInterval);
      this.mainCountdown = "Lejárt a fő esemény regisztráció!";
      return;
    }

    // Napok, órák, percek és másodpercek kiszámítása
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Az idő frissítése a változóban
    this.mainCountdown = `${days} nap ${hours} óra ${minutes} perc ${seconds} mp`;
  }
}
