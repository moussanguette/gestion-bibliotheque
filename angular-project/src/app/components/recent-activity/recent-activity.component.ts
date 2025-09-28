import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ViewAllActivityModalComponent } from '../view-all-activity-modal/view-all-activity-modal.component';

interface Activity {
  id: number;
  type: string;
  status: string;
  description: string;
  timestamp: Date | string;
  userEmail: string;
  bookTitle: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, ViewAllActivityModalComponent],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css']
})
export class RecentActivityComponent implements OnInit {
  activities: Activity[] = [];
  allActivities: Activity[] = [];
  loading = true;
  showAllModal = false;
  modalLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRecentActivity();
  }

  loadRecentActivity() {
    this.loading = true;
    console.log('🔄 Loading recent activity from emprunts...');

    // Utiliser les emprunts comme source d'activité récente
    this.apiService.getEmprunts().subscribe({
      next: (response) => {
        console.log('✅ Emprunts response for activity:', response);
        const emprunts = response.data || [];

        // Log des statuts pour debugging
        console.log('📋 All emprunts statuses:', emprunts.map(e => ({ id: e.id, status: e.status })));

        // Convertir les emprunts en activités
        const allConverted = emprunts
          .map((emprunt: any): Activity => ({
            id: emprunt.id,
            type: this.getActivityType(emprunt.status),
            status: emprunt.status || 'ENCOURS',
            description: this.createActivityDescription(emprunt),
            timestamp: emprunt.createdAt || emprunt.dateEmprunt || emprunt.updatedAt || new Date(),
            userEmail: emprunt.user?.email || emprunt.user?.username || 'Utilisateur inconnu',
            bookTitle: emprunt.livre?.titre || emprunt.book?.titre || 'Livre inconnu'
          }))
          .sort((a: Activity, b: Activity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Trier par date décroissante

        this.allActivities = allConverted; // Stocker toutes les activités pour le modal
        this.activities = allConverted.slice(0, 4); // Limiter à 4 éléments pour l'affichage principal

        console.log('📊 Converted activities:', this.activities);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading recent activity from emprunts:', error);

        // Fallback: essayer l'API d'activité originale
        this.apiService.getActivity({ size: 4 }).subscribe({
          next: (response) => {
            console.log('✅ Fallback activity API response:', response);
            this.activities = response.activities || response.data || [];
            this.loading = false;
          },
          error: (fallbackError) => {
            console.error('❌ Fallback activity API also failed:', fallbackError);
            this.activities = [];
            this.loading = false;
          }
        });
      }
    });
  }

  getActivityType(status: string): string {
    console.log('🏷️ Determining activity type for status:', status);

    if (!status) {
      console.log('❌ No status provided, defaulting to emprunt');
      return 'emprunt';
    }

    const statusUpper = status.toUpperCase();

    if (statusUpper === 'RETOUR') {
      console.log('✅ Status indicates return');
      return 'return';
    } else if (statusUpper === 'ENCOURS') {
      console.log('✅ Status indicates active loan');
      return 'emprunt';
    } else if (statusUpper === 'RETARD') {
      console.log('⚠️ Status indicates overdue loan');
      return 'overdue';
    } else if (statusUpper === 'PERDU') {
      console.log('❌ Status indicates lost item');
      return 'lost';
    } else if (statusUpper === 'ENDOMMAGE') {
      console.log('🔧 Status indicates damaged item');
      return 'damaged';
    } else {
      console.log('⚠️ Unknown status, defaulting to emprunt');
      return 'emprunt';
    }
  }

  createActivityDescription(emprunt: any): string {
    // Essayer différentes combinaisons de nom
    let userName = 'Un utilisateur';
    if (emprunt.user) {
      if (emprunt.user.nom && emprunt.user.prenom) {
        userName = `${emprunt.user.prenom} ${emprunt.user.nom}`;
      } else if (emprunt.user.nom) {
        userName = emprunt.user.nom;
      } else if (emprunt.user.prenom) {
        userName = emprunt.user.prenom;
      } else if (emprunt.user.username) {
        userName = emprunt.user.username;
      } else if (emprunt.user.email) {
        userName = emprunt.user.email;
      }
    }

    const bookTitle = emprunt.livre?.titre || emprunt.book?.titre || 'un livre';

    // Déterminer le type d'activité basé sur le type calculé
    const activityType = this.getActivityType(emprunt.status);

    if (activityType === 'return') {
      return `${userName} a retourné "${bookTitle}"`;
    } else if (activityType === 'overdue') {
      return `${userName} est en retard pour "${bookTitle}"`;
    } else if (activityType === 'lost') {
      return `${userName} a perdu "${bookTitle}"`;
    } else if (activityType === 'damaged') {
      return `${userName} a endommagé "${bookTitle}"`;
    } else {
      return `${userName} a emprunté "${bookTitle}"`;
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'emprunt':
        return 'emprunt';
      case 'return':
        return 'return';
      case 'overdue':
        return 'emprunt';
      case 'lost':
        return 'info';
      case 'damaged':
        return 'info';
      case 'book_added':
        return 'book';
      case 'user_registered':
        return 'user';
      default:
        return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'emprunt':
        return 'blue';
      case 'return':
        return 'green';
      case 'overdue':
        return 'red';
      case 'lost':
        return 'red';
      case 'damaged':
        return 'orange';
      case 'book_added':
        return 'purple';
      case 'user_registered':
        return 'indigo';
      default:
        return 'gray';
    }
  }

  getTimeAgo(timestamp: Date | string): string {
    const now = new Date();
    const date = new Date(timestamp);

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return 'Dans le futur';
    } else if (minutes < 1) {
      return 'À l\'instant';
    } else if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days}j`;
    }
  }

  trackByActivityId(index: number, activity: Activity): number {
    return activity.id;
  }

  openViewAllModal() {
    this.showAllModal = true;
    this.loadAllActivities();
  }

  closeViewAllModal() {
    this.showAllModal = false;
  }

  loadAllActivities() {
    if (this.allActivities.length > 0) {
      // Si on a déjà des données, pas besoin de recharger
      return;
    }

    this.modalLoading = true;
    console.log('🔄 Loading all activities for modal...');

    this.apiService.getEmprunts().subscribe({
      next: (response) => {
        console.log('✅ All emprunts response for modal:', response);
        const emprunts = response.data || [];

        // Log des statuts pour debugging (modal)
        console.log('📋 Modal - All emprunts statuses:', emprunts.map(e => ({ id: e.id, status: e.status })));

        // Convertir tous les emprunts en activités (sans limite)
        this.allActivities = emprunts
          .map((emprunt: any): Activity => ({
            id: emprunt.id,
            type: this.getActivityType(emprunt.status),
            status: emprunt.status || 'ENCOURS',
            description: this.createActivityDescription(emprunt),
            timestamp: emprunt.createdAt || emprunt.dateEmprunt || emprunt.updatedAt || new Date(),
            userEmail: emprunt.user?.email || emprunt.user?.username || 'Utilisateur inconnu',
            bookTitle: emprunt.livre?.titre || emprunt.book?.titre || 'Livre inconnu'
          }))
          .sort((a: Activity, b: Activity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        console.log('📊 All activities loaded for modal:', this.allActivities.length);
        this.modalLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading all activities for modal:', error);
        this.modalLoading = false;
      }
    });
  }

}