import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Livres
  getAllLivres(): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres`);
  }

  getLivreById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/${id}`);
  }

  createLivre(livre: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/livres`, livre);
  }

  updateLivre(id: number, livre: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/livres/${id}`, livre);
  }

  deleteLivre(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/livres/${id}`);
  }

  getLivreDisponibilite(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/${id}/disponibilite`);
  }

  getLivresFiltre(status?: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/filtre${status ? '?status=' + status : ''}`);
  }

  getLivresEmpruntes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/empruntes`);
  }

  getLivresDisponibles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/disponibles`);
  }

  getLivresActifs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/livres/actifs`);
  }

  // Auth
  signin(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signin`, credentials);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData);
  }

  signout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signout`, {});
  }

  // Auteurs
  getAllAuteurs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auteurs`);
  }

  getAuteurById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/auteurs/${id}`);
  }

  createAuteur(auteur: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auteurs`, auteur);
  }

  updateAuteur(id: number, auteur: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auteurs/${id}`, auteur);
  }

  deleteAuteur(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/auteurs/${id}`);
  }

  // Emprunts
  getAllEmprunts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts`);
  }

  getEmpruntById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/${id}`);
  }

  createEmprunt(emprunt: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/emprunts`, emprunt);
  }

  createEmpruntDirect(emprunt: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/emprunts/direct`, emprunt);
  }

  updateEmprunt(id: number, emprunt: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/emprunts/${id}`, emprunt);
  }

  retournerLivre(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/emprunts/${id}/retourner`, {});
  }

  deleteEmprunt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/emprunts/${id}`);
  }

  getEmpruntsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/user/${userId}`);
  }

  getEmpruntsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/status/${status}`);
  }

  getEmpruntsEnRetard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/retard`);
  }

  getLivresDisponiblesEmprunt(): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/livres-disponibles`);
  }

  getEmpruntsByLivre(livreId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/livre/${livreId}`);
  }

  getExemplairesDisponibles(livreId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/livre/${livreId}/exemplaires-disponibles`);
  }

  checkLivreDisponible(livreId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/livre/${livreId}/disponible`);
  }

  getEmpruntsBientotEcheance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/bientot-echeance`);
  }

  getEmpruntsActifs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/emprunts/actifs`);
  }

  // Users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Notifications
  getAllNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  getNotificationById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/${id}`);
  }

  createNotification(notification: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications`, notification);
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/${id}`);
  }

  getNotificationsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/user/${userId}`);
  }

  getNotificationsUnreadByUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/user/${userId}/unread`);
  }

  getUnreadNotificationsCount(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/user/${userId}/count-unread`);
  }

  markAllNotificationsAsRead(userId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/user/${userId}/read-all`, {});
  }
}