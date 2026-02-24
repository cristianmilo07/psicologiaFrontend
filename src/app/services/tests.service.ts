import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Test {
  _id?: string;
  pacienteId: string | { _id: string; name: string; email: string };
  tipoTest: 'PHQ9' | 'GAD7';
  respuestas: number[];
  puntajeTotal: number;
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto';
  alertaSuicida?: boolean;
  observaciones?: string;
  createdBy?: string;
  fecha?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestPreguntas {
  tipoTest: string;
  preguntas: string[];
  opciones: { valor: number; texto: string }[];
}

export interface TestEstadisticas {
  totalTests: number;
  phq9: {
    count: number;
    avgScore: number;
    trend: { fecha: string; puntaje: number; nivelRiesgo: string }[];
  };
  gad7: {
    count: number;
    avgScore: number;
    trend: { fecha: string; puntaje: number; nivelRiesgo: string }[];
  };
  alertas: number;
}

export interface TestCreateResponse {
  message: string;
  test: Test;
  alerta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'https://psicologiabackend.onrender.com/api/tests';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Create a new test
  crearTest(test: Omit<Test, '_id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'puntajeTotal' | 'nivelRiesgo' | 'alertaSuicida'>): Observable<TestCreateResponse> {
    return this.http.post<TestCreateResponse>(this.apiUrl, test, { headers: this.getHeaders() });
  }

  // Get all tests for the current professional
  obtenerTests(): Observable<Test[]> {
    return this.http.get<Test[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get tests by patient ID
  obtenerTestsPorPaciente(pacienteId: string): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/paciente/${pacienteId}`, { headers: this.getHeaders() });
  }

  // Get tests by patient ID and test type
  obtenerTestsPorPacienteYTipo(pacienteId: string, tipoTest: 'PHQ9' | 'GAD7'): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/paciente/${pacienteId}/tipo/${tipoTest}`, { headers: this.getHeaders() });
  }

  // Get tests with alerts (suicidal ideation)
  obtenerAlertas(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/alertas`, { headers: this.getHeaders() });
  }

  // Get a single test by ID
  obtenerTest(id: string): Observable<Test> {
    return this.http.get<Test>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Update a test
  actualizarTest(id: string, test: Partial<Test>): Observable<TestCreateResponse> {
    return this.http.put<TestCreateResponse>(`${this.apiUrl}/${id}`, test, { headers: this.getHeaders() });
  }

  // Delete a test
  eliminarTest(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Get test statistics for a patient
  obtenerEstadisticas(pacienteId: string): Observable<TestEstadisticas> {
    return this.http.get<TestEstadisticas>(`${this.apiUrl}/estadisticas/${pacienteId}`, { headers: this.getHeaders() });
  }

  // Get questions for a test type
  obtenerPreguntas(tipoTest: 'PHQ9' | 'GAD7'): Observable<TestPreguntas> {
    return this.http.get<TestPreguntas>(`${this.apiUrl}/preguntas/${tipoTest}`);
  }

  // Helper method to get risk level color
  getNivelRiesgoColor(nivel: string): string {
    switch (nivel) {
      case 'Bajo':
        return '#4CAF50'; // Green
      case 'Medio':
        return '#FF9800'; // Orange
      case 'Alto':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }

  // Helper method to get risk level background color (lighter)
  getNivelRiesgoBgColor(nivel: string): string {
    switch (nivel) {
      case 'Bajo':
        return '#E8F5E9'; // Light Green
      case 'Medio':
        return '#FFF3E0'; // Light Orange
      case 'Alto':
        return '#FFEBEE'; // Light Red
      default:
        return '#F5F5F5'; // Light Grey
    }
  }

  // PHQ-9 Risk Level calculation (for reference)
  calcularNivelRiesgoPHQ9(puntaje: number): string {
    if (puntaje >= 0 && puntaje <= 4) return 'Bajo';
    if (puntaje >= 5 && puntaje <= 14) return 'Medio';
    return 'Alto';
  }

  // GAD-7 Risk Level calculation (for reference)
  calcularNivelRiesgoGAD7(puntaje: number): string {
    if (puntaje >= 0 && puntaje <= 4) return 'Bajo';
    if (puntaje >= 5 && puntaje <= 9) return 'Medio';
    return 'Alto';
  }
}
