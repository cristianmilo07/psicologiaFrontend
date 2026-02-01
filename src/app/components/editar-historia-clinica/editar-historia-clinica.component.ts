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
  acompanamiento: string = '';
  mostrarCitacionPadres: boolean = false;

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
      acompanamiento: ['', Validators.required],
      descripcionAcompanamientoPadre: [''],
      motivoConsulta: ['', Validators.required],
      antecedentesMedicos: [''],
      sintomasActuales: ['', Validators.required],
      diagnostico: [''],
      planTratamiento: [''],
      notas: [''],
      // Información familiar - validación dinámica según acompanamiento
      nombrePadre: [''],
      nombreMadre: [''],
      nombreAcudiente: [''],
      tieneHermanosColegio: [''],
      gradoHermano: [''],
      parentescoAcudiente: [''],
      sesiones: this.fb.array([]),
      sesionesAcompanamientoFamiliar: this.fb.array([])
    });

    // Escuchar cambios en acompanamiento para validar dinámicamente
    this.historiaClinicaForm.get('acompanamiento')?.valueChanges.subscribe(tipo => {
      this.updateValidators(tipo);
    });
  }

  updateValidators(tipo: string) {
    const nombrePadre = this.historiaClinicaForm.get('nombrePadre');
    const nombreMadre = this.historiaClinicaForm.get('nombreMadre');
    const nombreAcudiente = this.historiaClinicaForm.get('nombreAcudiente');
    const parentescoAcudiente = this.historiaClinicaForm.get('parentescoAcudiente');
    const motivoConsulta = this.historiaClinicaForm.get('motivoConsulta');
    const sintomasActuales = this.historiaClinicaForm.get('sintomasActuales');

    if (tipo === 'acompanante_estudiante') {
      // Campos requeridos para acompanante_estudiante
      nombrePadre?.setValidators([Validators.required]);
      nombreMadre?.setValidators([Validators.required]);
      nombreAcudiente?.setValidators([Validators.required]);
      parentescoAcudiente?.setValidators([Validators.required]);
      motivoConsulta?.setValidators([Validators.required]);
      sintomasActuales?.setValidators([Validators.required]);
    } else if (tipo === 'acompanamiento_padre') {
      // Solo acompanamiento es requerido
      nombrePadre?.setValidators([]);
      nombreMadre?.setValidators([]);
      nombreAcudiente?.setValidators([]);
      parentescoAcudiente?.setValidators([]);
      motivoConsulta?.setValidators([]);
      sintomasActuales?.setValidators([]);
    } else {
      // Limpiar todos los validators opcionales
      nombrePadre?.setValidators([]);
      nombreMadre?.setValidators([]);
      nombreAcudiente?.setValidators([]);
      parentescoAcudiente?.setValidators([]);
      motivoConsulta?.setValidators([]);
      sintomasActuales?.setValidators([]);
    }

    // Actualizar el estado de los controles
    nombrePadre?.updateValueAndValidity();
    nombreMadre?.updateValueAndValidity();
    nombreAcudiente?.updateValueAndValidity();
    parentescoAcudiente?.updateValueAndValidity();
    motivoConsulta?.updateValueAndValidity();
    sintomasActuales?.updateValueAndValidity();
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

    this.http.get(`http://localhost:3000/api/historias/${id}`, { headers })
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

    this.acompanamiento = historia.acompanamiento || '';

    this.historiaClinicaForm.patchValue({
      nombrePaciente: historia.nombrePaciente || '',
      fechaNacimiento: fechaNacimiento,
      genero: historia.genero || '',
      direccion: historia.direccion || '',
      telefono: historia.telefono || '',
      email: historia.email || '',
      acompanamiento: historia.acompanamiento || '',
      descripcionAcompanamientoPadre: historia.descripcionAcompanamientoPadre || '',
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
          _id: [sesion._id || null],
          fecha: [fechaSesion, Validators.required],
          tipo: [sesion.tipo || '', Validators.required],
          notas: [sesion.notas || '', Validators.required],
          objetivos: [sesion.objetivos || ''],
          progreso: [sesion.progreso || '']
        }));
      });
    }

    // Load sesionesAcompanamientoFamiliar
    const sesionesAcompFamiliarArray = this.historiaClinicaForm.get('sesionesAcompanamientoFamiliar') as FormArray;
    sesionesAcompFamiliarArray.clear();

    if (historia.sesionesAcompanamientoFamiliar && historia.sesionesAcompanamientoFamiliar.length > 0) {
      historia.sesionesAcompanamientoFamiliar.forEach((sesion: any) => {
        sesionesAcompFamiliarArray.push(this.fb.group({
          _id: [sesion._id || null],
          descripcion: [sesion.descripcion || '']
        }));
      });
      this.mostrarCitacionPadres = true;
    } else {
      // Add initial empty session
      sesionesAcompFamiliarArray.push(this.fb.group({
        _id: [null],
        descripcion: ['']
      }));
    }

    // Set existing files
    this.existingFiles = historia.archivos || [];

    // Apply validators based on acompañamiento type
    this.updateValidators(historia.acompanamiento || '');
  }

  logout() {
    this.authService.logout();
  }

  get sesiones(): FormArray {
    return this.historiaClinicaForm.get('sesiones') as FormArray;
  }

  get sesionesAcompanamientoFamiliar(): FormArray {
    return this.historiaClinicaForm.get('sesionesAcompanamientoFamiliar') as FormArray;
  }

  toggleCitacionPadres() {
    this.mostrarCitacionPadres = !this.mostrarCitacionPadres;
  }

  agregarSesionAcompanamientoFamiliar() {
    this.sesionesAcompanamientoFamiliar.push(this.fb.group({
      descripcion: ['']
    }));
  }

  eliminarSesionAcompanamientoFamiliar(index: number) {
    this.sesionesAcompanamientoFamiliar.removeAt(index);
  }

  get isAcompanamientoSelected(): boolean {
    return !!this.historiaClinicaForm.get('acompanamiento')?.value;
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
      'acompanamiento', 'descripcionAcompanamientoPadre', 'motivoConsulta', 'antecedentesMedicos', 'sintomasActuales', 'diagnostico',
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

    // Compare sesionesAcompanamientoFamiliar array
    if (currentData.sesionesAcompanamientoFamiliar.length !== this.originalHistoriaData.sesionesAcompanamientoFamiliar?.length) {
      return true;
    }

    for (let i = 0; i < currentData.sesionesAcompanamientoFamiliar.length; i++) {
      const currentSesion = currentData.sesionesAcompanamientoFamiliar[i];
      const originalSesion = this.originalHistoriaData.sesionesAcompanamientoFamiliar?.[i];

      if (!originalSesion || currentSesion.descripcion !== originalSesion.descripcion) {
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
      // Mostrar campos inválidos para depuración
      const invalidFields: string[] = [];
      Object.keys(this.historiaClinicaForm.controls).forEach(key => {
        const control = this.historiaClinicaForm.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });
      console.log('Campos inválidos:', invalidFields);
      alert('Por favor, complete todos los campos requeridos. Campos faltantes: ' + invalidFields.join(', '));
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
      if (key === 'sesiones' || key === 'sesionesAcompanamientoFamiliar') {
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

    this.http.put(`http://localhost:3000/api/historias/${this.historiaId}`, formData, { headers })
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