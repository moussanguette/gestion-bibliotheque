import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Emprunt, CreateEmpruntRequest, EmpruntStats, BookSummary, UserSummary } from '../models/emprunt.model';
import { Book, Author } from '../models/book.model';
import { LibraryUser } from '../models/user.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpruntService {
  private apiUrl = `${environment.api.baseUrl}/emprunts`;
  private empruntsSubject = new BehaviorSubject<Emprunt[]>([]);
  public emprunts$ = this.empruntsSubject.asObservable();

  // Temporary mapping for email to numeric ID
  private emailToIdMap = new Map<string, number>();
  private nextId = 1;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // Get all emprunts
  getAllEmprunts(): Observable<Emprunt[]> {
    return this.http.get<any>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          const backendEmprunts = response || [];
          return backendEmprunts.map((backendEmprunt: any) => this.transformBackendEmprunt(backendEmprunt));
        }),
        tap(emprunts => this.empruntsSubject.next(emprunts))
      );
  }

  // Get emprunt by ID
  getEmpruntById(id: string): Observable<Emprunt> {
    return this.http.get<{ data: Emprunt }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Create new emprunt
  createEmprunt(emprunt: CreateEmpruntRequest): Observable<Emprunt> {
    return this.http.post<any>(`${this.apiUrl}`, emprunt)
      .pipe(
        map(response => this.transformBackendEmprunt(response)),
        tap(() => this.refreshEmprunts())
      );
  }

  // Return book
  returnBook(empruntId: string): Observable<Emprunt> {
    return this.http.put<{ data: Emprunt }>(`${this.apiUrl}/${empruntId}/retourner`, {})
      .pipe(
        map(response => response.data),
        tap(() => this.refreshEmprunts())
      );
  }

  // Renew emprunt
  renewEmprunt(empruntId: string): Observable<Emprunt> {
    return this.http.patch<{ data: Emprunt }>(`${this.apiUrl}/${empruntId}`, {})
      .pipe(
        map(response => response.data),
        tap(() => this.refreshEmprunts())
      );
  }

  // Get overdue emprunts
  getOverdueEmprunts(): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/retard`)
      .pipe(map(response => response.data || []));
  }

  // Get emprunts by user
  getEmpruntsByUser(userId: string): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(response => response.data || []));
  }

  // Get available books for emprunt
  getAvailableBooks(): Observable<BookSummary[]> {
    console.log('🔍 Fetching available books for emprunt...');
    return this.apiService.getAllBooks().pipe(
      map(response => {
        console.log('📚 Raw books API response:', response);
        if (response.error) {
          console.error('❌ Error fetching books:', response.error);
          return [];
        }
        const books = response.data || [];
        console.log('📊 Total books found:', books.length);

        // Transform books to BookSummary format and filter available ones
        const bookSummaries: BookSummary[] = books
          .filter((book: Book) => book.copiesAvailable > 0)
          .map((book: Book) => ({
            id: book.id.toString(),
            title: book.titre,
            author: book.auteurs?.map((a: Author) => a.nom).join(', ') || 'Auteur inconnu',
            copiesAvailable: book.copiesAvailable || 0,
            copiesTotal: book.copiesTotal || 0
          }));

        console.log('✅ Available books for emprunt:', bookSummaries.length);
        console.log('📖 First few books:', bookSummaries.slice(0, 3));

        return bookSummaries;
      }),
      catchError(error => {
        console.error('❌ Error transforming books data:', error);
        return of([]);
      })
    );
  }

  // Get users eligible for emprunts
  getEligibleUsers(): Observable<UserSummary[]> {
    console.log('🔍 Fetching eligible users for emprunt...');
    return this.apiService.getUsers().pipe(
      map(response => {
        console.log('👥 Raw users API response:', response);
        if (response.error) {
          console.error('❌ Error fetching users:', response.error);
          return [];
        }
        const users = response.data || [];
        console.log('📊 Total users found:', users.length);

        // Debug: check if users have ID property
        if (users.length > 0) {
          console.log('🔍 First user structure:', users[0]);
          console.log('🔍 User has ID?', 'id' in users[0], users[0].id);
        }

        // Transform users to UserSummary format and filter active ones
        const userSummaries: UserSummary[] = users
          .filter((user: LibraryUser) => user.isActive)
          .map((user: LibraryUser) => {
            // Use the numeric ID if available, otherwise create a mapping
            let userId: string;
            if (user.id) {
              userId = user.id.toString();
            } else {
              // Create or get a consistent numeric ID for this email
              userId = this.getOrCreateUserIdForEmail(user.email).toString();
            }

            return {
              id: userId,
              fullName: `${user.prenom} ${user.nom}`,
              email: user.email,
              activeEmpruntsCount: user.booksEmpruntes || 0
            };
          });

        console.log('✅ Eligible users for emprunt:', userSummaries.length);
        console.log('👤 First few users:', userSummaries.slice(0, 3));

        return userSummaries;
      }),
      catchError(error => {
        console.error('❌ Error transforming users data:', error);
        return of([]);
      })
    );
  }

  // Get emprunts by status
  getEmpruntsByStatus(status: string): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/status/${status}`)
      .pipe(map(response => response.data || []));
  }

  // Get active emprunts
  getActiveEmprunts(): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/actifs`)
      .pipe(map(response => response.data || []));
  }

  // Get emprunts expiring soon
  getEmpruntsExpiringSoon(): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/bientot-echeance`)
      .pipe(map(response => response.data || []));
  }

  // Get emprunts by book ID
  getEmpruntsByBook(livreId: string): Observable<Emprunt[]> {
    return this.http.get<{ data: Emprunt[] }>(`${this.apiUrl}/livre/${livreId}`)
      .pipe(map(response => response.data || []));
  }

  // Check book availability
  checkBookAvailability(livreId: string): Observable<boolean> {
    return this.http.get<{ data: boolean }>(`${this.apiUrl}/livre/${livreId}/disponible`)
      .pipe(map(response => response.data));
  }

  // Get available copies count
  getAvailableCopiesCount(livreId: string): Observable<number> {
    return this.http.get<{ data: number }>(`${this.apiUrl}/livre/${livreId}/exemplaires-disponibles`)
      .pipe(map(response => response.data));
  }

  // Create direct emprunt
  createDirectEmprunt(emprunt: CreateEmpruntRequest): Observable<Emprunt> {
    return this.http.post<{ data: Emprunt }>(`${this.apiUrl}/direct`, emprunt)
      .pipe(
        map(response => response.data),
        tap(() => this.refreshEmprunts())
      );
  }

  // Update emprunt
  updateEmprunt(id: string, emprunt: Partial<CreateEmpruntRequest>): Observable<Emprunt> {
    return this.http.put<{ data: Emprunt }>(`${this.apiUrl}/${id}`, emprunt)
      .pipe(
        map(response => response.data),
        tap(() => this.refreshEmprunts())
      );
  }

  // Delete emprunt
  deleteEmprunt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.refreshEmprunts()));
  }

  // Get emprunt statistics
  getEmpruntStats(): Observable<EmpruntStats> {
    return this.http.get<{ data: EmpruntStats }>(`${this.apiUrl}/stats`)
      .pipe(map(response => response.data));
  }

  // Helper method to refresh emprunts
  private refreshEmprunts(): void {
    this.getAllEmprunts().subscribe();
  }

  // Filter emprunts locally
  filterEmprunts(emprunts: Emprunt[], searchTerm: string, status: string): Emprunt[] {
    let filtered = emprunts;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emprunt =>
        emprunt.bookTitle?.toLowerCase().includes(term) ||
        emprunt.userName?.toLowerCase().includes(term) ||
        emprunt.userEmail?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(emprunt => emprunt.status === status);
    }

    return filtered;
  }

  // Calculate days until due
  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if emprunt is overdue
  isOverdue(dueDate: Date, status: string): boolean {
    return status === 'active' && new Date() > new Date(dueDate);
  }

  // Get status display text
  getStatusText(emprunt: Emprunt): string {
    if (emprunt.status === 'returned') return 'Rendu';
    if (emprunt.status === 'cancelled') return 'Annulé';
    if (this.isOverdue(emprunt.dueDate, emprunt.status)) return 'En retard';
    return 'En cours';
  }

  // Get status color
  getStatusColor(emprunt: Emprunt): string {
    if (emprunt.status === 'returned') return 'success';
    if (emprunt.status === 'cancelled') return 'secondary';
    if (this.isOverdue(emprunt.dueDate, emprunt.status)) return 'danger';
    return 'primary';
  }

  // Get or create a consistent numeric ID for an email (temporary solution)
  private getOrCreateUserIdForEmail(email: string): number {
    if (this.emailToIdMap.has(email)) {
      return this.emailToIdMap.get(email)!;
    }

    const newId = this.nextId++;
    this.emailToIdMap.set(email, newId);
    console.log(`📝 Created temporary ID ${newId} for user ${email}`);
    return newId;
  }

  // Get email from user ID (reverse lookup)
  getEmailFromUserId(userId: number): string | undefined {
    for (const [email, id] of this.emailToIdMap.entries()) {
      if (id === userId) {
        return email;
      }
    }
    return undefined;
  }

  // Transform backend emprunt data to frontend model
  private transformBackendEmprunt(backendEmprunt: any): Emprunt {
    // Map backend status to frontend status
    const statusMap: { [key: string]: 'active' | 'returned' | 'overdue' | 'cancelled' } = {
      'ENCOURS': 'active',
      'RETOURNE': 'returned',
      'RETOUR': 'returned',  // Handle both RETOUR and RETOURNE
      'ANNULE': 'cancelled'
    };

    // Check if emprunt is overdue
    const dueDate = new Date(backendEmprunt.dateRetour);
    const isOverdue = backendEmprunt.status === 'ENCOURS' && new Date() > dueDate;

    return {
      id: backendEmprunt.id.toString(),
      bookId: backendEmprunt.livreId?.toString() || backendEmprunt.livre?.id?.toString(),
      userId: backendEmprunt.userId?.toString() || backendEmprunt.user?.id?.toString(),
      bookTitle: backendEmprunt.livre?.titre || 'Livre inconnu',
      bookAuthor: backendEmprunt.livre?.categorie?.nom || 'Catégorie inconnue',
      userName: backendEmprunt.user ? `${backendEmprunt.user.prenom} ${backendEmprunt.user.nom}` : 'Utilisateur inconnu',
      userEmail: backendEmprunt.user?.email || '',
      empruntDate: new Date(backendEmprunt.dateEmprunt),
      dueDate: new Date(backendEmprunt.dateRetour),
      returnDate: backendEmprunt.dateRetourEffectif ? new Date(backendEmprunt.dateRetourEffectif) : undefined,
      status: isOverdue ? 'overdue' : statusMap[backendEmprunt.status] || 'active',
      renewalCount: 0, // TODO: Add this field to backend
      maxRenewals: 2, // Default value, should come from backend
      fine: 0, // TODO: Add this field to backend
      notes: backendEmprunt.notes || ''
    };
  }
}