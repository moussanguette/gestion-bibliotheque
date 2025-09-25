import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, ChartType, registerables } from 'chart.js';

interface ReportStats {
  activeLoans: number;
  totalBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  availableBooks: number;
  overdueLoans: number;
  dueSoonLoans: number;
  totalLoansThisPeriod: number;
  totalReturnsThisPeriod: number;
  utilizationRate: number;
  averageLoanDuration: number;
}

interface MonthlyData {
  month: string;
  monthCode: string;
  prêts: number;
  retours: number;
  nouveauxUtilisateurs: number;
  nouveauxLivres: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  loansCount: number;
}

interface PopularBook {
  bookId: string;
  title: string;
  author: string;
  category: string;
  count: number;
  isbn: string;
}

interface OverdueStats {
  totalActive: number;
  overdue: number;
  dueSoon: number;
  onTime: number;
  details: any[];
}

interface ActiveUser {
  userId: string;
  userName: string;
  email: string;
  activeLoans: number;
  totalLoans: number;
  averageLoanDuration: number;
  overdue: number;
  memberSince: string;
}

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.css']
})
export class RapportComponent implements OnInit {
  stats: ReportStats = {} as ReportStats;
  monthlyData: MonthlyData[] = [];
  categoryData: CategoryData[] = [];
  topBooksData: PopularBook[] = [];
  overdueStats: OverdueStats = {} as OverdueStats;
  activeUsersData: ActiveUser[] = [];
  selectedPeriod: string = '6months';
  isLoading: boolean = true;
  activeTab: string = 'activity';

  // Modal state properties
  showBookDetailsModal: boolean = false;
  showBookEditModal: boolean = false;
  showCategoryDetailsModal: boolean = false;
  showCategoryEditModal: boolean = false;
  showDeleteModal: boolean = false;

  // Selected items for modals
  selectedBook: PopularBook | null = null;
  selectedCategory: CategoryData | null = null;

  // Edit form properties
  editBookForm: any = {
    title: '',
    author: '',
    category: '',
    isbn: ''
  };
  editCategoryForm: any = {
    name: ''
  };

  // Loading states
  bookUpdateLoading: boolean = false;
  categoryUpdateLoading: boolean = false;
  deleteLoading: boolean = false;

  // Delete operation properties
  deleteType: 'book' | 'category' = 'book';
  deleteItem: any = null;

