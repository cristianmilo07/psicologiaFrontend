import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AtencionGrupal {
  _id?: string;
  grado: string;
  fecha: string;
  tema: string;
  numeroParticipantes: number;
  objetivos?: string;
  actividades?: string;
  observaciones?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtencionesGrupalesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'https://psicologiabackend.onrender.com/api/atenciones-grupales';
  private baseUrl = 'https://psicologiabackend.onrender.com/api/atenciones-grupales';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crearAtencion(atencion: Omit<AtencionGrupal, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Observable<{ message: string; atencion: AtencionGrupal }> {
    return this.http.post<{ message: string; atencion: AtencionGrupal }>(this.apiUrl, atencion, { headers: this.getHeaders() });
  }

  obtenerAtenciones(): Observable<AtencionGrupal[]> {
    return this.http.get<AtencionGrupal[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerAtencionesPorMes(mes: number, anio: number): Observable<AtencionGrupal[]> {
    return this.http.get<AtencionGrupal[]>(`${this.apiUrl}/mes/${mes}/${anio}`, { headers: this.getHeaders() });
  }

  obtenerAtencion(id: string): Observable<AtencionGrupal> {
    return this.http.get<AtencionGrupal>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  actualizarAtencion(id: string, atencion: Partial<AtencionGrupal>): Observable<{ message: string; atencion: AtencionGrupal }> {
    return this.http.put<{ message: string; atencion: AtencionGrupal }>(`${this.apiUrl}/${id}`, atencion, { headers: this.getHeaders() });
  }

  eliminarAtencion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

    subirImagenes(id: string, archivos: File[]): Observable<{ message: string; imagenes: string[]; atencion: AtencionGrupal }> {
    const formData = new FormData();
    archivos.forEach(archivo => {
      formData.append('imagenes', archivo);
    });
    return this.http.post<{ message: string; imagenes: string[]; atencion: AtencionGrupal }>(
      `${this.apiUrl}/${id}/upload-images`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarImagen(id: string, imageIndex: number): Observable<{ message: string; atencion: AtencionGrupal }> {
    return this.http.delete<{ message: string; atencion: AtencionGrupal }>(
      `${this.apiUrl}/${id}/images/${imageIndex}`,
      { headers: this.getHeaders() }
    );
  }

  getImageUrl(relativePath: string): string {
    return `${this.baseUrl}/${relativePath}`;
  }
}