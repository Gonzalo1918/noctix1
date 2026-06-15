import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './edit-event.html',
  styleUrls: ['./edit-event.css']
})
export class EditEventComponent implements OnInit {
  eventService = inject(EventService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  eventId: string | null = null;
  loading = true;

  editEventForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    ticketTiers: new FormArray<any>([])
  });

  get ticketTiers() {
    return this.editEventForm.controls.ticketTiers as FormArray;
  }

  totalTickets = toSignal(
    this.ticketTiers.valueChanges.pipe(
      startWith(this.ticketTiers.value),
      map(tiers => tiers.reduce((total: number, tier: any) => total + (tier.quantity ? Number(tier.quantity) : 0), 0))
    ),
    { initialValue: 0 }
  );

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      // Intentamos cargar de las API o del store reactivo
      const event = this.eventService.eventsList().find(e => e.id === this.eventId);
      if (event) {
        this.populateForm(event);
      } else {
        this.eventService.getEventById(this.eventId).subscribe({
          next: (e) => this.populateForm(e),
          error: () => this.router.navigate(['/my-account']) // Not found
        });
      }
    } else {
      this.router.navigate(['/my-account']);
    }
  }

  populateForm(event: Event) {
    this.editEventForm.patchValue({
      name: event.name,
      description: event.description,
      startDate: event.startDate || '',
      endDate: event.endDate || ''
    });

    this.ticketTiers.clear();
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      event.ticketTiers.forEach(tier => {
        this.ticketTiers.push(new FormGroup({
          name: new FormControl(tier.name, Validators.required),
          quantity: new FormControl(tier.quantity, [Validators.required, Validators.min(1)]),
          startDate: new FormControl(tier.startDate || '', Validators.required),
          endDate: new FormControl(tier.endDate || '', Validators.required)
        }));
      });
    } else {
      this.addTicketTier();
    }
    
    this.loading = false;
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

  submitEditEvent() {
    if (this.editEventForm.invalid || !this.eventId) return;

    const eventData = {
      name: this.editEventForm.value.name as string,
      description: this.editEventForm.value.description as string,
      startDate: this.editEventForm.value.startDate as string,
      endDate: this.editEventForm.value.endDate as string,
      ticketTiers: this.editEventForm.value.ticketTiers as any[]
    };

    // Actualizar via Service
    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: () => {
        this.router.navigate(['/my-account']);
      },
      error: () => {
        // Fallback
        this.eventService.updateEventLocal(this.eventId!, eventData);
        this.router.navigate(['/my-account']);
      }
    });
  }
}
