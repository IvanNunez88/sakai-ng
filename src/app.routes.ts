import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

// Cada pantalla se descarga hasta que se abre (lazy loading)
export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: 'alumnos', pathMatch: 'full' },
            { path: 'alumnos', loadComponent: () => import('./app/pages/alumnos/alumnos').then((m) => m.Alumnos) },
            { path: 'maestros', loadComponent: () => import('./app/pages/maestros/maestros').then((m) => m.Maestros) },
            { path: 'carreras', loadComponent: () => import('./app/pages/carreras/carreras').then((m) => m.Carreras) }
        ]
    },
    { path: '**', redirectTo: '' }
];
