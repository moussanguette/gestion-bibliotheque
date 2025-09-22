export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  bookTitle?: string;
  userName?: string;
  userEmail?: string;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
  renewalCount: number;
  maxRenewals: number;
  fine?: number;
}

export interface CreateLoanRequest {
  bookId: string;
  userId: string;
  dueDate: string;
}

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
}