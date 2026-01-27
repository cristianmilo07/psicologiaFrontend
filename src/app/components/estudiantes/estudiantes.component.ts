import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss'
})
export class EstudiantesComponent {
  currentPage = 1;
  submitted = false;
  formData = {
    clima: '',
    emoji: '',
    lag: 3,
    apoyo: 3,
    grupo: 3,
    bateria: '',
    pestanas: 3,
    desaparecer: 3,
    encajar: 3,
    critico: 3,
    nudo: 3,
    llamar: 3,
    asusta: 5,
    escucha: 3,
    secreto: '',
    cambiar: ''
  };

  selectOption(field: string, value: string) {
    (this.formData as any)[field] = value;
  }

  nextPage() {
    if (this.currentPage < 5) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  submitForm() {
    console.log('Form Data:', this.formData);
    this.submitted = true;
  }
}
