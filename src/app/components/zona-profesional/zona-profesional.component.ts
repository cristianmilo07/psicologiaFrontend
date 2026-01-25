import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-zona-profesional',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './zona-profesional.component.html',
  styleUrls: ['./zona-profesional.component.scss']
})
export class ZonaProfesionalComponent {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
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

