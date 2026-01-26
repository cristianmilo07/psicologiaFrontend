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
            let resumenExtendido = historia.motivoConsulta || 'Sin resumen';

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
              ultimaSesion: numSesiones > 0 ? sesiones[sesiones.length - 1] : null
            };
          });
          this.filteredHistorias = [...this.historiasClinicas];
        },
        error: (error) => {
          console.error('Error al cargar historias clínicas:', error);
          alert('Error al cargar las historias clínicas');
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
    if (!this.searchTerm.trim()) {
      this.filteredHistorias = [...this.historiasClinicas];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredHistorias = this.historiasClinicas.filter(historia =>
        historia.pacienteNombre.toLowerCase().includes(term)
      );
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
            alert('Error al eliminar la historia clínica');
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
