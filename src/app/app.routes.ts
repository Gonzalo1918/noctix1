import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: ''
})
export class DummyRouteComponent {}

export const routes: Routes = [
  { path: 'login', component: DummyRouteComponent },
  { path: 'registro', component: DummyRouteComponent },
  { path: 'recuperar', component: DummyRouteComponent },
  { path: 'my-tickets', component: DummyRouteComponent },
  { path: 'resale-market', component: DummyRouteComponent },
  { path: 'how-it-works', component: DummyRouteComponent },
  { path: 'policies', component: DummyRouteComponent },
  { path: 'evento/:id', component: DummyRouteComponent },
  { path: 'events', redirectTo: '', pathMatch: 'full' },
  { path: '', component: DummyRouteComponent },
  { path: '**', redirectTo: '' }
];
