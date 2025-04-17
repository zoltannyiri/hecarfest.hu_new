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