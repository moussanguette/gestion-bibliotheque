import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibraryUser } from '../../models/user.model';

export interface UserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'active' | 'suspended' | 'expired';
}

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent {
  @Input() isVisible = false;
  @Output() onSubmit = new EventEmitter<UserFormData>();
  @Output() onCancel = new EventEmitter<void>();

  isLoading = false;

  formData: UserFormData = {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    status: 'active'
  };

  statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'expired', label: 'Expiré' }
  ];

  async handleSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      // Validation basique
      if (!this.formData.name || !this.formData.email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
      }

      this.onSubmit.emit(this.formData);
      this.resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
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
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      status: 'active'
    };
  }

  generateEmail() {
    // Génère un email basé sur le nom
    if (this.formData.name) {
      const cleanName = this.formData.name
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');
      this.formData.email = `${cleanName}@example.com`;
    }
  }
}