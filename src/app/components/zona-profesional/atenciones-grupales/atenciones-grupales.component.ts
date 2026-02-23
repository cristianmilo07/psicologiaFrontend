import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AtencionesGrupalesService, AtencionGrupal } from '../../../services/atenciones-grupales.service';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-atenciones-grupales',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './atenciones-grupales.component.html',
  styleUrl: './atenciones-grupales.component.scss'
})
export class AtencionesGrupalesComponent implements OnInit {
  user: any = null;
  selectedMonth = '';
  selectedMonthLabel = '';

  meses: { value: string, label: string }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private atencionesService: AtencionesGrupalesService
  ) {
    this.user = this.authService.getCurrentUser();
    this.initializeMeses();
  }

  atencionesPorGrado: any[] = [];
  atenciones: AtencionGrupal[] = [];
  showForm = false;
  showEditForm = false;
  maxAtenciones = 0;
  loading = false;

  // Notification modal
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  nuevaAtencion: Omit<AtencionGrupal, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
    grado: 'Preescolar',
    fecha: '',
    tema: '',
    numeroParticipantes: 1,
    objetivos: '',
    actividades: '',
    observaciones: '',
    imagenes: []
  };

  editarAtencion: Partial<AtencionGrupal> = {};
  editingId: string = '';
  
  // Image upload properties
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  selectedEditFiles: File[] = [];
  editImagePreviews: string[] = [];
  uploadingImages = false;
  showImageModal = false;
  selectedAtencionForImages: AtencionGrupal | null = null;
  previewImageUrl: string | null = null;

  grados = [
    'Preescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
    'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
  ];

  ngOnInit() {
    this.loadAtenciones();
  }

  initializeMeses() {
    const currentYear = new Date().getFullYear();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Add months for current year and next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      months.forEach((monthName, index) => {
        const monthValue = `${index + 1}-${year}`; // Use month number (1-12)
        const monthLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        this.meses.push({ value: monthValue, label: monthLabel });
      });
    }

    // Set default to current month
    const currentMonth = new Date().getMonth();
    const currentMonthName = months[currentMonth];
    this.selectedMonth = `${currentMonth + 1}-${currentYear}`;
    this.selectedMonthLabel = currentMonthName;
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

  onMonthChange() {
    // Logic to load data for selected month
    const selectedMes = this.meses.find(m => m.value === this.selectedMonth);
    this.selectedMonthLabel = selectedMes ? selectedMes.label.split(' ')[0].toLowerCase() : 'enero';
    this.loadAtenciones();
  }

  toggleDetails(grado: any) {
    grado.expanded = !grado.expanded;
  }

  loadAtenciones() {
    this.loading = true;
    const [mes, anio] = this.selectedMonth.split('-');
    const mesIndex = parseInt(mes);

    this.atencionesService.obtenerAtencionesPorMes(mesIndex, parseInt(anio)).subscribe({
      next: (atenciones) => {
        this.atenciones = atenciones;
        this.updateAtencionesPorGrado();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading atenciones:', error);
        this.atenciones = [];
        this.updateAtencionesPorGrado();
        this.loading = false;
      }
    });
  }

  updateAtencionesPorGrado() {
    const gradoMap = new Map<string, { total: number, dias: number[], expanded: boolean }>();

    this.grados.forEach(grado => {
      gradoMap.set(grado, { total: 0, dias: [], expanded: false });
    });

    this.atenciones.forEach(atencion => {
      const gradoData = gradoMap.get(atencion.grado);
      if (gradoData) {
        gradoData.total++;
        const dia = new Date(atencion.fecha).getDate();
        if (!gradoData.dias.includes(dia)) {
          gradoData.dias.push(dia);
          gradoData.dias.sort((a, b) => a - b);
        }
      }
    });

    this.atencionesPorGrado = Array.from(gradoMap.entries()).map(([grado, data]) => ({
      grado,
      ...data
    }));

    this.maxAtenciones = this.atencionesPorGrado.length > 0 ? Math.max(...this.atencionesPorGrado.map(g => g.total)) : 0;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.clearImageSelection();
    }
  }

  guardarAtencion() {
    if (!this.nuevaAtencion.fecha || !this.nuevaAtencion.tema || !this.nuevaAtencion.numeroParticipantes) {
      this.showNotificationModal('Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.atencionesService.crearAtencion(this.nuevaAtencion).subscribe({
      next: (response) => {
        // If there are images to upload, upload them now
        if (this.selectedFiles.length > 0 && response.atencion._id) {
          this.atencionesService.subirImagenes(response.atencion._id, this.selectedFiles).subscribe({
            next: () => {
              this.showNotificationModal('¡Atención grupal guardada con imágenes exitosamente! 🎉', 'success');
              this.clearImageSelection();
            },
            error: (error) => {
              console.error('Error al subir imágenes:', error);
              this.showNotificationModal('¡Atención guardada, pero hubo error al subir las imágenes! 📷', 'success');
            }
          });
        } else {
          this.showNotificationModal('¡Atención grupal guardada exitosamente! 🎉', 'success');
        }
        
        this.showForm = false;

        // Update selected month to match the saved date's month/year
        const savedDate = new Date(this.nuevaAtencion.fecha);
        const savedMonth = savedDate.getMonth() + 1; // getMonth() returns 0-11
        const savedYear = savedDate.getFullYear();
        const monthValue = `${savedMonth}-${savedYear}`;

        this.selectedMonth = monthValue;
        this.selectedMonthLabel = this.getMonthName(savedMonth);

        this.resetForm();
        this.loadAtenciones();
      },
      error: (error) => {
        console.error('Error saving atencion:', error);
        this.showNotificationModal('Error al guardar la atención grupal 😔', 'error');
      }
    });
  }

  showNotificationModal(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }

  closeNotification() {
    this.showNotification = false;
  }

  descargarPDF() {
    const element = document.querySelector('.main-content') as HTMLElement;
    if (!element) return;

    const selectedMonthLabel = this.meses.find(m => m.value === this.selectedMonth)?.label || 'Mes';

    const opt = {
      margin: 1,
      filename: `atenciones-grupales-${selectedMonthLabel.toLowerCase().replace(' ', '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    // Hide elements that shouldn't be in PDF
    const addButton = document.querySelector('.add-button') as HTMLElement;
    const notificationModal = document.querySelector('.notification-modal') as HTMLElement;
    const formModal = document.querySelector('.modal-overlay') as HTMLElement;

    if (addButton) addButton.style.display = 'none';
    if (notificationModal) notificationModal.style.display = 'none';
    if (formModal) formModal.style.display = 'none';

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore hidden elements
      if (addButton) addButton.style.display = '';
      if (notificationModal) notificationModal.style.display = '';
      if (formModal) formModal.style.display = '';
    });
  }

  exportarExcel(): void {
    if (this.atenciones.length === 0) {
      this.showNotificationModal('No hay datos para exportar', 'error');
      return;
    }

    // Prepare data for Excel
    const datos = this.atenciones.map((atencion, index) => ({
      '#': index + 1,
      'Grado': atencion.grado,
      'Fecha': new Date(atencion.fecha).toLocaleDateString('es-CO'),
      'Tema': atencion.tema,
      'Participantes': atencion.numeroParticipantes,
      'Objetivos': atencion.objetivos || '',
      'Actividades': atencion.actividades || '',
      'Observaciones': atencion.observaciones || ''
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atenciones Grupales');

    // Get month label for filename
    const selectedMonthLabel = this.meses.find(m => m.value === this.selectedMonth)?.label || 'Mes';

    // Generate file name
    const fileName = `atenciones-grupales-${selectedMonthLabel.toLowerCase().replace(' ', '-')}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);

    this.showNotificationModal('¡Archivo Excel descargado exitosamente! 📊', 'success');
  }

  getMonthName(monthNumber: number): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[monthNumber - 1];
  }

  getMonthNumber(monthName: string): number {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months.indexOf(monthName) + 1;
  }

  resetForm() {
    this.nuevaAtencion = {
      grado: 'Preescolar',
      fecha: '',
      tema: '',
      numeroParticipantes: 1,
      objetivos: '',
      actividades: '',
      observaciones: '',
      imagenes: []
    };
    this.clearImageSelection();
  }

  getAtencionDetails(grado: string, dia: number): string {
    const atencion = this.atenciones.find(a =>
      a.grado === grado && new Date(a.fecha).getDate() === dia
    );
    return atencion ? `Tema: ${atencion.tema}` : 'Sesión de terapia grupal';
  }

  getAtencionesByGrado(grado: string): AtencionGrupal[] {
    return this.atenciones.filter(a => a.grado === grado);
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta atención grupal?')) {
      this.atencionesService.eliminarAtencion(id).subscribe({
        next: () => {
          this.showNotificationModal('¡Atención grupal eliminada exitosamente! 🗑️', 'success');
          this.loadAtenciones();
        },
        error: (error) => {
          console.error('Error al eliminar atención:', error);
          this.showNotificationModal('Error al eliminar la atención grupal 😔', 'error');
        }
      });
    }
  }

  handleEdit(atencion: AtencionGrupal): void {
    this.editingId = atencion._id!;
    this.editarAtencion = { 
      ...atencion,
      imagenes: atencion.imagenes ? [...atencion.imagenes] : []
    };
    this.toggleEditForm();
  }

  toggleEditForm(): void {
    this.showEditForm = !this.showEditForm;
    if (!this.showEditForm) {
      this.editarAtencion = {};
      this.editingId = '';
      this.clearEditImageSelection();
    }
  }

  actualizarAtencion(): void {
    if (!this.editingId) {
      this.showNotificationModal('Error: No hay atención seleccionada para editar', 'error');
      return;
    }

    this.atencionesService.actualizarAtencion(this.editingId, this.editarAtencion).subscribe({
      next: () => {
        this.showNotificationModal('¡Atención grupal actualizada exitosamente! ✏️', 'success');
        this.toggleEditForm();
        this.loadAtenciones();
      },
      error: (error) => {
        console.error('Error al actualizar atención:', error);
        this.showNotificationModal('Error al actualizar la atención grupal 😔', 'error');
      }
    });
  }

  // Image handling methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files), 'new');
    }
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files), 'edit');
    }
  }

  processFiles(files: File[], mode: 'new' | 'edit'): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.showNotificationModal(`Archivo ${file.name} no es una imagen válida`, 'error');
        continue;
      }
      if (file.size > maxSize) {
        this.showNotificationModal(`Archivo ${file.name} excede el tamaño máximo de 5MB`, 'error');
        continue;
      }

      if (mode === 'new') {
        this.selectedFiles.push(file);
      } else {
        this.selectedEditFiles.push(file);
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (mode === 'new') {
          this.imagePreviews.push(e.target?.result as string);
        } else {
          this.editImagePreviews.push(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number, mode: 'new' | 'edit'): void {
    if (mode === 'new') {
      this.selectedFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
    } else {
      this.selectedEditFiles.splice(index, 1);
      this.editImagePreviews.splice(index, 1);
    }
  }

  clearImageSelection(): void {
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  clearEditImageSelection(): void {
    this.selectedEditFiles = [];
    this.editImagePreviews = [];
  }

  openImageModal(atencion: AtencionGrupal): void {
    this.selectedAtencionForImages = atencion;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedAtencionForImages = null;
    this.clearEditImageSelection();
  }

  uploadImages(): void {
    if (!this.selectedAtencionForImages?._id || this.selectedFiles.length === 0) {
      this.showNotificationModal('No hay imágenes para subir', 'error');
      return;
    }

    this.uploadingImages = true;
    this.atencionesService.subirImagenes(this.selectedAtencionForImages._id, this.selectedFiles).subscribe({
      next: (response) => {
        this.showNotificationModal('¡Imágenes subidas exitosamente! 📷', 'success');
        this.clearImageSelection();
        this.loadAtenciones();
        this.uploadingImages = false;
        // Update the modal with new images
        if (this.selectedAtencionForImages) {
          this.selectedAtencionForImages.imagenes = response.atencion.imagenes;
        }
      },
      error: (error) => {
        console.error('Error al subir imágenes:', error);
        this.showNotificationModal('Error al subir las imágenes 😔', 'error');
        this.uploadingImages = false;
      }
    });
  }

  uploadEditImages(): void {
    if (!this.editingId || this.selectedEditFiles.length === 0) {
      return;
    }

    this.uploadingImages = true;
    this.atencionesService.subirImagenes(this.editingId, this.selectedEditFiles).subscribe({
      next: (response) => {
        this.showNotificationModal('¡Imágenes subidas exitosamente! 📷', 'success');
        this.clearEditImageSelection();
        this.loadAtenciones();
        this.uploadingImages = false;
        // Update editAtencion with new images
        this.editarAtencion.imagenes = response.atencion.imagenes;
      },
      error: (error) => {
        console.error('Error al subir imágenes:', error);
        this.showNotificationModal('Error al subir las imágenes 😔', 'error');
        this.uploadingImages = false;
      }
    });
  }

  deleteImage(imageIndex: number): void {
    if (!this.selectedAtencionForImages?._id) return;

    if (confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      this.atencionesService.eliminarImagen(this.selectedAtencionForImages._id, imageIndex).subscribe({
        next: (response) => {
          this.showNotificationModal('¡Imagen eliminada exitosamente! 🗑️', 'success');
          this.selectedAtencionForImages!.imagenes = response.atencion.imagenes;
          this.loadAtenciones();
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
          this.showNotificationModal('Error al eliminar la imagen 😔', 'error');
        }
      });
    }
  }

  deleteEditImage(imageIndex: number): void {
    if (!this.editingId) return;

    if (confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      this.atencionesService.eliminarImagen(this.editingId, imageIndex).subscribe({
        next: (response) => {
          this.showNotificationModal('¡Imagen eliminada exitosamente! 🗑️', 'success');
          this.editarAtencion.imagenes = response.atencion.imagenes;
          this.loadAtenciones();
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
          this.showNotificationModal('Error al eliminar la imagen 😔', 'error');
        }
      });
    }
  }

  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    // If the path already starts with http, return it as is
    if (relativePath.startsWith('http')) return relativePath;
    // Otherwise, prepend the base URL
    return this.atencionesService.getImageUrl(relativePath);
  }

  openImagePreview(url: string): void {
    this.previewImageUrl = url;
  }
}
