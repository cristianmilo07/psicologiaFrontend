import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportesEmocionalesService, ReporteEmocional } from '../../services/reportes-emocionales.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-ver-reporte-emocional',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-reporte-emocional.component.html',
  styleUrl: './ver-reporte-emocional.component.scss'
})
export class VerReporteEmocionalComponent implements OnInit {
  reporte: ReporteEmocional | null = null;
  loading = true;
  id: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportesService: ReportesEmocionalesService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.cargarReporte();
  }

  cargarReporte() {
    this.loading = true;
    this.reportesService.obtenerReporte(this.id).subscribe({
      next: (reporte) => {
        this.reporte = reporte;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reporte:', error);
        this.loading = false;
        alert('Error al cargar el reporte');
        this.router.navigate(['/lista-reportes-emocionales']);
      }
    });
  }

  descargarPDF() {
    if (!this.reporte) return;

    const element = document.querySelector('.report-content') as HTMLElement;
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `reporte-emocional-${this.reporte.nombreEstudiante}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  }

  volver() {
    this.router.navigate(['/lista-reportes-emocionales']);
  }
}
