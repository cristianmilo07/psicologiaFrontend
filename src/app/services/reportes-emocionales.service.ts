import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ReporteEmocional {
  _id?: string;
  nombreEstudiante: string;
  edadGrado: string;
  fechaReporte: string;
  psicologaResponsable: string;
  periodoEvaluado: string;
  estadoEmocionalPredominante: string;
  regulacionEmocional: string;
  relacionesSociales: string;
  adaptacionEscolar: string;
  observacionesPsicologicas: string;
  recomendacionesGenerales: string;
  emocionesFrecuentes: string;
  nivelAutoestima: string;
  manejoEstresFrustracion: string;
  apoyoFamiliar: string;
  cambiosRecientes: string;
  relacionAutoridad: string;
  atencionConcentracion: string;
  motivacionEscolar: string;
  conductaAula: string;
  conclusionPsicologica: string;
  frecuenciaSesiones: string;
  observacionAula: string;
  objetivosSeguimiento: string;
  estrategiasAplicadas: string;
  evolucion: string;
  recursosEstudiante: string;
  recursosDocentes: string;
  recursosFamilia: string;
  fraseCierre: string;
  alegria: string;
  tristeza: string;
  ansiedad: string;
  enojo: string;
  miedo: string;
  observacionBreve: string;
  regulacionEmocionalNueva: string;
  descripcionRegulacion: string;
  relacionPares: string;
  relacionDocentes: string;
  comentarioHabilidades: string;
  atencionClase: string;
  cumplimientoNormas: string;
  manejoFrustracion: string;
  fortalezas: string;
  ejemploFortalezas: string;
  dificultades: string;
  ejemploDificultades: string;
  nivelRiesgo: string;
  notaProfesional: string;
  recomendacionesEstudiante: string;
  recomendacionesColegio: string;
  recomendacionesFamilia: string;
  seguimiento: string;
  observacionSeguimiento: string;
  firmaProfesional: string;
  registroProfesional: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesEmocionalesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'https://psicologiabackend.onrender.com/api/reportes-emocionales';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  crearReporte(reporte: Omit<ReporteEmocional, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Observable<{ message: string; reporte: ReporteEmocional }> {
    return this.http.post<{ message: string; reporte: ReporteEmocional }>(this.apiUrl, reporte, { headers: this.getHeaders() });
  }

  obtenerReportes(): Observable<ReporteEmocional[]> {
    return this.http.get<ReporteEmocional[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerReporte(id: string): Observable<ReporteEmocional> {
    return this.http.get<ReporteEmocional>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  actualizarReporte(id: string, reporte: Partial<ReporteEmocional>): Observable<{ message: string; reporte: ReporteEmocional }> {
    return this.http.put<{ message: string; reporte: ReporteEmocional }>(`${this.apiUrl}/${id}`, reporte, { headers: this.getHeaders() });
  }

  eliminarReporte(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}