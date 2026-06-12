import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})
export class CreateEventComponent {
  eventService = inject(EventService);
  router = inject(Router);

  // Formulario con ÚNICAMENTE los campos 'name' y 'description' tal como indica la consigna
  createEventForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  submitCreateEvent() {
    if (this.createEventForm.invalid) return;

    const payload = {
      name: this.createEventForm.value.name as string,
      description: this.createEventForm.value.description as string
    };

    // Consumir el eventService con CRUD POST
    this.eventService.createEvent(payload).subscribe({
      next: (response) => {
        // Creado exitosamente vía API
        this.router.navigate(['/']);
      },
      error: (err) => {
        // Fallback local robusto para demo interactiva cuando no este la API arriba
        this.eventService.createEventLocal(payload);
        this.router.navigate(['/']);
      }
    });
  }
}
