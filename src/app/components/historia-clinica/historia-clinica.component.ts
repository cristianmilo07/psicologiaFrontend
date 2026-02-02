import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HistoriasService } from '../../services/historias.service';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.scss']
})
export class HistoriaClinicaComponent implements OnInit {
  historiasClinicas: any[] = [];
  filteredHistorias: any[] = [];
  searchTerm: string = '';
  selectedRiskLevel: string = '';
  showDeleteModal: boolean = false;
  historiaToDelete: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private historiasService: HistoriasService
  ) {}

  ngOnInit() {
    this.loadHistoriasClinicas();
  }

  loadHistoriasClinicas() {
    this.historiasService.getHistorias()
      .subscribe({
        next: (response: any) => {
          this.historiasClinicas = response.map((historia: any) => {
            const sesiones = historia.sesiones || [];
            const numSesiones = sesiones.length;
            let resumenExtendido = '';

            if (historia.acompanamiento === 'acompanamiento_padre') {
              resumenExtendido = historia.descripcionAcompanamientoPadre || 'Sin descripción';
            } else {
              resumenExtendido = historia.motivoConsulta || 'Sin resumen';
            }

            if (numSesiones > 0) {
              const ultimaSesion = sesiones[sesiones.length - 1];
              resumenExtendido += `\n\nSesiones: ${numSesiones}`;
              if (ultimaSesion) {
                resumenExtendido += `\nÚltima sesión: ${new Date(ultimaSesion.fecha).toLocaleDateString('es-ES')} - ${ultimaSesion.tipo}`;
              }
            }

            return {
              pacienteNombre: historia.nombrePaciente,
              fecha: new Date(historia.createdAt).toLocaleDateString('es-ES'),
              resumen: resumenExtendido,
              tags: historia.diagnostico ? [historia.diagnostico] : [],
              id: historia._id,
              numSesiones: numSesiones,
              tieneSesiones: numSesiones > 0,
              ultimaSesion: numSesiones > 0 ? sesiones[sesiones.length - 1] : null,
              nivelRiesgo: historia.nivelRiesgo || ''
            };
          });
          this.filteredHistorias = [...this.historiasClinicas];
        },
        error: (error) => {
          console.error('Error al cargar historias clínicas:', error);
          if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            this.authService.logout();
          } else {
            alert('Error al cargar las historias clínicas');
          }
        }
      });
  }

  logout() {
    this.authService.logout();
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }

  navigateToNuevaHistoriaClinica() {
    this.router.navigate(['/nueva-historia-clinica']);
  }

  filterHistorias() {
    let result = this.historiasClinicas;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(historia =>
        historia.pacienteNombre.toLowerCase().includes(term)
      );
    }

    // Filter by risk level
    if (this.selectedRiskLevel && this.selectedRiskLevel !== 'todos') {
      result = result.filter(historia =>
        historia.nivelRiesgo === this.selectedRiskLevel
      );
    }

    this.filteredHistorias = result;
  }

  getRiesgoClass(nivelRiesgo: string): string {
    switch (nivelRiesgo) {
      case 'critico':
        return 'riesgo-critico';
      case 'alto':
        return 'riesgo-alto';
      case 'medio':
        return 'riesgo-medio';
      case 'bajo':
        return 'riesgo-bajo';
      default:
        return '';
    }
  }

  getRiesgoLabel(nivelRiesgo: string): string {
    switch (nivelRiesgo) {
      case 'critico':
        return '🔴 Crítico';
      case 'alto':
        return '🟠 Alto';
      case 'medio':
        return '🟡 Medio';
      case 'bajo':
        return '🟢 Bajo';
      default:
        return '';
    }
  }

  verDetalles(historia: any) {
    this.router.navigate(['/detalle-historia-clinica', historia.id]);
  }

  editar(historia: any) {
    this.router.navigate(['/editar-historia-clinica', historia.id]);
  }

  eliminar(historia: any) {
    this.historiaToDelete = historia;
    this.showDeleteModal = true;
  }

  confirmarEliminar() {
    if (this.historiaToDelete) {
      this.historiasService.deleteHistoria(this.historiaToDelete.id)
        .subscribe({
          next: (response: any) => {
            alert('Historia clínica eliminada exitosamente');
            this.loadHistoriasClinicas(); // Recargar la lista
            this.showDeleteModal = false;
            this.historiaToDelete = null;
          },
          error: (error) => {
            console.error('Error al eliminar historia clínica:', error);
            if (error.status === 401) {
              alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
              this.authService.logout();
            } else {
              alert('Error al eliminar la historia clínica');
            }
            this.showDeleteModal = false;
            this.historiaToDelete = null;
          }
        });
    }
  }

  cancelarEliminar() {
    this.showDeleteModal = false;
    this.historiaToDelete = null;
  }
}
