export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalUsers: number;
  activeEmprunts: number;
  overdueEmprunts: number;
  booksAddedThisMonth: number;
  usersRegisteredThisMonth: number;
  popularCategories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'emprunt' | 'return' | 'book_added' | 'user_registered';
  description: string;
  timestamp: Date;
  userEmail?: string;
  bookTitle?: string;
}

export interface ActivityResponse {
  activities: ActivityItem[];
}

export interface StatsResponse {
  stats: LibraryStats;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}