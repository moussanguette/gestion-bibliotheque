import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Activity {
  id: number;
  type: string;
  status: string; // Ajout du statut réel
  description: string;
  timestamp: Date | string;
  userEmail: string;
  bookTitle: string;
}

@Component({
  selector: 'app-view-all-activity-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Overlay -->
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close()"></div>

        <!-- Modal -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Toute l'activité
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Liste complète des activités récentes dans la bibliothèque
                </p>
              </div>
              <button
                (click)="close()"
                class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Search Bar -->
            <div class="mt-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterActivities()"
                  placeholder="Rechercher dans les activités..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Filter Buttons -->
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                *ngFor="let filter of filters"
                (click)="setFilter(filter.value)"
                [class]="getFilterButtonClass(filter.value)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            <!-- Loading State -->
            <div *ngIf="loading" class="space-y-4">
              <div *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
                <div class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity List -->
            <div *ngIf="!loading" class="space-y-3">
              <div
                *ngFor="let activity of filteredActivities; trackBy: trackByActivityId"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start space-x-4">
                  <!-- Activity Icon -->
                  <div [class]="'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ' + getActivityIconClass(activity.type)">
                    <!-- Emprunt Icon -->
                    <svg
                      *ngIf="getActivityIcon(activity.type) === 'emprunt'"
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>

                    <!-- Return Icon -->
                    <svg
                      *ngIf="getActivityIcon(activity.type) === 'return'"
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>

                    <!-- Book Icon -->
                    <svg
                      *ngIf="getActivityIcon(activity.type) === 'book'"
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>

                    <!-- User Icon -->
                    <svg
                      *ngIf="getActivityIcon(activity.type) === 'user'"
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>

                    <!-- Info Icon -->
                    <svg
                      *ngIf="getActivityIcon(activity.type) === 'info'"
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>

                  <!-- Activity Content -->
                  <div class="flex-1">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                        <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                          <span>{{ getTimeAgo(activity.timestamp) }}</span>
                          <span>•</span>
                          <span>{{ activity.userEmail }}</span>
                        </div>
                      </div>

                      <!-- Book Badge -->
                      <div *ngIf="activity.bookTitle" class="ml-4 flex-shrink-0">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                          </svg>
                          {{ activity.bookTitle }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && filteredActivities.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune activité trouvée</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ searchTerm || selectedFilter !== 'all'
                  ? 'Aucune activité ne correspond à vos critères de recherche.'
                  : 'Aucune activité disponible pour le moment.'
                }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ filteredActivities.length }} activité{{ filteredActivities.length > 1 ? 's' : '' }} trouvée{{ filteredActivities.length > 1 ? 's' : '' }}
            </div>
            <button
              (click)="close()"
              class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./view-all-activity-modal.component.css']
})
export class ViewAllActivityModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() activities: Activity[] = [];
  @Input() loading = false;
  @Output() onClose = new EventEmitter<void>();

  searchTerm = '';
  selectedFilter = 'all';
  filteredActivities: Activity[] = [];

  filters = [
    { value: 'all', label: 'Toutes' },
    { value: 'ENCOURS', label: 'En cours' },
    { value: 'RETOUR', label: 'Retournés' },
    { value: 'RETARD', label: 'En retard' },
    { value: 'PERDU', label: 'Perdus' },
    { value: 'ENDOMMAGE', label: 'Endommagés' }
  ];

  ngOnInit() {
    this.filterActivities();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activities']) {
      console.log('📥 Modal received new activities:', this.activities.length);
      if (this.activities.length > 0) {
        console.log('📋 Sample activity:', this.activities[0]);
        const types = this.activities.map(a => a.type);
        console.log('🏷️ Activity types received:', [...new Set(types)]);
      }
      this.filterActivities();
    }
  }

  close() {
    this.onClose.emit();
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.filterActivities();
  }

  filterActivities() {
    console.log('🔍 Filtering activities...');
    console.log('📊 Total activities:', this.activities.length);
    console.log('🏷️ Selected filter:', this.selectedFilter);
    console.log('🔎 Search term:', this.searchTerm);

    let filtered = [...this.activities];

    // Log available activity types for debugging
    const uniqueTypes = [...new Set(this.activities.map(a => a.type))];
    const uniqueStatuses = [...new Set(this.activities.map(a => a.status))];
    console.log('📋 Available activity types:', uniqueTypes);
    console.log('📋 Available activity statuses:', uniqueStatuses);

    // Filter by status
    if (this.selectedFilter !== 'all') {
      console.log('🔽 Filtering by status:', this.selectedFilter);
      filtered = filtered.filter(activity => {
        const matches = activity.status === this.selectedFilter;
        if (!matches) {
          console.log(`❌ Activity status "${activity.status}" doesn't match filter "${this.selectedFilter}"`);
        }
        return matches;
      });
      console.log('📊 After status filter:', filtered.length);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      console.log('🔽 Filtering by search term:', searchLower);
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchLower) ||
        activity.userEmail.toLowerCase().includes(searchLower) ||
        activity.bookTitle.toLowerCase().includes(searchLower)
      );
      console.log('📊 After search filter:', filtered.length);
    }

    this.filteredActivities = filtered;
    console.log('✅ Final filtered activities:', this.filteredActivities.length);
  }

  getFilterButtonClass(filterValue: string): string {
    const baseClasses = 'px-3 py-1 text-sm rounded-full border transition-colors';
    if (this.selectedFilter === filterValue) {
      return `${baseClasses} bg-blue-600 text-white border-blue-600`;
    }
    return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'emprunt':
        return 'emprunt';
      case 'return':
        return 'return';
      case 'book_added':
        return 'book';
      case 'user_registered':
        return 'user';
      default:
        return 'info';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'emprunt':
        return 'bg-blue-500';
      case 'return':
        return 'bg-green-500';
      case 'book_added':
        return 'bg-purple-500';
      case 'user_registered':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  }

  getTimeAgo(timestamp: Date | string): string {
    const now = new Date();
    const date = new Date(timestamp);

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
}