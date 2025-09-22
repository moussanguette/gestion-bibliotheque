import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css']
})
export class RecentActivityComponent implements OnInit {
  activities: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRecentActivity();
  }

  loadRecentActivity() {
    this.loading = true;
    this.apiService.getActivity({ size: 10 }).subscribe({
      next: (response) => {
        this.activities = response.activities || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recent activity:', error);
        this.activities = [];
        this.loading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'loan':
        return 'loan';
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

  getActivityColor(type: string): string {
    switch (type) {
      case 'loan':
        return 'blue';
      case 'return':
        return 'green';
      case 'book_added':
        return 'purple';
      case 'user_registered':
        return 'indigo';
      default:
        return 'gray';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days}j`;
    }
  }

  trackByActivityId(index: number, activity: any): number {
    return activity.id;
  }

}