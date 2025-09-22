export interface Stats {
  totalBooks: number;
  totalUsers: number;
  totalLoans: number;
  activeLoans: number;
  overdue: number;
  totalLivresPrets: number;
  totalEnRetard: number;
  popularBooks: PopularBook[];
  recentActivity: RecentActivity[];
  monthlyStats: MonthlyStats;
}

export interface PopularBook {
  id: number;
  titre: string;
  nombreEmprunts: number;
  auteurs: {
    nom: string;
    prenom: string;
  }[];
}

export interface RecentActivity {
  type: string;
  bookTitle?: string;
  userName?: string;
  date: string;
  description?: string;
}

export interface MonthlyStats {
  loansThisMonth: number;
  returnsThisMonth: number;
  newBooksThisMonth: number;
  newUsersThisMonth: number;
}

export interface Activity {
  id: number;
  type: 'book_added' | 'book_updated' | 'book_deleted' | 'user_registered' | 'user_updated' | 'book_borrowed' | 'book_returned' | 'book_overdue';
  description: string;
  bookId?: number;
  userId?: number;
  timestamp: string;
  metadata?: {
    bookTitle?: string;
    userName?: string;
    author?: string;
    email?: string;
  };
}

export interface ActivityResponse {
  activities: Activity[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}