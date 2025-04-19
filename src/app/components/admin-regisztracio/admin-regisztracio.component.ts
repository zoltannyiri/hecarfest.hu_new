import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-regisztracio',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-regisztracio.component.html',
  styleUrl: './admin-regisztracio.component.scss'
})
export class AdminRegistrationsComponent implements OnInit, OnDestroy {
  registrations: any[] = [];
  selectedRegistration: any = null;
  isLoading = false;
  private refreshInterval: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadRegistrations();
    
    // 5 percenként frissítjük az adatokat
    this.refreshInterval = setInterval(() => {
      this.loadRegistrations();
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  checkAuth(): void {
    const token = localStorage.getItem('admin_token');
    console.log('Token in admin:', token); // Hibakereséshez
    if (!token) {
      this.router.navigate(['/']);
    }
  }

  loadRegistrations(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/admin/registrations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    }).subscribe({
      next: (data: any[]) => {
        this.registrations = data;
        this.isLoading = false;
      },
      error: (err: { status: number; }) => {
        console.error('Hiba a regisztrációk betöltésekor:', err);
        if (err.status === 401) {
          this.logout();
        }
        this.isLoading = false;
      }
    });
  }

  refreshRegistrations(): void {
    this.loadRegistrations();
  }

  viewDetails(reg: any): void {
    this.selectedRegistration = reg;
  }

  deleteRegistration(id: string): void {
    if (confirm('Biztosan törölni szeretnéd ezt a regisztrációt?')) {
      this.http.delete(`http://localhost:3000/api/admin/registrations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      }).subscribe({
        next: () => {
          this.registrations = this.registrations.filter(r => r._id !== id);
        },
        error: (err: { status: number; }) => {
          console.error('Hiba a törlés során:', err);
          if (err.status === 401) {
            this.logout();
          }
        }
      });
    }
  }

  openImageInNewTab(imageUrl: string): void {
    window.open(imageUrl, '_blank', 'width=800,height=600');
}

handleImageError(event: Event, imageUrl: string): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.style.opacity = '0.5';
  console.error(`Hiba a kép betöltésekor: ${imageUrl}`);
}

handleImageLoad(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.style.opacity = '1';
}


statusModalOpen: boolean = false;
currentStatus: string = '';
filteredRegistrations: any[] = [];

// Modal megnyitása státusz szerint
openStatusModal(status: string) {
  this.currentStatus = status;
  this.filteredRegistrations = this.registrations.filter(reg => reg.status === status);
  this.statusModalOpen = true;
}


// Modal bezárása
closeStatusModal() {
  this.statusModalOpen = false;
}


// Státusz címének lekérdezése
getStatusTitle(status: string): string {
  switch(status) {
      case 'accepted': return 'Igen';
      case 'rejected': return 'Nem';
      case 'maybe': return 'Talán';
      case 'pending': return 'Függőben';
      default: return '';
  }
}





// Egyedi regisztráció exportálása Excelbe
exportSingleToExcel(registration: any) {
  // Itt implementáld a single export logikáját
  // Példa:
  const data = [{
        'Név': `${registration.lastName} ${registration.firstName}`,
        'Email': registration.email,
        'Autó': registration.carType,
        'Rendszám': registration.licensePlate,
        'Státusz': this.getStatusTitle(registration.status),
        'Dátum': new Date(registration.registrationDate).getTime(),
        'yyyy.MM.dd HH:mm': new Date(registration.registrationDate).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        'Telefon': registration.phone,
        'Autó története': registration.carStory
    }];
  
  // Itt hívd meg az Excel exportáló függvényed, pl.:
  this.exportAsExcelFile(data, `${registration.lastName}_${registration.firstName}_${registration.carType}`);
}
  exportAsExcelFile(data: { Név: string; Email: any; Autó: any; Rendszám: any; Státusz: string; Dátum: number; 'yyyy.MM.dd HH:mm': any; Telefon: any; 'Autó története': any; }[], arg1: string) {
    throw new Error('Method not implemented.');
  }








  emailModalOpen: boolean = false;
showEmailListStatus: string = '';
emailData: any = {
  to: '',
  subject: 'HéCarFest 2025 értesítés',
  message: '',
  registrationId: null
};

// Add these methods to your component class
openEmailModal() {
  this.emailModalOpen = true;
}

closeEmailModal() {
  this.emailModalOpen = false;
  this.showEmailListStatus = '';
  this.emailData = {
    to: '',
    subject: 'HéCarFest 2025 VIP értesítés',
    message: ''
  };
}

showEmailList(status: string) {
  this.showEmailListStatus = status;
  this.emailData.to = this.getEmailsByStatus(status);
}

getEmailsByStatus(status: string): string {
  return this.registrations
    .filter(reg => reg.status === status)
    .map(reg => reg.email)
    .join(', ');
}



// Új metódus az értesítés ellenőrzéséhez
hasNotification(reg: any): boolean {
  return reg.notifications && reg.notifications.length > 0;
}


// Új metódusok
getRegistrationsByStatus(status: string): any[] {
  return this.registrations.filter(reg => reg.status === status);
}

selectRecipient(email: string, registrationId: string) {
  this.emailData.to = email;
  this.emailData.registrationId = registrationId;
  
  // Automatikusan kitöltjük a tárgyat, ha üres
  if (!this.emailData.subject || this.emailData.subject === 'HéCarFest 2025 értesítés') {
    const reg = this.registrations.find(r => r._id === registrationId);
    if (reg) {
      this.emailData.subject = `HéCarFest 2025 - ${reg.lastName} ${reg.firstName} (${reg.licensePlate})`;
    }
  }
}





copyEmailsToClipboard() {
  const emails = this.getRegistrationsByStatus(this.showEmailListStatus)
    .map(reg => reg.email)
    .join(', ');
  
  navigator.clipboard.writeText(emails)
    .then(() => alert('Email címek másolva a vágólapra!'))
    .catch(err => console.error('Hiba a másolás során:', err));
}


// Metódusok
async toggleNotification(reg: any) {
  try {
    // Lokális állapot váltása
    reg.notified = !reg.notified;
    
    // Szerver oldali mentés
    await this.http.put(`http://localhost:3000/api/admin/registrations/${reg._id}/notified`, 
      { notified: reg.notified },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      }
    ).toPromise();
  } catch (error) {
    console.error('Hiba az értesítési állapot módosításakor:', error);
    // Visszaállítás hibánál
    reg.notified = !reg.notified;
    alert('Hiba történt az állapot mentése során');
  }
}

