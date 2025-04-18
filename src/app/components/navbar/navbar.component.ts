import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  showLoginModal = false;
  isLoggingIn = false;
  loginError = '';

  constructor(private http: HttpClient, private router: Router) {}

  openLoginModal(): void {
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.loginError = '';
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.isLoggingIn = true;
    this.loginError = '';
    
    const form = event.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    this.http.post<any>('http://localhost:3000/api/admin/login', { username, password })
      .subscribe({
        next: (response) => {
          localStorage.setItem('admin_token', response.token);
          this.isLoggingIn = false;
          this.showLoginModal = false;
          this.router.navigate(['/admin/registrations'])
            .then(() => window.location.reload()); // Frissítés az oldal betöltéséhez
        },
        error: (err) => {
          this.isLoggingIn = false;
          this.loginError = err.error?.message || 'Hibás felhasználónév vagy jelszó';
        }
      });
  }
}