  private readonly COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Chart configuration
  public loansReturnsChartType: ChartType = 'line';
  public loansReturnsChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Prêts',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Retours',
        data: [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  public categoryChartType: ChartType = 'doughnut';
  public categoryChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: this.COLORS,
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  public overdueStatusChartType: ChartType = 'doughnut';
  public overdueStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['À jour', 'Échéance proche', 'En retard'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  public doughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  constructor(private apiService: ApiService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;

    forkJoin({
      statistics: this.apiService.getReportStatistics(this.selectedPeriod),
      monthlyData: this.apiService.getMonthlyReportData(this.selectedPeriod),
      categoryData: this.apiService.getCategoriesDistribution(),
      topBooks: this.apiService.getPopularBooks(10),
      overdueStats: this.apiService.getOverdueReports(),
      activeUsers: this.apiService.getActiveUsers(10)
    }).subscribe({
      next: (data) => {
        this.stats = data.statistics;
        this.monthlyData = data.monthlyData;
        this.categoryData = data.categoryData;
        this.topBooksData = data.topBooks;
        this.overdueStats = data.overdueStats;
        this.activeUsersData = data.activeUsers;

        // Update chart data
        this.updateChartsData();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.isLoading = false;
      }
    });
  }

  get utilizationRate(): number {
    return this.stats.utilizationRate || 0;
  }

  private updateChartsData(): void {
    // Update loans and returns chart
    if (this.monthlyData && this.monthlyData.length > 0) {
      this.loansReturnsChartData.labels = this.monthlyData.map(data => data.month);
      this.loansReturnsChartData.datasets[0].data = this.monthlyData.map(data => data.prêts);
      this.loansReturnsChartData.datasets[1].data = this.monthlyData.map(data => data.retours);
    }

    // Update category distribution chart
    if (this.categoryData && this.categoryData.length > 0) {
      this.categoryChartData.labels = this.categoryData.map(cat => cat.name);
      this.categoryChartData.datasets[0].data = this.categoryData.map(cat => cat.value);
    }

    // Update overdue status chart
    if (this.overdueStats) {
      this.overdueStatusChartData.datasets[0].data = [
        this.overdueStats.onTime || 0,
        this.overdueStats.dueSoon || 0,
        this.overdueStats.overdue || 0
      ];
    }
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.target.value;
    this.fetchData();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  exportReport() {
    const exportRequest = {
      period: this.selectedPeriod,
      format: 'json',
      includeDetails: true
    };

    // Use the backend export endpoint
    this.apiService.exportReport(exportRequest).subscribe({
      next: (blob) => {
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const exportFileDefaultName = `rapport-bibliotheque-${format(new Date(), 'yyyy-MM-dd')}.json`;

          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', url);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();

          window.URL.revokeObjectURL(url);
        } else {
          // If blob is empty, use full report endpoint as fallback
          this.exportViaFullReport();
        }
      },
      error: (error) => {
        console.error('Error exporting report via POST:', error);
        // Fallback to full report endpoint
        this.exportViaFullReport();
      }
    });
  }

  private exportViaFullReport() {
    this.apiService.getFullReport(this.selectedPeriod, 'json').subscribe({
      next: (fullReport) => {
        this.exportAsJson(fullReport);
      },
      error: (error) => {
        console.error('Error fetching full report:', error);
        // Final fallback to current data
        const reportData = {
          metadata: {
            généréLe: new Date().toISOString(),
            période: this.selectedPeriod,
            version: '1.0',
            type: 'rapport-bibliotheque'
          },
          statistiques: this.stats,
          donneesRetards: this.overdueStats,
          topLivres: this.topBooksData,
          distributionCategories: this.categoryData,
          donnesMensuelles: this.monthlyData,
          utilisateursActifs: this.activeUsersData
        };
        this.exportAsJson(reportData);
      }
    });
  }

  private exportAsJson(reportData: any) {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rapport-bibliotheque-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Book CRUD operations
  viewBookDetails(book: PopularBook): void {
    this.selectedBook = book;
    this.showBookDetailsModal = true;
  }

  closeBookDetailsModal(): void {
    this.showBookDetailsModal = false;
    this.selectedBook = null;
  }

  editBook(book: PopularBook): void {
    this.selectedBook = book;
    this.editBookForm = {
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn
    };
    this.showBookEditModal = true;
  }

  closeBookEditModal(): void {
    this.showBookEditModal = false;
    this.selectedBook = null;
    this.editBookForm = {
      title: '',
      author: '',
      category: '',
      isbn: ''
    };
    this.bookUpdateLoading = false;
  }

  updateBook(): void {
    if (!this.selectedBook) return;

    this.bookUpdateLoading = true;

    // Simulate API call to update book
    setTimeout(() => {
      // Update the book in the local array
      const index = this.topBooksData.findIndex(b => b.bookId === this.selectedBook!.bookId);
      if (index !== -1) {
        this.topBooksData[index] = {
          ...this.topBooksData[index],
          title: this.editBookForm.title,
          author: this.editBookForm.author,
          category: this.editBookForm.category,
          isbn: this.editBookForm.isbn
        };
      }

      this.bookUpdateLoading = false;
      this.closeBookEditModal();

      // Show success message (you can integrate with your notification service)
      console.log('Livre mis à jour avec succès');
    }, 1000);
  }

  deleteBook(book: PopularBook): void {
    this.deleteType = 'book';
    this.deleteItem = book;
    this.showDeleteModal = true;
  }

  // Category CRUD operations
  viewCategoryDetails(category: CategoryData): void {
    this.selectedCategory = category;
    this.showCategoryDetailsModal = true;
  }

  closeCategoryDetailsModal(): void {
    this.showCategoryDetailsModal = false;
    this.selectedCategory = null;
  }

  editCategory(category: CategoryData): void {
    this.selectedCategory = category;
    this.editCategoryForm = {
      name: category.name
    };
    this.showCategoryEditModal = true;
  }

  closeCategoryEditModal(): void {
    this.showCategoryEditModal = false;
    this.selectedCategory = null;
    this.editCategoryForm = {
      name: ''
    };
    this.categoryUpdateLoading = false;
  }

  updateCategory(): void {
    if (!this.selectedCategory) return;

    this.categoryUpdateLoading = true;

    // Simulate API call to update category
    setTimeout(() => {
      // Update the category in the local array
      const index = this.categoryData.findIndex(c => c.name === this.selectedCategory!.name);
      if (index !== -1) {
        this.categoryData[index] = {
          ...this.categoryData[index],
          name: this.editCategoryForm.name
        };
      }

      this.categoryUpdateLoading = false;
      this.closeCategoryEditModal();

      // Show success message (you can integrate with your notification service)
      console.log('Catégorie mise à jour avec succès');
    }, 1000);
  }

  deleteCategory(category: CategoryData): void {
    this.deleteType = 'category';
    this.deleteItem = category;
    this.showDeleteModal = true;
  }

  // Delete operations
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteItem = null;
    this.deleteLoading = false;
  }

  confirmDelete(): void {
    if (!this.deleteItem) return;

    this.deleteLoading = true;

    // Simulate API call to delete item
    setTimeout(() => {
      if (this.deleteType === 'book') {
        // Remove book from local array
        this.topBooksData = this.topBooksData.filter(b => b.bookId !== this.deleteItem.bookId);
        console.log('Livre supprimé avec succès');
      } else if (this.deleteType === 'category') {
        // Remove category from local array
        this.categoryData = this.categoryData.filter(c => c.name !== this.deleteItem.name);
        console.log('Catégorie supprimée avec succès');

        // Update the category chart data
        this.updateChartsData();
      }

      this.deleteLoading = false;
      this.closeDeleteModal();
    }, 1000);
  }
}