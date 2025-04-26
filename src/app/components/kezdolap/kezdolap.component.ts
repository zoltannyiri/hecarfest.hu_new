// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { SidebarComponent } from "../sidebar/sidebar.component";
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-kezdolap',
//   imports: [RouterModule, CommonModule],
//   templateUrl: './kezdolap.component.html',
//   styleUrl: './kezdolap.component.scss'
// })
// export class KezdolapComponent {
//   @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
//   sidebarOpen = false;

//   toggleSidebar() {
//     this.sidebarOpen = !this.sidebarOpen;
//   }

//   ngAfterViewInit() {
//     setTimeout(() => {
//       const video = this.videoElement.nativeElement;
//       video.muted = true;
//       video.play().catch(err => {
//         console.error("Autoplay failed:", err);
//       });
//     });
//   }
//    // Ez a változó felelős a rejtett programok megjelenítéséért
//    showAllPrograms: boolean = false;

//    // Funkció, ami a gomb kattintásakor fut le
//    togglePrograms() {
//      this.showAllPrograms = !this.showAllPrograms;
//    }


//    private maintargetDate: Date = new Date('2025-06-07T09:00:00');
//   private mainInterval: any;

//   private vipTargetDate: Date = new Date('2025-05-20T23:59:59');
//   private vipInterval: any;

//   constructor() { }

//   ngOnInit(): void {
//     this.startVipCountdown();  // VIP countdown
//     this.startMainCountdown(); // Fő countdown
//   }

//   ngOnDestroy(): void {
//     if (this.vipInterval) {
//       clearInterval(this.vipInterval);
//     }
//     if (this.mainInterval) {
//       clearInterval(this.mainInterval);
//     }
//   }

//   startVipCountdown(): void {
//     this.updateVipCountdown();  // Az első VIP countdown frissítése
//     this.vipInterval = setInterval(() => this.updateVipCountdown(), 1000);  // 1 másodpercenként frissíti az időt
//   }

//   startMainCountdown(): void {
//     this.updateMainCountdown();  // Az első fő countdown frissítése
//     this.mainInterval = setInterval(() => this.updateMainCountdown(), 1000);  // 1 másodpercenként frissíti az időt
//   }

//   updateVipCountdown(): void {
//     const now = new Date();
//     const timeRemaining = this.vipTargetDate.getTime() - now.getTime();

//     if (timeRemaining <= 0) {
//       clearInterval(this.vipInterval);
//       document.getElementById('vipCountdown')!.innerHTML = "Lejárt a regisztráció!";
//       return;
//     }

//     // Napok, órák, percek és másodpercek kiszámítása
//     const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

//     // Az idő frissítése a DOM-ban
//     document.getElementById('vipCountdown')!.innerHTML = `${days} nap ${hours} óra ${minutes} perc ${seconds} mp`;
//   }

//   updateMainCountdown(): void {
//     const now = new Date();
//     const timeRemaining = this.mainTargetDate.getTime() - now.getTime();

//     if (timeRemaining <= 0) {
//       clearInterval(this.mainInterval);
//       document.getElementById('mainCountdown')!.innerHTML = "Lejárt a fő esemény regisztráció!";
//       return;
//     }

//     // Napok, órák, percek és másodpercek kiszámítása
//     const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

//     // Az idő frissítése a DOM-ban
//     document.getElementById('mainCountdown')!.innerHTML = `${days} nap ${hours} óra ${minutes} perc ${seconds} mp`;
//   }
// }


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
    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    });
  }

  // VIP és fő visszaszámlálók cél dátumai
  private mainTargetDate: Date = new Date('2025-06-07T09:00:00');
  private mainInterval: any;

  private vipTargetDate: Date = new Date('2025-05-20T23:59:59');
  private vipInterval: any;

  constructor() { }

  ngOnInit(): void {
    this.startVipCountdown();  // VIP countdown
    this.startMainCountdown(); // Fő countdown
  }

  ngOnDestroy(): void {
    if (this.vipInterval) {
      clearInterval(this.vipInterval);
    }
    if (this.mainInterval) {
      clearInterval(this.mainInterval);
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
