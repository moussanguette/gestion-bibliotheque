import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';
import { StatsCardsComponent } from '../stats-cards/stats-cards.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { BookManagerComponent } from '../book-manager/book-manager.component';
import { UserManagerComponent } from '../user-manager/user-manager.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardsComponent,
    RecentActivityComponent,
    BookManagerComponent,
    UserManagerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'books', label: 'Livres' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'loans', label: 'Prêts' },
    { id: 'reports', label: 'Rapports' }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.testAPIConnection();
  }

  testAPIConnection() {
    console.log('🧪 Testing API connection...');
    console.log('Environment API base URL:', environment.api.baseUrl);

    // Test de l'endpoint des livres
    this.apiService.getAllBooks().subscribe({
      next: (data) => {
        console.log('✅ Books API Response:', data);
        const books = data.data || data || [];
        console.log('Number of books found:', books.length);
        if (books.length > 0) {
          console.log('📚 First book structure:', books[0]);
          console.log('📊 Book properties:', {
            id: books[0].id,
            titre: books[0].titre,
            status: books[0].status,
            copiesTotal: books[0].copiesTotal,
            copiesAvailable: books[0].copiesAvailable,
            auteurs: books[0].auteurs?.length || 0,
            categorie: books[0].categorie?.nom
          });
        }
      },
      error: (error) => {
        console.error('❌ Books API Error:', error);
      }
    });

    // Test des auteurs
    this.apiService.getAuthorsSimple().subscribe({
      next: (authors) => {
        console.log('✅ Authors API Response:', authors);
        console.log('📊 Authors count:', authors?.length || 0);
      },
      error: (error) => {
        console.error('❌ Authors API Error:', error);
      }
    });

    // Test des catégories
    this.apiService.getCategoriesSimple().subscribe({
      next: (categories) => {
        console.log('✅ Categories API Response:', categories);
        console.log('📊 Categories count:', categories?.length || 0);
      },
      error: (error) => {
        console.error('❌ Categories API Error:', error);
      }
    });
  }

  getTabClasses(tabId: string): string {
    const baseClasses = 'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200';

    if (this.activeTab === tabId) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    }
  }

  getActiveTabLabel(): string {
    const activeTabObj = this.tabs.find(tab => tab.id === this.activeTab);
    return activeTabObj?.label || '';
  }

  async handleLogout() {
    const result = await this.authService.signOut();
    if (!result.error) {
      this.router.navigate(['/login']);
    }
  }
}