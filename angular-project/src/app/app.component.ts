import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="!isLoading">
      <router-outlet></router-outlet>
    </div>

    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" *ngIf="isLoading">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement de l'application...</p>
      </div>
    </div>
  `,
  styleUrls: []
})
export class AppComponent implements OnInit {
  isLoading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Initialize the application
    await this.initializeApp();
  }

  private async initializeApp() {
    try {
      // Check authentication status (already handled in AuthService constructor)

      // Navigate based on auth status
      const isAuthenticated = this.authService.isAuthenticated();
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      this.router.navigate(['/login']);
    } finally {
      this.isLoading = false;
    }
  }
}