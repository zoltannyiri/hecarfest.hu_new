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
    this.loadLogs();
    
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
    console.log('Token in admin:', token);
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

  openStatusModal(status: string) {
    this.currentStatus = status;
    this.filteredRegistrations = this.registrations.filter(reg => reg.status === status);
    this.statusModalOpen = true;
  }

  closeStatusModal() {
    this.statusModalOpen = false;
  }

  getStatusTitle(status: string): string {
    switch(status) {
      case 'accepted': return 'Igen';
      case 'rejected': return 'Nem';
      case 'maybe': return 'Talán';
      case 'pending': return 'Függőben';
      default: return '';
    }
  }

  exportSingleToExcel(registration: any) {
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
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regisztráció');
    XLSX.writeFile(wb, `${registration.lastName}_${registration.firstName}_${registration.carType}.xlsx`);
  }

  emailModalOpen: boolean = false;
  showEmailListStatus: string = '';
  emailData: any = {
    to: '',
    subject: 'HéCarFest 2025 értesítés',
    message: '',
    registrationId: null
  };

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

  hasNotification(reg: any): boolean {
    return reg.notifications && reg.notifications.length > 0;
  }

  getRegistrationsByStatus(status: string): any[] {
    return this.registrations.filter(reg => reg.status === status);
  }

  selectRecipient(email: string, registrationId: string) {
    this.emailData.to = email;
    this.emailData.registrationId = registrationId;
    
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

  async toggleNotification(reg: any) {
    try {
      reg.notified = !reg.notified;
      
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

  logs: any[] = [];

  async loadLogs() {
    try {
      const logs = await this.http.get<any[]>('http://localhost:3000/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      }).toPromise();
      
      // Ellenőrizzük, hogy van-e adat
      if (logs && Array.isArray(logs)) {
        this.logs = logs;
      } else {
        console.warn('A naplók lekérdezése üres választ adott vissza');
        this.logs = [];
      }
    } catch (error) {
      console.error('Hiba a naplók betöltésekor:', error);
      this.logs = [];
    }
  }

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

  exportToExcel(status: string) {
    const filteredRegistrations = this.registrations.filter(reg => reg.status === status);
    
    const dataToExport = filteredRegistrations.map(reg => ({
      Név: `${reg.lastName} ${reg.firstName}`,
      Email: reg.email,
      Autó: reg.carType,
      Rendszám: reg.licensePlate,
      Dátum: reg.registrationDate,
      Státusz: reg.status
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regisztrációk');
    XLSX.writeFile(wb, `regisztraciok_${status}.xlsx`);
  }

  exportLogsToTxt() {
    if (this.logs.length === 0) {
      alert('Nincsenek naplóbejegyzések az exportáláshoz!');
      return;
    }
  
    // Fejléc
    let txtContent = "Időpont\t\t\tAdmin\t\tTevékenység\t\tCél\t\tRészletek\n";
    txtContent += "=".repeat(100) + "\n";
  
    // Adatok hozzáadása
    this.logs.forEach(log => {
      txtContent += `${new Date(log.timestamp).toLocaleString('hu-HU')}\t`;
      txtContent += `${log.adminUser}\t`;
      txtContent += `${log.action}\t`;
      txtContent += `${log.targetType || 'N/A'}\t`;
      
      // Formázott változtatások
      if (log.changes) {
        if (typeof log.changes === 'object') {
          txtContent += JSON.stringify(log.changes, null, 2)
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ');
        } else {
          txtContent += log.changes;
        }
      } else {
        txtContent += 'N/A';
      }
      
      txtContent += "\n";
    });
  
    // Blob létrehozása és letöltés
    this.downloadFile(txtContent, 'text/plain', 'HecarFest_logs.txt');
  }

  private downloadFile(data: string, mimeType: string, filename: string) {
    const blob = new Blob([data], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Takarítás
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/']);
  }
}