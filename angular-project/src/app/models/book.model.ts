export interface Book {
  id: number;
  titre: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL';
  isbn: string;
  nombrePages: number;
  resume: string;
  datePublication: string;
  copiesTotal: number;
  copiesAvailable: number;
  isActive: boolean;
  categorie: Category;
  auteurs: Author[];
}

export interface BookFormData {
  titre: string;
  isbn: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL';
  datePublication: string;
  nombrePages: number;
  copiesTotal: number;
  copiesAvailable: number;
  resume: string;
  categorieId: number;
  auteurIds: number[];
}

export interface Author {
  id: number;
  nom: string;
  prenom: string;
  biographie?: string;
  dateDeNaissance?: string;
  nationalite?: string;
  createdAt?: string;
  updatedAt?: string;
  livres?: any;
  nombreLivres?: number;
}

export interface Category {
  id: number;
  nom: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface BooksResponse {
  pageSize: number;
  totalPages: number;
  size: number;
  data: Book[];
  currentPage: number;
  totalElements: number;
}