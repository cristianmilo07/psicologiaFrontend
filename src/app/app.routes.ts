import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'zona-ninos',
    loadComponent: () => import('./components/zona-ninos/zona-ninos.component').then(m => m.ZonaNinosComponent),
    canActivate: [AuthGuard, RoleGuard(['child', 'parent', 'admin'])]
  },
  {
    path: 'zona-padres',
    loadComponent: () => import('./components/zona-padres/zona-padres.component').then(m => m.ZonaPadresComponent),
    canActivate: [AuthGuard, RoleGuard(['parent', 'admin'])]
  },
    {
    path: 'calendario',
    loadComponent: () => import('./components/calendario/calendario.component').then(m => m.CalendarioComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'zona-profesional',
    loadComponent: () => import('./components/zona-profesional/zona-profesional.component').then(m => m.ZonaProfesionalComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  },
  {
    path: 'historia-clinica',
    loadComponent: () => import('./components/historia-clinica/historia-clinica.component').then(m => m.HistoriaClinicaComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  },
  {
    path: 'nueva-historia-clinica',
    loadComponent: () => import('./components/nueva-historia-clinica/nueva-historia-clinica.component').then(m => m.NuevaHistoriaClinicaComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  },
  {
    path: 'detalle-historia-clinica/:id',
    loadComponent: () => import('./components/detalle-historia-clinica/detalle-historia-clinica.component').then(m => m.DetalleHistoriaClinicaComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  },
  {
    path: 'editar-historia-clinica/:id',
    loadComponent: () => import('./components/editar-historia-clinica/editar-historia-clinica.component').then(m => m.EditarHistoriaClinicaComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  },
  {
    path: 'reportes-emocionales',
    loadComponent: () => import('./components/reportes-emocionales/reportes-emocionales.component').then(m => m.ReportesEmocionalesComponent),
    canActivate: [AuthGuard, RoleGuard(['child', 'parent', 'admin'])]
  },
  {
    path: 'lista-reportes-emocionales',
    loadComponent: () => import('./components/lista-reportes-emocionales/lista-reportes-emocionales.component').then(m => m.ListaReportesEmocionalesComponent),
    canActivate: [AuthGuard, RoleGuard(['child', 'parent', 'admin'])]
  },
  {
    path: 'ver-reporte-emocional/:id',
    loadComponent: () => import('./components/ver-reporte-emocional/ver-reporte-emocional.component').then(m => m.VerReporteEmocionalComponent),
    canActivate: [AuthGuard, RoleGuard(['child', 'parent', 'admin'])]
  },
  {
    path: 'atenciones-grupales',
    loadComponent: () => import('./components/zona-profesional/atenciones-grupales/atenciones-grupales.component').then(m => m.AtencionesGrupalesComponent),
    canActivate: [AuthGuard, RoleGuard(['professional', 'admin'])]
  }
  
];

