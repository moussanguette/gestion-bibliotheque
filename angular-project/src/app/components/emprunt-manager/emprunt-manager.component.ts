import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { EmpruntService } from '../../services/emprunt.service';
import { NotificationService } from '../../services/notification.service';
import { Emprunt, CreateEmpruntRequest, BookSummary, UserSummary, EmpruntFilter } from '../../models/emprunt.model';

@Component({
  selector: 'app-emprunt-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './emprunt-manager.component.html',
  styleUrls: ['./emprunt-manager.component.css']
})
export class EmpruntManagerComponent implements OnInit, OnDestroy {
  emprunts: Emprunt[] = [];
  filteredEmprunts: Emprunt[] = [];
  books: BookSummary[] = [];
  users: UserSummary[] = [];

  isLoading = false;
  isCreatingEmprunt = false;
  isCreateDialogOpen = false;

  // Filter properties
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'returned' | 'overdue' | 'cancelled' = 'all';

  // Form
  empruntForm: FormGroup;

  private subscriptions = new Subscription();

  constructor(
    public empruntService: EmpruntService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.empruntForm = this.fb.group({
      livreId: ['', Validators.required],
      userId: ['', Validators.required],
      dureeJours: [14, [Validators.required, Validators.min(1), Validators.max(30)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.setupFiltering();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    this.isLoading = true;

    const empruntsSubscription = this.empruntService.getAllEmprunts().subscribe({
      next: (emprunts) => {
        this.emprunts = emprunts;
        this.filterEmprunts(); // Appliquer les filtres après le chargement
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading emprunts:', error);
        this.notificationService.showError('Erreur lors du chargement des prêts');
        this.isLoading = false;
      }
    });

    const booksSubscription = this.empruntService.getAvailableBooks().subscribe({
      next: (books) => {
        this.books = books;
        console.log('📚 Loaded books for emprunt component:', books.length);
        if (books.length === 0) {
          this.notificationService.showWarning('Aucun livre disponible pour créer un prêt');
        }
      },
      error: (error) => {
        console.error('❌ Error loading books:', error);
        this.notificationService.showError('Erreur lors du chargement des livres disponibles');
      }
    });

    const usersSubscription = this.empruntService.getEligibleUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('👥 Loaded users for emprunt component:', users.length);
        if (users.length === 0) {
          this.notificationService.showWarning('Aucun utilisateur éligible pour créer un prêt');
        }
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.notificationService.showError('Erreur lors du chargement des utilisateurs éligibles');
      }
    });

    this.subscriptions.add(empruntsSubscription);
    this.subscriptions.add(booksSubscription);
    this.subscriptions.add(usersSubscription);
  }

  private setupFiltering(): void {
    // Set up reactive filtering whenever search term or status changes
    // This would ideally use reactive forms, but for simplicity using manual filtering
    this.filterEmprunts();
  }

  filterEmprunts(): void {
    this.filteredEmprunts = this.empruntService.filterEmprunts(this.emprunts, this.searchTerm, this.filterStatus);
  }

  onSearchChange(): void {
    this.filterEmprunts();
  }

  onStatusFilterChange(): void {
    this.filterEmprunts();
  }

  openCreateDialog(): void {
    this.isCreateDialogOpen = true;
    this.empruntForm.reset();

    // Set default duration to 14 days
    this.empruntForm.patchValue({
      dureeJours: 14
    });

    // Reload books and users data to ensure we have the latest available data
    this.loadBooksAndUsers();
  }

  private loadBooksAndUsers(): void {
    // Load books
    this.empruntService.getAvailableBooks().subscribe({
      next: (books) => {
        this.books = books;
        console.log('📚 Refreshed books for dialog:', books.length);
      },
      error: (error) => {
        console.error('❌ Error refreshing books:', error);
        this.notificationService.showError('Erreur lors du chargement des livres');
      }
    });

    // Load users
    this.empruntService.getEligibleUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('👥 Refreshed users for dialog:', users.length);
      },
      error: (error) => {
        console.error('❌ Error refreshing users:', error);
        this.notificationService.showError('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  closeCreateDialog(): void {
    this.isCreateDialogOpen = false;
    this.empruntForm.reset();
  }

  createEmprunt(): void {
    if (this.empruntForm.valid) {
      this.isCreatingEmprunt = true;

      const formValue = this.empruntForm.value;

      console.log('🔍 Form values before processing:', formValue);
      console.log('📝 Raw userId:', formValue.userId, 'Type:', typeof formValue.userId);
      console.log('📝 Raw livreId:', formValue.livreId, 'Type:', typeof formValue.livreId);

      const userId = parseInt(formValue.userId);
      const livreId = parseInt(formValue.livreId);
      const dureeJours = parseInt(formValue.dureeJours);

      // Validation des données converties
      if (isNaN(userId)) {
        console.error('❌ Invalid userId - cannot convert to number:', formValue.userId);
        this.notificationService.showError('Utilisateur sélectionné invalide');
        this.isCreatingEmprunt = false;
        return;
      }

      if (isNaN(livreId)) {
        console.error('❌ Invalid livreId - cannot convert to number:', formValue.livreId);
        this.notificationService.showError('Livre sélectionné invalide');
        this.isCreatingEmprunt = false;
        return;
      }

      if (isNaN(dureeJours) || dureeJours <= 0) {
        console.error('❌ Invalid dureeJours:', formValue.dureeJours);
        this.notificationService.showError('Durée invalide');
        this.isCreatingEmprunt = false;
        return;
      }

      const empruntRequest: CreateEmpruntRequest = {
        userId: userId,
        livreId: livreId,
        dureeJours: dureeJours
      };

      console.log('📤 Sending emprunt request:', empruntRequest);

      this.empruntService.createEmprunt(empruntRequest).subscribe({
        next: (emprunt) => {
          this.notificationService.showSuccess('Prêt créé avec succès');
          this.closeCreateDialog();
          this.loadData();
          this.isCreatingEmprunt = false;
        },
        error: (error) => {
          console.error('Error creating emprunt:', error);
          this.notificationService.showError('Erreur lors de la création du prêt');
          this.isCreatingEmprunt = false;
        }
      });
    }
  }

  returnBook(empruntId: string): void {
    this.empruntService.returnBook(empruntId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Livre retourné avec succès');
        this.loadData();
      },
      error: (error) => {
        console.error('Error returning book:', error);
        this.notificationService.showError('Erreur lors du retour du livre');
      }
    });
  }

