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
  showDeleteModal = false;
  registrationToDelete: any = null;
  confirmingFinalDelete = false; // első kör


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
    this.http.get<any[]>('https://hecarfesthu-backend.onrender.com/api/admin/registrations', {
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
    this.registrationToDelete = this.registrations.find(r => r._id === id);
    this.showDeleteModal = true;
    this.confirmingFinalDelete = false; // első kör
  }
  confirmDelete(): void {
    if (this.registrationToDelete && this.confirmingFinalDelete) {
      // tényleges törlés
      this.http.delete(`https://hecarfesthu-backend.onrender.com/api/admin/registrations/${this.registrationToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      }).subscribe({
        next: () => {
          this.registrations = this.registrations.filter(r => r._id !== this.registrationToDelete._id);
          this.resetDeleteModal();
        },
        error: (err: { status: number; }) => {
          console.error('Hiba a törlés során:', err);
          if (err.status === 401) {
            this.logout();
          }
          this.resetDeleteModal();
        }
      });
    } else {
      // ha első törlés gombra kattintott, mutatjuk a második megerősítést
      this.confirmingFinalDelete = true;
    }
  }
  
  cancelDelete(): void {
    this.resetDeleteModal();
  }
  
  private resetDeleteModal(): void {
    this.showDeleteModal = false;
    this.registrationToDelete = null;
    this.confirmingFinalDelete = false;
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
    imgElement.style.objectFit = 'cover'; // Biztosítja, hogy a kép jól illeszkedjen
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
    // NE töltse be automatikusan az email címeket
    this.emailData.to = ''; // Üresen hagyjuk a címzett mezőt
}

  // getEmailsByStatus(status: string): string {
  //   return this.registrations
  //     .filter(reg => reg.status === status)
  //     .map(reg => reg.email)
  //     .join(', ');
  // }

  hasNotification(reg: any): boolean {
    return reg.notifications && reg.notifications.length > 0;
  }

  getRegistrationsByStatus(status: string): any[] {
    return this.registrations.filter(reg => reg.status === status);
  }

  selectRecipient(email: string, registrationId: string) {
    // Email hozzáadása a címzettekhez
    if (!this.emailData.to) {
        this.emailData.to = email;
    } 
    else if (!this.emailData.to.includes(email)) {
        this.emailData.to += ', ' + email;
    }
    
    this.emailData.registrationId = registrationId;
    
    const defaultSubject = 'HéCarFest 2025 értesítés';
    if (!this.emailData.subject || this.emailData.subject === defaultSubject) {
        const reg = this.registrations.find(r => r._id === registrationId);
        if (reg) {
            // Az eredeti tárgyhoz hozzáfűzzük a rendszámot
            this.emailData.subject = `${defaultSubject}`;
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

  rejectedSzoveg(): string {
    return `
      <p>Szia!</p>
  
      <p>
        Ezúton is szeretnénk megköszönni, hogy jelentkeztél a <strong>2025-ös HéCarFest</strong> rendezvényünkre, és hogy érdeklődést mutattál a <strong>V.I.P. szekcióban</strong> való részvétel iránt.
      </p>
  
      <p>
        Sajnálattal kell közölnünk, hogy a V.I.P. regisztrációd ez alkalommal <strong>nem került elfogadásra</strong>. Az idei évben rendkívül magas számban érkeztek be jelentkezések, a rendelkezésre álló helyek száma pedig korlátozott.
      </p>
  
      <p>
        A kiválasztási folyamat során több szempontot is figyelembe kellett vennünk, többek között az autók egyediségét és különlegességét is.
      </p>
  
      <p>
        Bár járműved nem került be a V.I.P. kategóriába, <strong>nagyra értékeljük</strong> az autó iránti elköteleződésed és a közösség iránt tanúsított érdeklődésed. Reméljük, hogy ettől függetlenül <strong>ellátogatsz az eseményre</strong>, és együtt élvezhetjük a fesztivál hangulatát!
      </p>
  
      <p>
        Köszönjük megértésed, és bízunk benne, hogy a jövőben ismét találkozunk! 🙂
      </p>
  
      <p>Üdvözlettel,<br><strong>A HéCarFest Csapata</strong></p>
    `;
  }
  
  setRejectedEmailText(): void {
    this.emailData.message = this.rejectedSzoveg();
    this.emailData.subject = 'HéCarFest VIP regisztráció elutasítása';
  }


  acceptedSzoveg(): string {
    return `
      <p>Szia!</p>
  
      <p>Örömmel értesítünk, hogy beválogatásra kerültél a <strong>2025-ös HéCarFest Aero V.I.P szektorba</strong>!</p>
  
      <p>Idén is saját parkolóhely vár a külön elkerített, színpad előtti részen!</p>
  
      <p><strong>Amit a V.I.P jegy tartalmaz:</strong></p>
      <ul>
        <li>➡️ Helyfoglalás a V.I.P szektorban ❗</li>
        <li>➡️ Ajándékcsomag ❗</li>
        <li>➡️ Idén külön fotós vár a VIP szektorban, aki legalább egy garantált profi fotót készít a verdáról ❗ <strong>(Akár több kép is készülhet.)</strong></li>
        <li>➡️ A képek felkerülnek a LED-falra, amelyet minden évben kiállítunk rendezvényeinken ❗</li>
      </ul>
  
      <p><strong>Ára: 8000 Ft</strong>, amelyet a <strong>Dunakanyar Mercisei Egyesület</strong> számlájára <strong>előre utalással</strong> kell megfizetni!</p>
  
      <p><u>(Ezt sajnos a rengeteg utolsó pillanatban történő lemondás miatt kellett bevezetnünk.)</u></p>
  
      <p>A foglalást csak az utalás beérkezése <strong>után tudjuk véglegesíteni!</strong></p>
  
       <p>
      <span style="background-color:rgb(40, 163, 69); padding: 2px 4px;">
        <strong>OTP számlaszám:</strong> 11740054-24062402
      </span><br>
      <span style="background-color: rgb(40, 163, 69); padding: 2px 4px;">
        <strong>Dunakanyar Mercisei Egyesület</strong>
      </span>
    </p>
  
      <p><strong>Közlemény rovatba</strong> kérjük, írd be a saját neved és az autó rendszámát!</p>
  
      <p>
      <span style="background-color: rgb(221, 158, 76); padding: 2px 4px;">
        <strong><u>A regisztráció kizárólag arra a személyre és gépjárműre vonatkozik, amely a regisztráláskor beküldésre került!
        Az azt követő beválogatás során a V.I.P PASS nem ruházható át más emberre és másik autóra!</u></strong>
      </span>
      </p>
  
      <p>Üdv, <strong>a HéCarFest</strong> csapata</p>
    `;
  }
  
  
  setAcceptedEmailText(): void {
    this.emailData.message = this.acceptedSzoveg();
    this.emailData.subject = 'HéCarFest VIP regisztráció véglegesítése';
  }

  async toggleNotification(reg: any) {
    try {
      reg.notified = !reg.notified;
      
      await this.http.put(`https://hecarfesthu-backend.onrender.com/api/admin/registrations/${reg._id}/notified`, 
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
      await this.http.post('https://hecarfesthu-backend.onrender.com/api/admin/send-email', this.emailData, {
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
      const logs = await this.http.get<any[]>('https://hecarfesthu-backend.onrender.com/api/admin/audit-logs', {
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
    this.http.put(`https://hecarfesthu-backend.onrender.com/api/admin/registrations/${registrationId}/status`, { status }, {
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
    this.http.get<any[]>(`https://hecarfesthu-backend.onrender.com/api/admin/registrations/status/${status}`, {
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
    let txtContent = "Időpont\t\t\tAdmin\t\tTevékenység\t\tAutó\t\tRendszám\t\tNév\t\tEmail\t\tVáltozás\n";
    txtContent += "=".repeat(180) + "\n";
  
    // Adatok hozzáadása
    this.logs.forEach(log => {
      const timestamp = new Date(log.timestamp).toLocaleString('hu-HU');
      const admin = log.adminUser || 'unknown';
      const action = log.action;
      
      // Regisztrációs adatok kinyerése - most már a changes-ben kell keresni
      const regName = log.changes?.regName || log.changes?.name || 'N/A';
      const regLicensePlate = log.changes?.regLicensePlate || log.changes?.licensePlate || 'N/A';
      const regEmail = log.changes?.regEmail || log.changes?.email || 'N/A';
      const regCarType = log.changes?.regCarType || log.changes?.carType || 'N/A';
      
      // Változás részletei
      let changeDetails = '';
      if (log.action === 'status_change') {
        changeDetails = `Státusz változás: ${log.changes?.from || 'N/A'} → ${log.changes?.to || 'N/A'}`;
      } else if (log.action === 'email_sent') {
        changeDetails = `Email küldés: ${log.changes?.to || 'N/A'} - ${log.changes?.subject || 'N/A'}`;
      } else if (log.action === 'notification_toggled') {
        changeDetails = `Értesítés állapota: ${log.changes?.notified !== undefined ? (log.changes.notified ? 'bekapcsolva' : 'kikapcsolva') : 'N/A'}`;
      } else if (log.changes) {
        changeDetails = JSON.stringify(log.changes, null, 2)
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ');
      }
      
      // Az adatok formázása, hogy szépen rendezetten jelenjenek meg
      txtContent += `${timestamp}\t${admin.padEnd(8)}\t${action.padEnd(15)}\t${regCarType.padEnd(10)}\t${regLicensePlate.padEnd(10)}\t${regName.padEnd(15)}\t${regEmail.padEnd(20)}\t${changeDetails}\n`;
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