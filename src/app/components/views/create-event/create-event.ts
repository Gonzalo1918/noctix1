import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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

  createEventForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    ticketTiers: new FormArray([
      this.createTicketTierFormGroup()
    ])
  });

  get ticketTiers() {
    return this.createEventForm.controls.ticketTiers as FormArray;
  }

  createTicketTierFormGroup() {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required)
    });
  }

  addTicketTier() {
    this.ticketTiers.push(this.createTicketTierFormGroup());
  }

  removeTicketTier(index: number) {
    if (this.ticketTiers.length > 1) {
      this.ticketTiers.removeAt(index);
    }
  }

  get totalTickets(): number {
    return this.ticketTiers.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value;
      return total + (quantity ? Number(quantity) : 0);
    }, 0);
  }

  submitCreateEvent() {
    if (this.createEventForm.invalid) return;

    const payload = {
      name: this.createEventForm.value.name as string,
      description: this.createEventForm.value.description as string,
      startDate: this.createEventForm.value.startDate as string,
      endDate: this.createEventForm.value.endDate as string,
      ticketTiers: this.createEventForm.value.ticketTiers as any[]
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