  renewEmprunt(empruntId: string): void {
    this.empruntService.renewEmprunt(empruntId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Prêt renouvelé avec succès');
        this.loadData();
      },
      error: (error) => {
        console.error('Error renewing emprunt:', error);
        this.notificationService.showError('Erreur lors du renouvellement');
      }
    });
  }

  // Helper methods for template
  getDaysUntilDue(dueDate: Date): string {
    const days = this.empruntService.getDaysUntilDue(dueDate);
    if (days < 0) {
      return `En retard de ${Math.abs(days)} jour(s)`;
    } else if (days === 0) {
      return 'Échéance aujourd\'hui';
    } else if (days === 1) {
      return 'Échéance demain';
    } else {
      return `Échéance dans ${days} jour(s)`;
    }
  }

  getStatusBadgeClass(emprunt: Emprunt): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClass = this.getStatusColorClass(emprunt);
    return `${baseClass} ${colorClass}`;
  }

  private getStatusColorClass(emprunt: Emprunt): string {
    if (emprunt.status === 'returned') return 'bg-green-100 text-green-800';
    if (emprunt.status === 'cancelled') return 'bg-gray-100 text-gray-800';
    if (this.empruntService.isOverdue(emprunt.dueDate, emprunt.status)) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  }

  getStatusText(emprunt: Emprunt): string {
    return this.empruntService.getStatusText(emprunt);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  canReturn(emprunt: Emprunt): boolean {
    return emprunt.status === 'active' || emprunt.status === 'overdue';
  }

  canRenew(emprunt: Emprunt): boolean {
    return emprunt.status === 'active' && emprunt.renewalCount < emprunt.maxRenewals;
  }

  trackByEmpruntId(index: number, emprunt: Emprunt): string {
    return emprunt.id;
  }
}