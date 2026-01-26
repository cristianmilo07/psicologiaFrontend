import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nueva-historia-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './nueva-historia-clinica.component.html',
  styleUrl: './nueva-historia-clinica.component.scss'
})
export class NuevaHistoriaClinicaComponent {
  user: any = null;
  historiaClinicaForm: FormGroup;
  showModal: boolean = false;
  showSuccessModal: boolean = false;
  selectedFiles: File[] = [];
  recognition: any;
  isListening: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.user = this.authService.getCurrentUser();

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES'; // Spanish

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.appendToField(transcript);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
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

  logout() {
    this.authService.logout();
  }

  closeModalAndLogout() {
    this.showModal = false;
    this.logout();
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

  toggleSpeechRecognition(fieldName: string) {
    if (!this.recognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      (this.recognition as any).fieldName = fieldName; // Store which field to update
      this.recognition.start();
      this.isListening = true;
    }
  }

  appendToField(transcript: string) {
    const fieldName = (this.recognition as any).fieldName;
    const currentValue = this.historiaClinicaForm.get(fieldName)?.value || '';
    this.historiaClinicaForm.get(fieldName)?.setValue(currentValue + ' ' + transcript);
  }

  onSubmit() {
    if (this.historiaClinicaForm.valid) {
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

      // Append files
      this.selectedFiles.forEach((file, index) => {
        formData.append('archivos', file);
      });

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.post('http://localhost:3000/api/historias', formData, { headers })
        .subscribe({
          next: (response: any) => {
            this.showSuccessModal = true;
            // Reset form but keep the structure intact
            this.historiaClinicaForm.reset();
            // Clear sesiones array
            const sesionesArray = this.historiaClinicaForm.get('sesiones') as FormArray;
            while (sesionesArray.length > 0) {
              sesionesArray.removeAt(0);
            }
            // Clear selected files
            this.selectedFiles = [];
          },
          error: (error) => {
            console.error('Error al crear historia clínica:', error);
            if (error.status === 401) {
              this.showModal = true;
            } else {
              alert('Error al crear la historia clínica: ' + (error.error?.message || 'Error desconocido'));
            }
          }
        });
    } else {
      alert('Por favor, complete todos los campos requeridos');
    }
  }

  aceptarSuccess() {
    this.showSuccessModal = false;
    this.router.navigate(['/historia-clinica']);
  }
}
