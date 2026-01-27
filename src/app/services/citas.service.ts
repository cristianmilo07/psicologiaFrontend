import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  _id?: string;
  date: Date;
  time: string;
  description: string;
  type: 'alumno' | 'acudiente';
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'https://psicologiabackend.onrender.com/api/citas';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createCita(cita: Omit<Cita, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita, { headers: this.getHeaders() });
  }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateCita(id: string, cita: Partial<Cita>): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita, { headers: this.getHeaders() });
  }

  deleteCita(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}