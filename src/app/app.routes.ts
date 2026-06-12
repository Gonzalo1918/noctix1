import { Routes } from '@angular/router';
import { HomeComponent } from './components/views/home/home';
import { CreateEventComponent } from './components/views/create-event/create-event';
import { LoginComponent } from './components/views/login/login';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: '**', redirectTo: '' }
];
