import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vip-regisztracio',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './vip-regisztracio.component.html',
  styleUrl: './vip-regisztracio.component.scss'
})
export class VipRegisztracioComponent {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('vipSection') vipSection!: ElementRef;
  @ViewChild('registrationForm') registrationForm!: ElementRef<HTMLFormElement>;
  
  isLoading = false; // Betöltési állapot nyomon követése

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    });
  }

  scrollToVip(): void {
    if (this.vipSection && this.vipSection.nativeElement) {
      this.vipSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading = true; // Betöltés megkezdése
    this.cdRef.detectChanges(); // Kényszerítjük a változás észlelését
    
    const form = this.registrationForm.nativeElement;
    const formData = new FormData(form);
    
    // Hibakeresés - kiírjuk az összes kiválasztott fájlt
    for (let i = 1; i <= 4; i++) {
      const input = form.querySelector(`input[name="carImage${i}"]`) as HTMLInputElement;
      if (input?.files?.length) {
        console.log(`carImage${i} fájl:`, input.files[0]);
      }
    }
    const interiorInput = form.querySelector('input[name="interiorImage"]') as HTMLInputElement;
    if (interiorInput?.files?.length) {
      console.log('interiorImage fájl:', interiorInput.files[0]);
    }
    
    this.http.post('http://localhost:3000/api/vip-registration', formData)
      .subscribe({
        next: (valasz: any) => {
          this.isLoading = false; // Betöltés befejezése
          this.cdRef.detectChanges();
          
          alert(valasz.message || 'Sikeres regisztráció! Hamarosan értesítünk e-mailben.');
          form.reset();
          
          // Fájlnevek visszaállítása
          for (let i = 1; i <= 4; i++) {
            const elem = document.getElementById(`autokep${i}`);
            if (elem) {
              elem.textContent = 'Nincs fájl kiválasztva';
              elem.classList.remove('text-green-300');
              elem.classList.add('text-gray-300');
            }
          }
          
          const belsoElem = document.getElementById('autobelso');
          if (belsoElem) {
            belsoElem.textContent = 'Nincs fájl kiválasztva';
            belsoElem.classList.remove('text-green-300');
            belsoElem.classList.add('text-gray-300');
          }
        },
        error: (hiba) => {
          this.isLoading = false; // Betöltés befejezése hibánál is
          this.cdRef.detectChanges();
          
          console.error('Regisztrációs hiba:', hiba);
          const hibaUzenet = hiba.error?.message || 
                            'Hiba történt a regisztráció során. Kérjük, próbálja újra később.';
          alert(hibaUzenet);
        },
        complete: () => {
          this.isLoading = false; // Biztonsági befejezés
          this.cdRef.detectChanges();
        }
      });
  }

  updateFileName(event: Event, elementId: string): void {
    const input = event.target as HTMLInputElement;
    const fileNameElement = document.getElementById(elementId);
    
    if (input.files && input.files.length > 0 && fileNameElement) {
      fileNameElement.textContent = input.files[0].name;
      fileNameElement.classList.remove('text-gray-300');
      fileNameElement.classList.add('text-green-300');
      console.log(`Kép kiválasztva: ${input.name} - ${input.files[0].name}`);
    } else if (fileNameElement) {
      fileNameElement.textContent = 'Nincs fájl kiválasztva';
      fileNameElement.classList.remove('text-green-300');
      fileNameElement.classList.add('text-gray-300');
    }
  }
}