async sendEmail() {
  if (!this.emailData.to || !this.emailData.subject || !this.emailData.message) {
    alert('Kérjük töltsd ki minden mezőt!');
    return;
  }

  try {
    await this.http.post('http://localhost:3000/api/admin/send-email', this.emailData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    }).toPromise();

    alert('Email sikeresen elküldve!');
    this.closeEmailModal();
  } catch (error) {
    console.error('Hiba az email küldésekor:', error);
    alert('Hiba történt az email küldése során');
  }
}







//kategorizálás
// Új metódusok hozzáadása
updateStatus(registrationId: string, status: string): void {
  this.http.put(`http://localhost:3000/api/admin/registrations/${registrationId}/status`, { status }, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
  }).subscribe({
      next: () => {
          this.loadRegistrations();
      },
      error: (err) => {
          console.error('Hiba a státusz módosításakor:', err);
          if (err.status === 401) {
              this.logout();
          }
      }
  });
}

filterByStatus(status: string): void {
  this.isLoading = true;
  this.http.get<any[]>(`http://localhost:3000/api/admin/registrations/status/${status}`, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
  }).subscribe({
      next: (data: any[]) => {
          this.registrations = data;
          this.isLoading = false;
      },
      error: (err: { status: number; }) => {
          console.error('Hiba a szűréskor:', err);
          if (err.status === 401) {
              this.logout();
          }
          this.isLoading = false;
      }
  });
}



//excelbe mentés
exportToExcel(status: string) {
    // Szűrjük a megfelelő státuszú regisztrációkat
    const filteredRegistrations = this.registrations.filter(reg => reg.status === status);
    
    // Adatok előkészítése Excel formátumhoz
    const dataToExport = filteredRegistrations.map(reg => ({
      Név: `${reg.lastName} ${reg.firstName}`,
      Email: reg.email,
      Autó: reg.carType,
      Rendszám: reg.licensePlate,
      Dátum: reg.registrationDate,
      Státusz: reg.status
    }));

    // Excel fájl létrehozása
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regisztrációk');

    // Fájl mentése
    XLSX.writeFile(wb, `regisztraciok_${status}.xlsx`);
  }



  logout(): void {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/']);
  }
}