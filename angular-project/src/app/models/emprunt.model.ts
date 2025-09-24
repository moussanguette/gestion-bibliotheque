export interface Emprunt {
  id: string;
  bookId: string;
  userId: string;
  bookTitle?: string;
  bookAuthor?: string;
  userName?: string;
  userEmail?: string;
  empruntDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue' | 'cancelled';
  renewalCount: number;
  maxRenewals: number;
  fine?: number;
  notes?: string;
}

export interface CreateEmpruntRequest {
  userId: number;
  livreId: number;
  dureeJours: number;
}

export interface EmpruntStats {
  totalEmprunts: number;
  activeEmprunts: number;
  overdueEmprunts: number;
  returnedEmprunts: number;
}

export interface EmpruntFilter {
  searchTerm: string;
  status: 'all' | 'active' | 'returned' | 'overdue' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  copiesAvailable: number;
  copiesTotal: number;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  activeEmpruntsCount: number;
}