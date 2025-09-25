import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Book, BookFormData } from '../models/book.model';
import { LibraryUser } from '../models/user.model';
import { Emprunt, CreateEmpruntRequest } from '../models/emprunt.model';
import { ApiResponse, LibraryStats, ActivityItem, ActivityResponse, StatsResponse } from '../models/api-response.model';
import { Author, Category } from '../models/book.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private async getHeaders(): Promise<HttpHeaders> {
    const headers = await this.authService.getAuthHeaders();
    return new HttpHeaders(headers);
  }

  private handleRequest<T>(request: Promise<any>): Observable<ApiResponse<T>> {
    return from(request).pipe(
      map(response => ({ data: response })),
      catchError(error => {
        console.error('API Error:', error);
        return of({ error: error.message || 'Erreur réseau' });
      })
    );
  }

  // Books methods (Livres)
  getBooks(): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/livres`, { headers }).toPromise()
      )
    );
  }

  getBookById(id: string): Observable<ApiResponse<Book>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book>(`${environment.api.baseUrl}/livres/${id}`, { headers }).toPromise()
      )
    );
  }

  getAvailableBooks(): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/livres/disponibles`, { headers }).toPromise()
      )
    );
  }

  getBorrowedBooks(): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/livres/empruntes`, { headers }).toPromise()
      )
    );
  }

  getActiveBooks(): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/livres/actifs`, { headers }).toPromise()
      )
    );
  }

  getBooksByStatus(status: string): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/livres/filtre?status=${status}`, { headers }).toPromise()
      )
    );
  }

  checkBookAvailability(id: string): Observable<ApiResponse<{ available: boolean; copies: number }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<{ available: boolean; copies: number }>(`${environment.api.baseUrl}/livres/${id}/disponibilite`, { headers }).toPromise()
      )
    );
  }

  addBook(book: BookFormData): Observable<ApiResponse<Book>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<Book>(`${environment.api.baseUrl}/livres`, book, { headers }).toPromise()
      )
    );
  }

  addLivreWithExampleSchema(livreData: any): Observable<ApiResponse<Book>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<Book>(`${environment.api.baseUrl}/livres`, livreData, { headers }).toPromise()
      )
    );
  }

  updateBook(id: string, updates: Partial<Book>): Observable<ApiResponse<Book>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<Book>(`${environment.api.baseUrl}/livres/${id}`, updates, { headers }).toPromise()
      )
    );
  }

  deleteBook(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/livres/${id}`, { headers }).toPromise()
      )
    );
  }

  searchBooks(params: {
    q?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.orderDir) queryParams.append('orderDir', params.orderDir);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/livres?${queryParams.toString()}`, { headers }).toPromise()
      )
    );
  }

  // Users methods
  getUsers(): Observable<ApiResponse<LibraryUser[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<LibraryUser[]>(`${environment.api.baseUrl}/users`, { headers }).toPromise()
      )
    );
  }

  getUserById(id: string): Observable<ApiResponse<LibraryUser>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<LibraryUser>(`${environment.api.baseUrl}/users/${id}`, { headers }).toPromise()
      )
    );
  }

  createUser(user: Partial<LibraryUser>): Observable<ApiResponse<LibraryUser>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<LibraryUser>(`${environment.api.baseUrl}/users`, user, { headers }).toPromise()
      )
    );
  }

  updateUser(id: string, updates: Partial<LibraryUser>): Observable<ApiResponse<LibraryUser>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<LibraryUser>(`${environment.api.baseUrl}/users/${id}`, updates, { headers }).toPromise()
      )
    );
  }

  deleteUser(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/users/${id}`, { headers }).toPromise()
      )
    );
  }

  // Emprunts methods (Emprunts)
  getEmprunts(): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts`, { headers }).toPromise()
      )
    );
  }

  getEmpruntById(id: string): Observable<ApiResponse<Emprunt>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt>(`${environment.api.baseUrl}/emprunts/${id}`, { headers }).toPromise()
      )
    );
  }

  getActiveEmprunts(): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/actifs`, { headers }).toPromise()
      )
    );
  }

  getOverdueEmprunts(): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/retard`, { headers }).toPromise()
      )
    );
  }

  getDueSoonEmprunts(): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/bientot-echeance`, { headers }).toPromise()
      )
    );
  }

  getEmpruntsByUser(userId: string): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/user/${userId}`, { headers }).toPromise()
      )
    );
  }

  getEmpruntsByBook(bookId: string): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/livre/${bookId}`, { headers }).toPromise()
      )
    );
  }

  getEmpruntsByStatus(status: string): Observable<ApiResponse<Emprunt[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Emprunt[]>(`${environment.api.baseUrl}/emprunts/status/${status}`, { headers }).toPromise()
      )
    );
  }

  getAvailableBooksForEmprunt(): Observable<ApiResponse<Book[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Book[]>(`${environment.api.baseUrl}/emprunts/livres-disponibles`, { headers }).toPromise()
      )
    );
  }

  getAvailableCopies(bookId: string): Observable<ApiResponse<{ count: number }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<{ count: number }>(`${environment.api.baseUrl}/emprunts/livre/${bookId}/exemplaires-disponibles`, { headers }).toPromise()
      )
    );
  }

  isBookAvailable(bookId: string): Observable<ApiResponse<{ available: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<{ available: boolean }>(`${environment.api.baseUrl}/emprunts/livre/${bookId}/disponible`, { headers }).toPromise()
      )
    );
  }

  createEmprunt(empruntData: CreateEmpruntRequest): Observable<ApiResponse<Emprunt>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<Emprunt>(`${environment.api.baseUrl}/emprunts`, empruntData, { headers }).toPromise()
      )
    );
  }

  createDirectEmprunt(empruntData: any): Observable<ApiResponse<Emprunt>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<Emprunt>(`${environment.api.baseUrl}/emprunts/direct`, empruntData, { headers }).toPromise()
      )
    );
  }

  updateEmprunt(id: string, updates: Partial<Emprunt>): Observable<ApiResponse<Emprunt>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<Emprunt>(`${environment.api.baseUrl}/emprunts/${id}`, updates, { headers }).toPromise()
      )
    );
  }

  returnBook(empruntId: string): Observable<ApiResponse<Emprunt>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<Emprunt>(`${environment.api.baseUrl}/emprunts/${empruntId}/retourner`, {}, { headers }).toPromise()
      )
    );
  }

  deleteEmprunt(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/emprunts/${id}`, { headers }).toPromise()
      )
    );
  }

  // Authors methods (Auteurs)
  getAuthors(): Observable<ApiResponse<Author[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Author[]>(`${environment.api.baseUrl}/auteurs`, { headers }).toPromise()
      )
    );
  }

  getAuthorById(id: string): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/auteurs/${id}`, { headers }).toPromise()
      )
    );
  }

  createAuthor(author: any): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<any>(`${environment.api.baseUrl}/auteurs`, author, { headers }).toPromise()
      )
    );
  }

  updateAuthor(id: string, updates: any): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<any>(`${environment.api.baseUrl}/auteurs/${id}`, updates, { headers }).toPromise()
      )
    );
  }

  deleteAuthor(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/auteurs/${id}`, { headers }).toPromise()
      )
    );
  }

  // Notifications methods
  getNotifications(): Observable<ApiResponse<any[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any[]>(`${environment.api.baseUrl}/notifications`, { headers }).toPromise()
      )
    );
  }

  getNotificationById(id: string): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/notifications/${id}`, { headers }).toPromise()
      )
    );
  }

  getUserNotifications(userId: string): Observable<ApiResponse<any[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any[]>(`${environment.api.baseUrl}/notifications/user/${userId}`, { headers }).toPromise()
      )
    );
  }

  getUnreadNotifications(userId: string): Observable<ApiResponse<any[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<any[]>(`${environment.api.baseUrl}/notifications/user/${userId}/unread`, { headers }).toPromise()
      )
    );
  }

  getUnreadNotificationCount(userId: string): Observable<ApiResponse<{ count: number }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<{ count: number }>(`${environment.api.baseUrl}/notifications/user/${userId}/count-unread`, { headers }).toPromise()
      )
    );
  }

  createNotification(notification: any): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<any>(`${environment.api.baseUrl}/notifications`, notification, { headers }).toPromise()
      )
    );
  }

  markNotificationAsRead(id: string): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<any>(`${environment.api.baseUrl}/notifications/${id}/read`, {}, { headers }).toPromise()
      )
    );
  }

  markAllNotificationsAsRead(userId: string): Observable<ApiResponse<any>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<any>(`${environment.api.baseUrl}/notifications/user/${userId}/read-all`, {}, { headers }).toPromise()
      )
    );
  }

  deleteNotification(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/notifications/${id}`, { headers }).toPromise()
      )
    );
  }

  // Activity methods (pour l'activité récente)
  getRecentActivity(): Observable<ApiResponse<ActivityResponse>> {
    // Cette méthode peut être implémentée côté backend pour agréger l'activité
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<ActivityResponse>(`${environment.api.baseUrl}/activity`, { headers }).toPromise()
      )
    );
  }

  // Categories methods (Catégories)
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Category[]>(`${environment.api.baseUrl}/categories`, { headers }).toPromise()
      )
    );
  }

  getCategoryById(id: string): Observable<ApiResponse<Category>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.get<Category>(`${environment.api.baseUrl}/categories/${id}`, { headers }).toPromise()
      )
    );
  }

  createCategory(category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.post<Category>(`${environment.api.baseUrl}/categories`, category, { headers }).toPromise()
      )
    );
  }

  updateCategory(id: string, updates: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.put<Category>(`${environment.api.baseUrl}/categories/${id}`, updates, { headers }).toPromise()
      )
    );
  }

  deleteCategory(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.handleRequest(
      this.getHeaders().then(headers =>
        this.http.delete<{ success: boolean }>(`${environment.api.baseUrl}/categories/${id}`, { headers }).toPromise()
      )
    );
  }

  // Get all books (for the new API structure)
  getAllBooks(): Observable<any> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/livres`, { headers }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching books:', error);
        return of({
          data: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0
        });
      })
    );
  }

  // Simple method to get authors as array (for compatibility)
  getAuthorsSimple(): Observable<any[]> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any[]>(`${environment.api.baseUrl}/auteurs`, { headers }).toPromise()
      )
    ).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching authors:', error);
        return of([]);
      })
    );
  }

  // Simple method to get categories as array (for compatibility)
  getCategoriesSimple(): Observable<any[]> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any[]>(`${environment.api.baseUrl}/categories`, { headers }).toPromise()
      )
    ).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  // Stats methods
  getStats(): Observable<any> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/stats`, { headers }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching stats:', error);
        return of({
          totalBooks: 0,
          totalUsers: 0,
          totalEmprunts: 0,
          activeEmprunts: 0,
          overdue: 0,
          totalLivresPrets: 0,
          totalEnRetard: 0,
          popularBooks: [],
          recentActivity: [],
          monthlyStats: {
            empruntsThisMonth: 0,
            returnsThisMonth: 0,
            newBooksThisMonth: 0,
            newUsersThisMonth: 0
          }
        });
      })
    );
  }

  getActivity(params?: {
    page?: number;
    size?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/activity`, {
          headers,
          params: httpParams
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching activity:', error);
        return of({
          activities: [],
          pagination: {
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
          }
        });
      })
    );
  }

  // Reports endpoints
  getReportStatistics(period: string = '6months'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/statistics`, {
          headers,
          params
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching report statistics:', error);
        return of({
          activeLoans: 0,
          totalBooks: 0,
          borrowedBooks: 0,
          totalUsers: 0,
          availableBooks: 0,
          overdueLoans: 0,
          dueSoonLoans: 0,
          totalLoansThisPeriod: 0,
          totalReturnsThisPeriod: 0,
          utilizationRate: 0,
          averageLoanDuration: 0
        });
      })
    );
  }

  getOverdueReports(): Observable<any> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/overdue`, { headers }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching overdue reports:', error);
        return of({
          totalActive: 0,
          overdue: 0,
          dueSoon: 0,
          onTime: 0,
          details: []
        });
      })
    );
  }

  getPopularBooks(limit: number = 10): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/popular-books`, {
          headers,
          params
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching popular books:', error);
        return of([]);
      })
    );
  }

  getCategoriesDistribution(): Observable<any> {
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/categories-distribution`, { headers }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching categories distribution:', error);
        return of([]);
      })
    );
  }

  getMonthlyReportData(period: string = '6months'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/monthly-data`, {
          headers,
          params
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching monthly data:', error);
        return of([]);
      })
    );
  }

  getActiveUsers(limit: number = 50): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/active-users`, {
          headers,
          params
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching active users:', error);
        return of([]);
      })
    );
  }

  getFullReport(period: string = '6months', format: string = 'json'): Observable<any> {
    const params = new HttpParams()
      .set('period', period)
      .set('format', format);
    return from(
      this.getHeaders().then(headers =>
        this.http.get<any>(`${environment.api.baseUrl}/reports/full`, {
          headers,
          params
        }).toPromise()
      )
    ).pipe(
      catchError(error => {
        console.error('Error fetching full report:', error);
        return of({
          metadata: {},
          statistiques: {},
          donneesRetards: {},
          topLivres: [],
          distributionCategories: [],
          donnesMensuelles: [],
          utilisateursActifs: [],
          performanceSysteme: {},
          recommandations: []
        });
      })
    );
  }

  exportReport(reportData: any): Observable<Blob> {
    return from(
      this.getHeaders().then(headers =>
        this.http.post(`${environment.api.baseUrl}/reports/export`, reportData, {
          headers,
          responseType: 'blob'
        }).toPromise()
      )
    ).pipe(
      map(blob => blob || new Blob()),
      catchError(error => {
        console.error('Error exporting report:', error);
        return of(new Blob());
      })
    );
  }
}