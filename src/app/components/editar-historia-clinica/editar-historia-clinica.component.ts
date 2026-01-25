import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editar-historia-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './editar-historia-clinica.component.html',
  styleUrls: ['./editar-historia-clinica.component.scss']
})
export class EditarHistoriaClinicaComponent implements OnInit {
  user: any = null;
  historiaClinicaForm: FormGroup;
  loading = true;
  historiaId: string = '';
  showConfirmModal = false;
  originalHistoriaData: any = null;
  selectedFiles: File[] = [];
  existingFiles: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.user = this.authService.getCurrentUser();
    this.historiaClinicaForm = this.fb.group({
      nombrePaciente: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      motivoConsulta: ['', Validators.required],
      antecedentesMedicos: [''],
      sintomasActuales: ['', Validators.required],
      diagnostico: [''],
      planTratamiento: [''],
      notas: [''],
      // Información familiar
      nombrePadre: ['', Validators.required],
      nombreMadre: ['', Validators.required],
      nombreAcudiente: ['', Validators.required],
      tieneHermanosColegio: [''], // No requerido
      gradoHermano: [''], // No requerido
      parentescoAcudiente: ['', Validators.required],
      sesiones: this.fb.array([])
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.historiaId = id;
      this.loadHistoriaDetalle(id);
    } else {
      this.router.navigate(['/historia-clinica']);
    }
  }

  loadHistoriaDetalle(id: string) {
    const token = this.authService.getToken();
    if (!token) {
      alert('No estás autenticado');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get(`https://psicologiabackend.onrender.com/api/historias/${id}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.originalHistoriaData = { ...response };
          this.populateForm(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalle de historia:', error);
          this.loading = false;
          if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            this.authService.logout();
          } else if (error.status === 404) {
            alert('Historia clínica no encontrada');
            this.router.navigate(['/historia-clinica']);
          } else {
            alert('Error al cargar la historia clínica');
          }
        }
      });
  }

  populateForm(historia: any) {
    // Format date for input
    const fechaNacimiento = historia.fechaNacimiento ?
      new Date(historia.fechaNacimiento).toISOString().split('T')[0] : '';

    this.historiaClinicaForm.patchValue({
      nombrePaciente: historia.nombrePaciente || '',
      fechaNacimiento: fechaNacimiento,
      genero: historia.genero || '',
      direccion: historia.direccion || '',
      telefono: historia.telefono || '',
      email: historia.email || '',
      motivoConsulta: historia.motivoConsulta || '',
      antecedentesMedicos: historia.antecedentesMedicos || '',
      sintomasActuales: historia.sintomasActuales || '',
      diagnostico: historia.diagnostico || '',
      planTratamiento: historia.planTratamiento || '',
      notas: historia.notas || '',
      // Información familiar
      nombrePadre: historia.nombrePadre || '',
      nombreMadre: historia.nombreMadre || '',
      nombreAcudiente: historia.nombreAcudiente || '',
      tieneHermanosColegio: historia.tieneHermanosColegio || '',
      gradoHermano: historia.gradoHermano || '',
      parentescoAcudiente: historia.parentescoAcudiente || ''
    });

    // Clear existing sesiones
    const sesionesArray = this.historiaClinicaForm.get('sesiones') as FormArray;
    sesionesArray.clear();

    // Add existing sesiones
    if (historia.sesiones && historia.sesiones.length > 0) {
      historia.sesiones.forEach((sesion: any) => {
        const fechaSesion = sesion.fecha ?
          new Date(sesion.fecha).toISOString().split('T')[0] : '';

        sesionesArray.push(this.fb.group({
          fecha: [fechaSesion, Validators.required],
          tipo: [sesion.tipo || '', Validators.required],
          notas: [sesion.notas || '', Validators.required],
          objetivos: [sesion.objetivos || ''],
          progreso: [sesion.progreso || '']
        }));
      });
    }

    // Set existing files
    this.existingFiles = historia.archivos || [];
  }

  logout() {
    this.authService.logout();
  }

  get sesiones(): FormArray {
    return this.historiaClinicaForm.get('sesiones') as FormArray;
  }

  agregarSesion() {
    this.sesiones.push(this.fb.group({
      fecha: ['', Validators.required],
      tipo: ['', Validators.required],
      notas: ['', Validators.required],
      objetivos: [''],
      progreso: ['']
    }));
  }

  eliminarSesion(index: number) {
    this.sesiones.removeAt(index);
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingFile(index: number) {
    this.existingFiles.splice(index, 1);
  }

  hasChanges(): boolean {
    if (!this.originalHistoriaData) return false;

    const currentData = this.historiaClinicaForm.value;

    // Compare key fields
    const fieldsToCompare = [
      'nombrePaciente', 'fechaNacimiento', 'genero', 'direccion', 'telefono', 'email',
      'motivoConsulta', 'antecedentesMedicos', 'sintomasActuales', 'diagnostico',
      'planTratamiento', 'notas', 'nombrePadre', 'nombreMadre', 'nombreAcudiente',
      'tieneHermanosColegio', 'gradoHermano', 'parentescoAcudiente'
    ];

    for (const field of fieldsToCompare) {
      if (currentData[field] !== this.originalHistoriaData[field]) {
        return true;
      }
    }

    // Compare sesiones array
    if (currentData.sesiones.length !== this.originalHistoriaData.sesiones.length) {
      return true;
    }

    for (let i = 0; i < currentData.sesiones.length; i++) {
      const currentSesion = currentData.sesiones[i];
      const originalSesion = this.originalHistoriaData.sesiones[i];

      if (!originalSesion ||
          currentSesion.fecha !== originalSesion.fecha ||
          currentSesion.tipo !== originalSesion.tipo ||
          currentSesion.notas !== originalSesion.notas ||
          currentSesion.objetivos !== originalSesion.objetivos ||
          currentSesion.progreso !== originalSesion.progreso) {
        return true;
      }
    }

    return false;
  }

  onSubmit() {
    if (this.historiaClinicaForm.valid) {
      if (!this.hasChanges()) {
        // No changes, just navigate back
        this.router.navigate(['/historia-clinica']);
        return;
      }

      // Show confirmation modal
      this.showConfirmModal = true;
    } else {
      alert('Por favor, complete todos los campos requeridos');
    }
  }

  confirmUpdate() {
    this.showConfirmModal = false;

    const token = this.authService.getToken();
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    const formData = new FormData();
    const formValue = this.historiaClinicaForm.value;

    // Append form fields
    Object.keys(formValue).forEach(key => {
      if (key === 'sesiones') {
        formData.append(key, JSON.stringify(formValue[key]));
      } else {
        formData.append(key, formValue[key]);
      }
    });

    // Append new files
    this.selectedFiles.forEach((file, index) => {
      formData.append('archivos', file);
    });

    // Append existing files
    formData.append('existingArchivos', JSON.stringify(this.existingFiles));

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put(`https://psicologiabackend.onrender.com/api/historias/${this.historiaId}`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Historia clínica actualizada:', response);
          alert('Historia clínica actualizada exitosamente');
          this.router.navigate(['/historia-clinica']);
        },
        error: (error) => {
          console.error('Error al actualizar historia clínica:', error);
          if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            this.authService.logout();
          } else {
            alert('Error al actualizar la historia clínica: ' + (error.error?.message || 'Error desconocido'));
          }
        }
      });
  }

  cancelUpdate() {
    this.showConfirmModal = false;
  }

  volver() {
    this.router.navigate(['/historia-clinica']);
  }
}