import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-historia-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-historia-clinica.component.html',
  styleUrls: ['./detalle-historia-clinica.component.scss']
})
export class DetalleHistoriaClinicaComponent implements OnInit {
  historia: any = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
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
          this.historia = response;
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

  logout() {
    this.authService.logout();
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }

  volver() {
    this.router.navigate(['/historia-clinica']);
  }
}