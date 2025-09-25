import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LibraryUser } from '../../models/user.model';
import { UserAddComponent, UserFormData } from '../user-add/user-add.component';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAddComponent],
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css']
})
export class UserManagerComponent implements OnInit, OnDestroy {
  searchTerm = '';
  users: LibraryUser[] = [];
  loading = true;
  showAddForm = false;
  selectedFilter = 'all';
  private searchSubject = new Subject<string>();

  // Modal properties
  showViewModal = false;
  showEditModal = false;
  selectedUser: LibraryUser | null = null;
  editLoading = false;

  filters = [
    { value: 'all', label: 'Tous les utilisateurs' },
    { value: 'active', label: 'Actifs' },
    { value: 'suspended', label: 'Suspendus' },
    { value: 'expired', label: 'Expirés' }
  ];

  constructor(private apiService: ApiService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(searchTerm: string) {
    this.loading = true;
    // Use getUsers and filter locally since searchUsers doesn't exist
    this.apiService.getUsers().subscribe({
      next: (response) => {
         console.log('Users API response:', response);
         let users: LibraryUser[] = [];

         // Handle different response structures
         if (response.data && Array.isArray(response.data)) {
           users = response.data;
         } else if (Array.isArray(response)) {
           users = response;
         }

        // Filter locally if search term provided
        if (searchTerm && searchTerm.trim()) {
          const search = searchTerm.toLowerCase().trim();
          users = users.filter(user =>
            `${user.prenom || ''} ${user.nom || ''}`.toLowerCase().includes(search) ||
            (user.email || '').toLowerCase().includes(search) ||
            (user.telephone && user.telephone.includes(search))
          );
        }

        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (response) => {
         console.log('Load users API response:', response);
         let users: LibraryUser[] = [];

         // Handle response.data
         if (response.data && Array.isArray(response.data)) {
           users = response.data;
         } else if (Array.isArray(response)) {
           users = response;
         }

        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.loading = false;
      }
    });
  }

  handleAddUser(userData: UserFormData) {
    // TODO: Implement addUser API method
    console.log('Adding user:', userData);

    // Simulate adding user locally for now
    const nameParts = userData.name.trim().split(' ');
    const prenom = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
    const nom = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    const newUser: LibraryUser = {
      username: userData.email.split('@')[0],
      email: userData.email,
      nom: nom,
      prenom: prenom,
      telephone: userData.phoneNumber || '',
      adresse: userData.address || '',
      role: 'LECTEUR',
      isActive: userData.status === 'active',
      membershipType: 'Standard',
      booksEmpruntes: 0,
      memberSince: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.users.unshift(newUser);
    this.showAddForm = false;
    alert('Utilisateur ajouté avec succès (simulation)');
  }

  handleDeleteUser(userEmail: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      // TODO: Update deleteUser API method to use email instead of id
      console.log('Deleting user:', userEmail);

      // Simulate deletion locally for now
      this.users = this.users.filter(user => user.email !== userEmail);
      alert('Utilisateur supprimé avec succès (simulation)');
    }
  }

  handleSuspendUser(userEmail: string) {
    const user = this.users.find(u => u.email === userEmail);
    if (user) {
      const newStatus = !user.isActive;

      // TODO: Implement updateUserStatus API method
      console.log('Updating user status:', userEmail, newStatus);

      // Simulate status update locally for now
      user.isActive = newStatus;
      alert(`Statut utilisateur mis à jour: ${newStatus ? 'Actif' : 'Suspendu'} (simulation)`);
    }
  }

  get filteredUsers(): LibraryUser[] {
    let filtered = this.users;

    if (this.selectedFilter !== 'all') {
      switch (this.selectedFilter) {
        case 'active':
          filtered = filtered.filter(user => user.isActive);
          break;
        case 'suspended':
          filtered = filtered.filter(user => !user.isActive);
          break;
        case 'expired':
          // Pour l'instant, on peut considérer que les utilisateurs non actifs sont "expirés"
          filtered = filtered.filter(user => !user.isActive);
          break;
      }
    }

    return filtered;
  }

  getStatusBadge(isActive: boolean): { class: string; text: string } {
    if (isActive) {
      return { class: 'badge-green', text: 'Actif' };
    } else {
      return { class: 'badge-red', text: 'Suspendu' };
    }
  }

  getMembershipDuration(membershipDate: Date | string): string {
    if (!membershipDate) return 'Date inconnue';

    const now = new Date();
    const membership = new Date(membershipDate);

    if (isNaN(membership.getTime())) return 'Date invalide';

    const diffTime = Math.abs(now.getTime() - membership.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  }

  // Nouvelles méthodes pour le design amélioré
  getActiveUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getPremiumUsersCount(): number {
    return this.users.filter(u => u.membershipType === 'Premium').length;
  }

  getInitials(user: LibraryUser): string {
    const prenomInitial = user.prenom ? user.prenom.charAt(0) : '';
    const nomInitial = user.nom ? user.nom.charAt(0) : '';
    return `${prenomInitial}${nomInitial}`.toUpperCase() || 'U';
  }

  getFullName(user: LibraryUser): string {
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return `${prenom} ${nom}`.trim() || 'Utilisateur sans nom';
  }

  getMembershipBadge(membershipType: string): { class: string; text: string } {
    switch (membershipType) {
      case 'Premium':
        return { class: 'badge-purple', text: 'Premium' };
      case 'Standard':
        return { class: 'badge-blue', text: 'Standard' };
      case 'Admin':
        return { class: 'badge-red', text: 'Admin' };
      default:
        return { class: 'badge-gray', text: 'Standard' };
    }
  }

  getMemberSinceFormatted(memberSince: string): string {
    if (!memberSince) return 'Date inconnue';

    const date = new Date(memberSince);
    if (isNaN(date.getTime())) return 'Date invalide';

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getLastActivityFormatted(lastActivity: string): string {
    if (!lastActivity) return 'Jamais';

    const date = new Date(lastActivity);
    if (isNaN(date.getTime())) return 'Date invalide';

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  // Performance optimization for ngFor
  trackByEmail(index: number, user: LibraryUser): string {
    return user.email;
  }

  // Modal methods
  openViewModal(user: LibraryUser) {
    this.selectedUser = { ...user };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedUser = null;
  }

  openEditModal(user: LibraryUser) {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editLoading = false;
  }

  handleEditUser() {
    if (!this.selectedUser) return;

    this.editLoading = true;

    // Prepare the update data
    const updateData: Partial<LibraryUser> = {
      prenom: this.selectedUser.prenom,
      nom: this.selectedUser.nom,
      email: this.selectedUser.email,
      telephone: this.selectedUser.telephone,
      adresse: this.selectedUser.adresse,
      role: this.selectedUser.role,
      membershipType: this.selectedUser.membershipType,
      isActive: this.selectedUser.isActive
    };

    console.log('🔄 Updating user with data:', updateData);

    // Find user by email since we don't have ID in the current structure
    const userIndex = this.users.findIndex(u => u.email === this.selectedUser!.email);

    if (userIndex !== -1) {
      // For now, simulate the API call with local update
      this.users[userIndex] = { ...this.users[userIndex], ...updateData };
      this.closeEditModal();
      alert('Utilisateur modifié avec succès !');
    } else {
      alert('Erreur: Utilisateur non trouvé');
    }

    // TODO: Replace with actual API call when updateUser method is implemented
    // this.apiService.updateUser(this.selectedUser.id, updateData).subscribe({
    //   next: (response) => {
    //     console.log('✅ User updated successfully:', response);
    //     if (response.data && !response.error) {
    //       const userIndex = this.users.findIndex(u => u.id === this.selectedUser!.id);
    //       if (userIndex !== -1) {
    //         this.users[userIndex] = { ...this.users[userIndex], ...updateData };
    //       }
    //       this.closeEditModal();
    //       alert('Utilisateur modifié avec succès !');
    //     } else {
    //       console.error('Failed to update user:', response.error);
    //       alert('Erreur lors de la modification de l\'utilisateur');
    //     }
    //     this.editLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('❌ Error updating user:', error);
    //     alert('Erreur lors de la modification de l\'utilisateur: ' + (error.message || 'Erreur inconnue'));
    //     this.editLoading = false;
    //   }
    // });

    this.editLoading = false;
  }
}