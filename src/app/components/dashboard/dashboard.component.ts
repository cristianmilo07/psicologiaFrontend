import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user: any = null;
  title: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
    this.setTitle();
  }

  private setTitle() {
    if (this.user) {
      switch (this.user.role) {
        case 'child':
          this.title = `BIENVENIDO, ${this.user.name.toUpperCase()}`;
          break;
        case 'parent':
          this.title = `BIENVENIDO, ${this.user.name.toUpperCase()}`;
          break;
        case 'professional':
          this.title = 'BIENVENIDA, RECTORA';
          break;
        case 'admin':
          this.title = 'BIENVENIDO, PSICÓLOGA CAROLINA';
          break;
        default:
          this.title = 'BIENVENIDO';
      }
    } else {
      this.title = 'BIENVENIDO';
    }
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

