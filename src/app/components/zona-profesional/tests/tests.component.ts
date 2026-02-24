import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { TestsService, Test, TestPreguntas, TestEstadisticas } from '../../../services/tests.service';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.scss'
})
export class TestsComponent implements OnInit {
  user: any = null;
  tests: Test[] = [];
  loading = false;
  showTestForm = false;
  showPatientSelector = true;
  selectedTestType: 'PHQ9' | 'GAD7' = 'PHQ9';
  selectedPatientId: string = '';
  testPreguntas: TestPreguntas | null = null;
  respuestas: number[] = [];
  observaciones: string = '';
  testDate: string = new Date().toISOString().split('T')[0];
  
  // Chart
  chart: Chart | null = null;
  selectedChartType: 'PHQ9' | 'GAD7' = 'PHQ9';
  estadisticas: TestEstadisticas | null = null;
  showChart = false;
  
  // Alert modal
  showAlertModal = false;
  alertMessage = '';
  alertTest: Test | null = null;
  
  // Notification
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  
  // View test details
  showTestDetails = false;
  selectedTest: Test | null = null;
  
  // Patient list (this would typically come from a users service)
  pacientes: { _id: string; name: string; email: string }[] = [];
  
  // Search
  searchQuery = '';
  filteredTests: Test[] = [];
  
  // Filter
  filterTipo: string = '';
  filterRiesgo: string = '';
  
  // Alerts list
  alertas: Test[] = [];
  showAlertsList = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private testsService: TestsService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadTests();
    this.loadAlertas();
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

  loadTests() {
    this.loading = true;
    this.testsService.obtenerTests().subscribe({
      next: (tests) => {
        this.tests = tests;
        this.filteredTests = tests;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.showNotificationMessage('Error al cargar los tests', 'error');
        this.loading = false;
      }
    });
  }

