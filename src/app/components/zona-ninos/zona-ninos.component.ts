import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-zona-ninos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './zona-ninos.component.html',
  styleUrls: ['./zona-ninos.component.scss']
})
export class ZonaNinosComponent {
  emotions = [
    { name: 'Feliz', icon: '😊', color: '#FFD93D', value: 75 },
    { name: 'Triste', icon: '😢', color: '#4A90E2', value: 20 },
    { name: 'Enojado', icon: '😠', color: '#FF8C42', value: 15 },
    { name: 'Sorprendido', icon: '😲', color: '#FFD93D', value: 30 }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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

