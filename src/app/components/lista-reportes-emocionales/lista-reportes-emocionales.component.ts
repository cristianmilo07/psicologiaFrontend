import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportesEmocionalesService, ReporteEmocional } from '../../services/reportes-emocionales.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lista-reportes-emocionales',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-reportes-emocionales.component.html',
  styleUrl: './lista-reportes-emocionales.component.scss'
})
export class ListaReportesEmocionalesComponent implements OnInit {
  reportes: ReporteEmocional[] = [];
  loading = true;
  user: any = null;
  
  // Edit modal state
  showEditModal = false;
  editingReporte: Partial<ReporteEmocional> = {};
  editingId: string = '';
  
  // Notification state
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private reportesService: ReportesEmocionalesService,
    private router: Router,
    private authService: AuthService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.loading = true;
    this.reportesService.obtenerReportes().subscribe({
      next: (reportes) => {
        this.reportes = reportes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.loading = false;
      }
    });
  }

  verReporte(id: string) {
    this.router.navigate(['/ver-reporte-emocional', id]);
  }

  editarReporte(id: string) {
    const reporte = this.reportes.find(r => r._id === id);
    if (reporte) {
      this.editingId = id;
      this.editingReporte = { ...reporte };
      this.showEditModal = true;
    }
  }

  toggleEditModal(): void {
    this.showEditModal = !this.showEditModal;
    if (!this.showEditModal) {
      this.editingReporte = {};
      this.editingId = '';
    }
  }

  guardarEdicion(): void {
    if (!this.editingId) return;
    
    this.reportesService.actualizarReporte(this.editingId, this.editingReporte).subscribe({
      next: () => {
        this.showNotificationModal('¡Reporte emocional actualizado exitosamente! ✏️', 'success');
        this.toggleEditModal();
        this.cargarReportes();
      },
      error: (error) => {
        console.error('Error al actualizar reporte:', error);
        this.showNotificationModal('Error al actualizar el reporte 😔', 'error');
      }
    });
  }

  showNotificationModal(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  eliminarReporte(id: string) {
    if (confirm('¿Está seguro de que desea eliminar este reporte?')) {
      this.reportesService.eliminarReporte(id).subscribe({
        next: () => {
          this.cargarReportes();
        },
        error: (error) => {
          console.error('Error al eliminar reporte:', error);
          alert('Error al eliminar el reporte');
        }
      });
    }
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
}