  loadAlertas() {
    this.testsService.obtenerAlertas().subscribe({
      next: (tests) => {
        this.alertas = tests;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  selectTestType(tipo: 'PHQ9' | 'GAD7') {
    this.selectedTestType = tipo;
    this.loadPreguntas(tipo);
  }

  loadPreguntas(tipo: 'PHQ9' | 'GAD7') {
    this.testsService.obtenerPreguntas(tipo).subscribe({
      next: (preguntas) => {
        this.testPreguntas = preguntas;
        // Initialize responses array with zeros
        this.respuestas = new Array(preguntas.preguntas.length).fill(0);
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.showNotificationMessage('Error al cargar las preguntas', 'error');
      }
    });
  }

  openTestForm() {
    this.showTestForm = true;
    this.showPatientSelector = true;
    this.selectedPatientId = '';
    this.selectedTestType = 'PHQ9';
    this.respuestas = [];
    this.observaciones = '';
    this.testDate = new Date().toISOString().split('T')[0];
    this.loadPreguntas('PHQ9');
  }

  closeTestForm() {
    this.showTestForm = false;
    this.showPatientSelector = false;
    this.testPreguntas = null;
    this.respuestas = [];
  }

  onPatientSelect() {
    if (this.selectedPatientId) {
      this.showPatientSelector = false;
    }
  }

  setRespuesta(index: number, valor: number) {
    this.respuestas[index] = valor;
  }

  guardarTest() {
    if (!this.selectedPatientId) {
      this.showNotificationMessage('Por favor seleccione un paciente', 'error');
      return;
    }

    if (this.respuestas.some(r => r === undefined || r === null)) {
      this.showNotificationMessage('Por favor responda todas las preguntas', 'error');
      return;
    }

    const testData = {
      pacienteId: this.selectedPatientId,
      tipoTest: this.selectedTestType,
      respuestas: [...this.respuestas],
      observaciones: this.observaciones,
      fecha: this.testDate
    };

    this.testsService.crearTest(testData).subscribe({
      next: (response) => {
        this.showNotificationMessage('Test guardado exitosamente', 'success');
        
        // Check for suicidal alert
        if (response.alerta) {
          this.alertMessage = response.alerta;
          this.alertTest = response.test;
          this.showAlertModal = true;
        }
        
        this.closeTestForm();
        this.loadTests();
        this.loadAlertas();
      },
      error: (error) => {
        console.error('Error saving test:', error);
        this.showNotificationMessage('Error al guardar el test', 'error');
      }
    });
  }

  closeAlertModal() {
    this.showAlertModal = false;
    this.alertMessage = '';
    this.alertTest = null;
  }

  verTest(test: Test) {
    this.selectedTest = test;
    this.showTestDetails = true;
  }

  cerrarTestDetails() {
    this.showTestDetails = false;
    this.selectedTest = null;
  }

  eliminarTest(test: Test) {
    if (confirm('¿Está seguro de que desea eliminar este test?')) {
      if (test._id) {
        this.testsService.eliminarTest(test._id).subscribe({
          next: () => {
            this.showNotificationMessage('Test eliminado exitosamente', 'success');
            this.loadTests();
            this.loadAlertas();
          },
          error: (error) => {
            console.error('Error deleting test:', error);
            this.showNotificationMessage('Error al eliminar el test', 'error');
          }
        });
      }
    }
  }

  verEstadisticas(pacienteId: string | { _id: string; name: string; email: string }) {
    const id = typeof pacienteId === 'string' ? pacienteId : pacienteId._id;
    if (!id) {
      this.showNotificationMessage('No se pudo obtener el ID del paciente', 'error');
      return;
    }
    
    this.testsService.obtenerEstadisticas(id).subscribe({
      next: (stats) => {
        this.estadisticas = stats;
        this.showChart = true;
        this.selectedChartType = 'PHQ9';
        // Use setTimeout to ensure the modal is rendered before creating the chart
        setTimeout(() => this.renderChart(), 100);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.showNotificationMessage('Error al cargar estadísticas', 'error');
      }
    });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const trend = this.selectedChartType === 'PHQ9' 
      ? this.estadisticas?.phq9.trend || []
      : this.estadisticas?.gad7.trend || [];

    if (trend.length === 0) {
      return;
    }

    const labels = trend.map(t => {
      const date = new Date(t.fecha);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    });

    const data = trend.map(t => t.puntaje);

    const colors = trend.map(t => {
      switch (t.nivelRiesgo) {
        case 'Bajo': return '#4CAF50';
        case 'Medio': return '#FF9800';
        case 'Alto': return '#F44336';
        default: return '#2196F3';
      }
    });

    const canvas = document.getElementById('testChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Puntaje ${this.selectedChartType === 'PHQ9' ? 'PHQ-9' : 'GAD-7'}`,
          data: data,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointRadius: 8,
          pointHoverRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              afterLabel: (context: any) => {
                const index = context.dataIndex;
                const nivel = trend[index]?.nivelRiesgo || '';
                return `Nivel de Riesgo: ${nivel}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: this.selectedChartType === 'PHQ9' ? 27 : 21,
            title: {
              display: true,
              text: 'Puntaje'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          }
        }
      }
    });
  }

  switchChartType(tipo: 'PHQ9' | 'GAD7') {
    this.selectedChartType = tipo;
    this.renderChart();
  }

  closeChart() {
    this.showChart = false;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.estadisticas = null;
  }

  applyFilters() {
    let filtered = [...this.tests];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(test => {
        const paciente = test.pacienteId as { _id: string; name: string; email: string };
        return paciente?.name?.toLowerCase().includes(query) ||
               paciente?.email?.toLowerCase().includes(query);
      });
    }

    if (this.filterTipo) {
      filtered = filtered.filter(test => test.tipoTest === this.filterTipo);
    }

    if (this.filterRiesgo) {
      filtered = filtered.filter(test => test.nivelRiesgo === this.filterRiesgo);
    }

    this.filteredTests = filtered;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterTipo = '';
    this.filterRiesgo = '';
    this.filteredTests = [...this.tests];
  }

  toggleAlertsList() {
    this.showAlertsList = !this.showAlertsList;
  }

  getPacienteName(test: Test): string {
    if (typeof test.pacienteId === 'object' && test.pacienteId !== null) {
      return test.pacienteId.name || `Paciente ID: ${test.pacienteId._id || 'N/A'}`;
    }
    // If pacienteId is a string, show it as the ID
    return `Paciente ID: ${test.pacienteId}`;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  getNivelRiesgoColor(nivel: string): string {
    return this.testsService.getNivelRiesgoColor(nivel);
  }

  getNivelRiesgoBgColor(nivel: string): string {
    return this.testsService.getNivelRiesgoBgColor(nivel);
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}
