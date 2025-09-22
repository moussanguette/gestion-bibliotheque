import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.apiService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  getStatCards() {
    if (!this.stats) return [];

    return [
      {
        id: 'books',
        title: 'Total des livres',
        value: this.stats.totalBooks.toLocaleString(),
        change: `+${this.stats.monthlyStats.newBooksThisMonth}`,
        changeLabel: 'ce mois',
        icon: 'book',
        color: 'blue',
        trend: this.stats.monthlyStats.newBooksThisMonth > 0 ? 'up' : 'neutral'
      },
      {
        id: 'users',
        title: 'Utilisateurs actifs',
        value: this.stats.totalUsers.toLocaleString(),
        change: `+${this.stats.monthlyStats.newUsersThisMonth}`,
        changeLabel: 'ce mois',
        icon: 'users',
        color: 'green',
        trend: this.stats.monthlyStats.newUsersThisMonth > 0 ? 'up' : 'neutral'
      },
      {
        id: 'loans',
        title: 'Prêts en cours',
        value: this.stats.activeLoans.toLocaleString(),
        change: this.getLoansChange(),
        changeLabel: 'vs objectif',
        icon: 'clock',
        color: 'yellow',
        trend: this.stats.activeLoans > 50 ? 'up' : 'down'
      },
      {
        id: 'overdue',
        title: 'Retards',
        value: this.stats.overdue.toLocaleString(),
        change: this.getOverdueChange(),
        changeLabel: 'à traiter',
        icon: 'warning',
        color: 'red',
        trend: this.stats.overdue > 0 ? 'up' : 'down'
      }
    ];
  }

  private getLoansChange(): string {
    const percentage = (this.stats!.activeLoans / 100) * 100;
    return `${percentage.toFixed(0)}%`;
  }

  private getOverdueChange(): string {
    if (this.stats!.activeLoans === 0) return '0%';
    const percentage = (this.stats!.overdue / this.stats!.activeLoans) * 100;
    return `${percentage.toFixed(1)}%`;
  }

}