import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReportesEmocionalesService, ReporteEmocional } from '../../services/reportes-emocionales.service';

// Declare SpeechRecognition for TypeScript
declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-reportes-emocionales',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reportes-emocionales.component.html',
  styleUrls: ['./reportes-emocionales.component.scss']
})
export class ReportesEmocionalesComponent {
  // Datos generales
  nombreEstudiante: string = '';
  edadGrado: string = '';
  fechaReporte: string = '';
  psicologaResponsable: string = '';
  periodoEvaluado: string = '';

  // Estado emocional general
  estadoEmocionalPredominante: string = '';
  regulacionEmocional: string = '';
  relacionesSociales: string = '';
  adaptacionEscolar: string = '';

  // Observaciones psicológicas
  observacionesPsicologicas: string = '';

  // Recomendaciones generales
  recomendacionesGenerales: string = '';

  // Evaluación emocional
  emocionesFrecuentes: string = '';
  nivelAutoestima: string = '';
  manejoEstresFrustracion: string = '';

  // Contexto familiar y social
  apoyoFamiliar: string = '';
  cambiosRecientes: string = '';
  relacionAutoridad: string = '';

  // Contexto académico
  atencionConcentracion: string = '';
  motivacionEscolar: string = '';
  conductaAula: string = '';

  // Conclusión psicológica
  conclusionPsicologica: string = '';

  // Seguimiento personalizado
  frecuenciaSesiones: string = '';
  observacionAula: string = '';
  objetivosSeguimiento: string = '';
  estrategiasAplicadas: string = '';
  evolucion: string = '';

  // Recursos y estrategias
  recursosEstudiante: string = '';
  recursosDocentes: string = '';
  recursosFamilia: string = '';
  fraseCierre: string = '';

  // Estado Emocional Actual
  alegria: string = '';
  tristeza: string = '';
  ansiedad: string = '';
  enojo: string = '';
  miedo: string = '';
  observacionBreve: string = '';

  // Regulación Emocional
  regulacionEmocionalNueva: string = '';
  descripcionRegulacion: string = '';

  // Habilidades Sociales
  relacionPares: string = '';
  relacionDocentes: string = '';
  comentarioHabilidades: string = '';

  // Comportamiento en el Entorno Escolar
  atencionClase: string = '';
  cumplimientoNormas: string = '';
  manejoFrustracion: string = '';

  // Fortalezas Emocionales
  fortalezas: string = '';
  ejemploFortalezas: string = '';

  // Dificultades Identificadas
  dificultades: string = '';
  ejemploDificultades: string = '';

  // Nivel de Riesgo Emocional
  nivelRiesgo: string = '';
  notaProfesional: string = '';

  // Recomendaciones
  recomendacionesEstudiante: string = '';
  recomendacionesColegio: string = '';
  recomendacionesFamilia: string = '';

  // Seguimiento
  seguimiento: string = '';
  observacionSeguimiento: string = '';

  // Firma
  firmaProfesional: string = '';
  registroProfesional: string = '';

  // Speech recognition
  private recognition: any;
  private currentField: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportesService: ReportesEmocionalesService
  ) {}

  logout() {
    this.authService.logout();
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }

  startSpeechRecognition(field: string) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    this.currentField = field;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES'; // Spanish
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.appendToField(field, transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert('Error en el reconocimiento de voz: ' + event.error);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    this.recognition.start();
  }

  private appendToField(field: string, text: string) {
    const currentValue = (this as any)[field] || '';
    (this as any)[field] = currentValue + (currentValue ? ' ' : '') + text;
  }

  generarReporte() {
    const reporte: Omit<ReporteEmocional, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
      nombreEstudiante: this.nombreEstudiante,
      edadGrado: this.edadGrado,
      fechaReporte: this.fechaReporte,
      psicologaResponsable: this.psicologaResponsable,
      periodoEvaluado: this.periodoEvaluado,
      estadoEmocionalPredominante: this.estadoEmocionalPredominante,
      regulacionEmocional: this.regulacionEmocional,
      relacionesSociales: this.relacionesSociales,
      adaptacionEscolar: this.adaptacionEscolar,
      observacionesPsicologicas: this.observacionesPsicologicas,
      recomendacionesGenerales: this.recomendacionesGenerales,
      emocionesFrecuentes: this.emocionesFrecuentes,
      nivelAutoestima: this.nivelAutoestima,
      manejoEstresFrustracion: this.manejoEstresFrustracion,
      apoyoFamiliar: this.apoyoFamiliar,
      cambiosRecientes: this.cambiosRecientes,
      relacionAutoridad: this.relacionAutoridad,
      atencionConcentracion: this.atencionConcentracion,
      motivacionEscolar: this.motivacionEscolar,
      conductaAula: this.conductaAula,
      conclusionPsicologica: this.conclusionPsicologica,
      frecuenciaSesiones: this.frecuenciaSesiones,
      observacionAula: this.observacionAula,
      objetivosSeguimiento: this.objetivosSeguimiento,
      estrategiasAplicadas: this.estrategiasAplicadas,
      evolucion: this.evolucion,
      recursosEstudiante: this.recursosEstudiante,
      recursosDocentes: this.recursosDocentes,
      recursosFamilia: this.recursosFamilia,
      fraseCierre: this.fraseCierre,
      alegria: this.alegria,
      tristeza: this.tristeza,
      ansiedad: this.ansiedad,
      enojo: this.enojo,
      miedo: this.miedo,
      observacionBreve: this.observacionBreve,
      regulacionEmocionalNueva: this.regulacionEmocionalNueva,
      descripcionRegulacion: this.descripcionRegulacion,
      relacionPares: this.relacionPares,
      relacionDocentes: this.relacionDocentes,
      comentarioHabilidades: this.comentarioHabilidades,
      atencionClase: this.atencionClase,
      cumplimientoNormas: this.cumplimientoNormas,
      manejoFrustracion: this.manejoFrustracion,
      fortalezas: this.fortalezas,
      ejemploFortalezas: this.ejemploFortalezas,
      dificultades: this.dificultades,
      ejemploDificultades: this.ejemploDificultades,
      nivelRiesgo: this.nivelRiesgo,
      notaProfesional: this.notaProfesional,
      recomendacionesEstudiante: this.recomendacionesEstudiante,
      recomendacionesColegio: this.recomendacionesColegio,
      recomendacionesFamilia: this.recomendacionesFamilia,
      seguimiento: this.seguimiento,
      observacionSeguimiento: this.observacionSeguimiento,
      firmaProfesional: this.firmaProfesional,
      registroProfesional: this.registroProfesional
    };

    this.reportesService.crearReporte(reporte).subscribe({
      next: (response) => {
        alert('Reporte creado exitosamente');
        console.log('Reporte creado:', response.reporte);
        // Reset form or navigate
      },
      error: (error) => {
        alert('Error al crear el reporte');
        console.error('Error:', error);
      }
    });
  }
}
