import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { StatsCardsComponent } from '../stats-cards/stats-cards.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { BookManagerComponent } from '../book-manager/book-manager.component';
import { UserManagerComponent } from '../user-manager/user-manager.component';
import { EmpruntManagerComponent } from '../emprunt-manager/emprunt-manager.component';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { RapportComponent } from '../rapports/rapport.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCardsComponent,
    RecentActivityComponent,
    BookManagerComponent,
    UserManagerComponent,
    EmpruntManagerComponent,
    NotificationBannerComponent,
    RapportComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  activeTab = 'overview';
  dueSoonEmprunts: any[] = [];
  loading = false;

  // Modal properties
  showEditModal = false;
  selectedEmprunt: any = null;
  newDateRetour = '';
  modalLoading = false;

  tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'books', label: 'Livres' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'emprunts', label: 'Prêts' },
    { id: 'reports', label: 'Rapports' }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.testAPIConnection();
    this.loadDueSoonEmprunts();

    // Afficher une notification de bienvenue
    if (this.user) {
      this.notificationService.showSuccess(
        `Connecté en tant que ${this.user.email}`,
        'Bienvenue dans BiblioManager!',
        5000
      );
    }
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

        this.notificationService.showInfo(
          `${books.length} livres trouvés dans la base de données`,
          'Connexion API réussie',
          5000
        );

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
        this.notificationService.showError(
          'Impossible de se connecter à l\'API des livres',
          'Erreur de connexion',
          true
        );
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
        this.notificationService.showWarning(
          'Problème lors du chargement des auteurs'
        );
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
        this.notificationService.showWarning(
          'Problème lors du chargement des catégories'
        );
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

  loadDueSoonEmprunts() {
    this.loading = true;
    this.apiService.getDueSoonEmprunts().subscribe({
      next: (response) => {
        console.log('✅ Due Soon Emprunts Response:', response);
        this.dueSoonEmprunts = response.data || [];
        console.log('📊 Due Soon Emprunts count:', this.dueSoonEmprunts.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Due Soon Emprunts Error:', error);
        this.notificationService.showError(
          'Erreur lors du chargement des prêts bientôt en échéance'
        );
        this.loading = false;
      }
    });
  }

  getDueDateLabel(dueDate: Date | string, empruntDate: Date | string): { text: string, class: string } {
    if (!dueDate || !empruntDate) {
      return { text: 'Date non définie', class: 'error' };
    }

    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const borrowDateObj = new Date(empruntDate);

    // Vérifier si les dates sont valides
    if (isNaN(dueDateObj.getTime()) || isNaN(borrowDateObj.getTime())) {
      return { text: 'Date invalide', class: 'error' };
    }

    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`, class: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Aujourd\'hui', class: 'urgent' };
    } else if (diffDays === 1) {
      return { text: 'Demain', class: 'warning' };
    } else if (diffDays <= 7) {
      return { text: `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`, class: 'info' };
    } else {
      return { text: `Dans ${diffDays} jours`, class: 'info' };
    }
  }

  openEditModal(emprunt: any) {
    this.selectedEmprunt = emprunt;
    this.newDateRetour = emprunt.dueDate || '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedEmprunt = null;
    this.newDateRetour = '';
    this.modalLoading = false;
  }

  async updateDateRetour() {
    if (!this.selectedEmprunt || !this.newDateRetour) {
      this.notificationService.showError('Veuillez sélectionner une date d\'échéance');
      return;
    }

    this.modalLoading = true;

    try {
      await this.apiService.updateEmprunt(this.selectedEmprunt.id, {
        dueDate: new Date(this.newDateRetour)
      }).toPromise();

      this.notificationService.showSuccess('Date d\'échéance modifiée avec succès');

      // Mettre à jour l'emprunt dans la liste locale
      const index = this.dueSoonEmprunts.findIndex(e => e.id === this.selectedEmprunt.id);
      if (index !== -1) {
        this.dueSoonEmprunts[index].dueDate = this.newDateRetour;
      }

      this.closeEditModal();

      // Recharger la liste pour avoir les données à jour
      this.loadDueSoonEmprunts();

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      this.notificationService.showError('Erreur lors de la modification de la date d\'échéance');
    } finally {
      this.modalLoading = false;
    }
  }

  async handleLogout() {
    const result = await this.authService.signOut();
    if (!result.error) {
      this.notificationService.showSuccess('Déconnexion réussie', 'À bientôt!');
      this.router.navigate(['/login']);
    } else {
      this.notificationService.showError('Erreur lors de la déconnexion');
    }
  }
}