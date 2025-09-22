import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookFormData, Author, Category } from '../../models/book.model';

@Component({
  selector: 'app-add-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book-form.component.html',
  styleUrls: ['./add-book-form.component.css']
})
export class AddBookFormComponent implements OnInit {
  @Input() isVisible = false;
  @Output() onSubmit = new EventEmitter<BookFormData>();
  @Output() onCancel = new EventEmitter<void>();

  isLoading = false;

  @Input() authors: Author[] = [];
  @Input() categories: Category[] = [];

  ngOnInit() {
    console.log('📝 AddBookForm initialized');
    console.log('👥 Authors received:', this.authors);
    console.log('🏷️ Categories received:', this.categories);
  }

  formData: BookFormData = {
    titre: '',
    isbn: '',
    status: 'AVAILABLE',
    datePublication: new Date().toISOString().split('T')[0],
    nombrePages: 0,
    copiesTotal: 1,
    copiesAvailable: 1,
    resume: '',
    categorieId: 0,
    auteurIds: []
  };

  selectedAuthors: number[] = [];
  showAuthorDropdown = false;
  authorSearchTerm = '';

  async handleSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      // Validation basique
      if (!this.formData.titre || !this.formData.isbn || this.formData.categorieId === 0 || this.selectedAuthors.length === 0) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Assurer que copiesAvailable <= copiesTotal
      if (this.formData.copiesAvailable > this.formData.copiesTotal) {
        this.formData.copiesAvailable = this.formData.copiesTotal;
      }

      // Mettre à jour les auteurs sélectionnés
      this.formData.auteurIds = [...this.selectedAuthors];

      // Convertir la date au format ISO avec time
      if (this.formData.datePublication) {
        this.formData.datePublication = new Date(this.formData.datePublication).toISOString();
      }

      this.onSubmit.emit(this.formData);
      this.resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error);
    } finally {
      this.isLoading = false;
    }
  }

  handleCancel() {
    this.resetForm();
    this.onCancel.emit();
  }

  resetForm() {
    this.formData = {
      titre: '',
      isbn: '',
      status: 'AVAILABLE',
      datePublication: new Date().toISOString().split('T')[0],
      nombrePages: 0,
      copiesTotal: 1,
      copiesAvailable: 1,
      resume: '',
      categorieId: 0,
      auteurIds: []
    };
    this.selectedAuthors = [];
    this.showAuthorDropdown = false;
    this.authorSearchTerm = '';
  }


  generateISBN() {
    // Génère un ISBN-13 factice pour la démonstration
    const prefix = '978';
    const publisher = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const title = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const check = Math.floor(Math.random() * 10);

    this.formData.isbn = `${prefix}-${publisher}-${title}-${check}`;
  }

  onCopiesTotalChange() {
    // Assurer que copiesAvailable ne dépasse pas copiesTotal
    if (this.formData.copiesAvailable > this.formData.copiesTotal) {
      this.formData.copiesAvailable = this.formData.copiesTotal;
    }
  }

  // Nouvelles méthodes pour le select amélioré des auteurs
  toggleAuthorDropdown() {
    this.showAuthorDropdown = !this.showAuthorDropdown;
    if (this.showAuthorDropdown) {
      this.authorSearchTerm = '';
    }
  }

  toggleAuthorSelection(authorId: number) {
    const index = this.selectedAuthors.indexOf(authorId);
    if (index > -1) {
      this.selectedAuthors.splice(index, 1);
    } else {
      this.selectedAuthors.push(authorId);
    }
  }

  isAuthorSelected(authorId: number): boolean {
    return this.selectedAuthors.includes(authorId);
  }

  removeAuthor(authorId: number) {
    const index = this.selectedAuthors.indexOf(authorId);
    if (index > -1) {
      this.selectedAuthors.splice(index, 1);
    }
  }

  getAuthorName(authorId: number): string {
    const author = this.authors.find(a => a.id === authorId);
    return author ? `${author.prenom} ${author.nom}` : 'Auteur inconnu';
  }

  get filteredAuthors() {
    if (!this.authorSearchTerm.trim()) {
      return this.authors;
    }

    const searchTerm = this.authorSearchTerm.toLowerCase().trim();
    return this.authors.filter(author =>
      `${author.prenom} ${author.nom}`.toLowerCase().includes(searchTerm)
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.author-dropdown-container');

    if (!dropdownContainer && this.showAuthorDropdown) {
      this.showAuthorDropdown = false;
    }
  }
}