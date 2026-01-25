import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReportesEmocionalesService, ReporteEmocional } from '../../services/reportes-emocionales.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lista-reportes-emocionales',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-reportes-emocionales.component.html',
  styleUrl: './lista-reportes-emocionales.component.scss'
})
export class ListaReportesEmocionalesComponent implements OnInit {
  reportes: ReporteEmocional[] = [];
  loading = true;
  user: any = null;

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
