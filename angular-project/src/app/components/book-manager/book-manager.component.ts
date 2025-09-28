import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { Book, BookFormData, Author, Category } from '../../models/book.model';
import { AddBookFormComponent } from '../add-book-form/add-book-form.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-book-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, AddBookFormComponent],
  templateUrl: './book-manager.component.html',
  styleUrls: ['./book-manager.component.css']
})
export class BookManagerComponent implements OnInit, OnDestroy {
  searchTerm = '';
  books: Book[] = [];
  authors: Author[] = [];
  categories: Category[] = [];
  loading = true;
  showAddForm = false;
  selectedFilter = 'all';
  private searchSubject = new Subject<string>();

  // Modal properties
  showViewModal = false;
  showEditModal = false;
  selectedBook: Book | null = null;
  editLoading = false;
  editBookDate = '';
  selectedCategoryId = '';

  filters = [
    { value: 'all', label: 'Tous les livres' },
    { value: 'available', label: 'Disponibles' },
    { value: 'borrowed', label: 'Empruntés' },
    { value: 'partially_borrowed', label: 'Partiellement empruntés' }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public permissionService: PermissionService
  ) {
    // Configurer le debounce pour la recherche
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(searchTerm: string) {
    this.loading = true;

    // Si pas de terme de recherche, charger tous les livres
    if (!searchTerm || searchTerm.trim() === '') {
      this.loadBooks();
      return;
    }

    this.apiService.searchBooks({
      q: searchTerm,
      orderBy: 'titre',
      orderDir: 'asc',
      limit: 50,
      offset: 0
    }).subscribe({
      next: (response) => {
        console.log('Search API response:', response);
        let books: Book[] = [];

        // Gérer différentes structures de réponse
        if (response.data && Array.isArray(response.data)) {
          books = response.data;
        } else if (Array.isArray(response)) {
          books = response;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          books = response.data.data;
        }

        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        // Fallback: recherche locale si l'API échoue
        this.performLocalSearch(searchTerm);
      }
    });
  }

  private performLocalSearch(searchTerm: string) {
    console.log('Performing local search for:', searchTerm);
    this.loading = true;

    // Charger tous les livres d'abord
    this.apiService.getBooks().subscribe({
      next: (response) => {
        const allBooks = response.data || [];
        const search = searchTerm.toLowerCase().trim();

        // Filtrer localement
        const filteredBooks = allBooks.filter((book: Book) =>
          (book.titre || '').toLowerCase().includes(search) ||
          (book.auteurs || []).some((author: any) =>
            (author.nom || '').toLowerCase().includes(search) ||
            (author.prenom || '').toLowerCase().includes(search)
          ) ||
          (book.isbn || '').toLowerCase().includes(search) ||
          (book.categorie && (book.categorie.nom || '').toLowerCase().includes(search))
        );

        this.books = filteredBooks;
        this.loading = false;
        console.log(`Local search found ${filteredBooks.length} books`);
      },
      error: (error) => {
        console.error('Error in local search:', error);
        this.books = [];
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.loadBooks();
    this.loadAuthors();
    this.loadCategories();
  }

  loadBooks() {
    this.loading = true;
    console.log('🔍 Starting to load books...');
    this.apiService.getBooks().subscribe({
      next: (response: any) => {
        console.log('📚 Books API response:', response);
        console.log('📊 Response type:', typeof response);
        console.log('📋 Response keys:', Object.keys(response || {}));

        let books: Book[] = [];

        // Gestion flexible de la structure de réponse
        if (response && response.data) {
          console.log('✅ Found response.data:', response.data);
          console.log('📊 Data type:', typeof response.data);
          console.log('📊 Is array:', Array.isArray(response.data));

          if (Array.isArray(response.data)) {
            books = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            console.log('✅ Found nested data array');
            books = response.data.data;
          } else if (response.data && typeof response.data === 'object') {
            // Vérifier d'autres propriétés possibles dans response.data
            const possibleArrayProps = ['books', 'livres', 'content', 'items'];
            for (const prop of possibleArrayProps) {
              if (response.data[prop] && Array.isArray(response.data[prop])) {
                console.log(`✅ Found books in data.${prop} property`);
                books = response.data[prop];
                break;
              }
            }
          }
        } else if (Array.isArray(response)) {
          console.log('✅ Response is directly an array');
          books = response;
        } else if (response && typeof response === 'object') {
          console.log('🔍 Checking object properties...');
          // Vérifier d'autres propriétés possibles
          const possibleArrayProps = ['books', 'livres', 'content', 'items', 'data'];
          for (const prop of possibleArrayProps) {
            if (response[prop] && Array.isArray(response[prop])) {
              console.log(`✅ Found books in ${prop} property`);
              books = response[prop];
              break;
            }
          }
        }

        console.log(`📊 Final books count: ${books.length}`);
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading books:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.books = [];
        this.loading = false;
      }
    });
  }

  loadAuthors() {
    console.log('🔍 Loading authors...');
    this.apiService.getAuthorsSimple().subscribe({
      next: (authors) => {
        console.log('✅ Authors loaded:', authors);
        console.log('📊 Authors count:', authors?.length || 0);
        this.authors = authors || [];
      },
      error: (error) => {
        console.error('❌ Error loading authors:', error);
        this.authors = [];
      }
    });
  }

  loadCategories() {
    console.log('🔍 Loading categories...');
    this.apiService.getCategoriesSimple().subscribe({
      next: (categories) => {
        console.log('✅ Categories loaded:', categories);
        console.log('📊 Categories count:', categories?.length || 0);
        this.categories = categories || [];
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  handleAddBook(bookData: BookFormData) {
    if (this.isLecteur()) {
      console.warn('LECTEUR users cannot add books');
      return;
    }
    console.log('📝 Adding book with data:', bookData);

    this.apiService.addBook(bookData).subscribe({
      next: (response) => {
        console.log('✅ Book added successfully:', response);
        if (response.data && !response.error) {
          this.books.unshift(response.data);
          this.showAddForm = false;
          alert('Livre ajouté avec succès !');
        } else {
          console.error('Failed to add book:', response.error);
          alert('Erreur lors de l\'ajout du livre');
        }
      },
      error: (error) => {
        console.error('❌ Error adding book:', error);
        alert('Erreur lors de l\'ajout du livre: ' + (error.message || 'Erreur inconnue'));
      }
    });
  }


  handleDeleteBook(bookId: number) {
    if (this.isLecteur()) {
      console.warn('LECTEUR users cannot delete books');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      this.apiService.deleteBook(bookId.toString()).subscribe({
        next: (response) => {
          this.books = this.books.filter(book => book.id !== bookId);
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Erreur lors de la suppression du livre');
        }
      });
    }
  }

  get filteredBooks(): Book[] {
    let filtered = this.books;

    // Filtrage par statut uniquement (la recherche est gérée par l'API)
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(book => {
        switch (this.selectedFilter) {
          case 'available':
            return book.copiesAvailable === book.copiesTotal;
          case 'borrowed':
            return book.copiesAvailable === 0;
          case 'partially_borrowed':
            return book.copiesAvailable > 0 && book.copiesAvailable < book.copiesTotal;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  getStatusBadge(book: Book): { class: string; text: string } {
    if (book.copiesAvailable === 0) {
      return { class: 'status-unavailable', text: 'Indisponible' };
    } else if (book.copiesAvailable === book.copiesTotal) {
      return { class: 'status-available', text: 'Disponible' };
    } else {
      return { class: 'status-partial', text: 'Partiel' };
    }
  }

  // Modal methods
  openViewModal(book: Book) {
    this.selectedBook = { ...book };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedBook = null;
  }

  openEditModal(book: Book) {
    if (this.isLecteur()) {
      console.warn('LECTEUR users cannot edit books');
      return;
    }
    this.selectedBook = { ...book };
    // datePublication is already a string, so we can use it directly
    this.editBookDate = book.datePublication || '';
    this.selectedCategoryId = book.categorie?.id?.toString() || '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedBook = null;
    this.editLoading = false;
    this.editBookDate = '';
    this.selectedCategoryId = '';
  }

  handleEditBook() {
    if (this.isLecteur()) {
      console.warn('LECTEUR users cannot edit books');
      return;
    }
    if (!this.selectedBook) return;

    this.editLoading = true;

    // Prepare the update data
    const updateData: any = {
      titre: this.selectedBook.titre,
      isbn: this.selectedBook.isbn,
      copiesTotal: this.selectedBook.copiesTotal,
      copiesAvailable: this.selectedBook.copiesAvailable,
      resume: this.selectedBook.resume || '',
      nombrePages: this.selectedBook.nombrePages || 0,
      status: this.selectedBook.status || 'AVAILABLE'
    };

    // Add date if provided (keep as string since API expects string)
    if (this.editBookDate) {
      updateData.datePublication = this.editBookDate;
    }

    // Add category if selected
    if (this.selectedCategoryId) {
      const selectedCategory = this.categories.find(cat => cat.id?.toString() === this.selectedCategoryId);
      if (selectedCategory) {
        updateData.categorieId = selectedCategory.id;
      }
    }

    console.log('🔄 Updating book with data:', updateData);

    this.apiService.updateBook(this.selectedBook.id.toString(), updateData).subscribe({
      next: (response) => {
        console.log('✅ Book updated successfully:', response);
        if (response.data && !response.error) {
          // Update the book in the local array
          const bookIndex = this.books.findIndex(b => b.id === this.selectedBook!.id);
          if (bookIndex !== -1) {
            this.books[bookIndex] = { ...this.books[bookIndex], ...updateData };
          }
          this.closeEditModal();
          alert('Livre modifié avec succès !');
        } else {
          console.error('Failed to update book:', response.error);
          alert('Erreur lors de la modification du livre');
        }
        this.editLoading = false;
      },
      error: (error) => {
        console.error('❌ Error updating book:', error);
        alert('Erreur lors de la modification du livre: ' + (error.message || 'Erreur inconnue'));
        this.editLoading = false;
      }
    });
  }

  isLecteur(): boolean {
    return this.permissionService.isLecteur() && !this.permissionService.canManageBooks();
  }

}