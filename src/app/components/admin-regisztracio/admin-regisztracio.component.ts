import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-regisztracio',
  imports: [CommonModule, HttpClientModule],
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



  logout(): void {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/']);
  }
}