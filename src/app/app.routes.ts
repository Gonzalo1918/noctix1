import { Routes } from '@angular/router';
import { HomeComponent } from './components/views/home/home';
import { CreateEventComponent } from './components/views/create-event/create-event';
import { LoginComponent } from './components/views/login/login';
import { MyAccountComponent } from './components/views/my-account/my-account';
import { EditEventComponent } from './components/views/edit-event/edit-event';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'edit-event/:id', component: EditEventComponent },
  { path: '**', redirectTo: '' }
];
