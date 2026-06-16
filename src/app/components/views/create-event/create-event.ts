import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
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
    maxCapacity: new FormControl(0, [Validators.required, Validators.min(1)]),
    hasSpecificTime: new FormControl(false),
    ticketTiers: new FormArray([
      this.createTicketTierFormGroup()
    ])
  });

  get ticketTiers() {
    return this.createEventForm.controls.ticketTiers as FormArray;
  }

  getPackages(tierIndex: number) {
    return this.ticketTiers.at(tierIndex).get('packages') as FormArray;
  }

  totalTickets = toSignal(
    this.ticketTiers.valueChanges.pipe(
      startWith(this.ticketTiers.value),
      map(tiers => tiers.reduce((total: number, tier: any) => {
        let tierTotal = 0;
        if (tier.packages) {
          tierTotal = tier.packages.reduce((pTotal: number, p: any) => pTotal + (p.quantity ? Number(p.quantity) : 0), 0);
        }
        return total + tierTotal;
      }, 0))
    ),
    { initialValue: 0 }
  );

  totalTiersCapacity = toSignal(
    this.ticketTiers.valueChanges.pipe(
      startWith(this.ticketTiers.value),
      map(tiers => tiers.reduce((total: number, tier: any) => total + (tier.maxCapacity ? Number(tier.maxCapacity) : 0), 0))
    ),
    { initialValue: 0 }
  );

  getTierPackagesCapacity(tierIndex: number): number {
    const packages = this.getPackages(tierIndex).value;
    if (!packages) return 0;
    return packages.reduce((total: number, p: any) => total + (p.quantity ? Number(p.quantity) : 0), 0);
  }

  createTicketTierFormGroup() {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      maxCapacity: new FormControl(0, [Validators.required, Validators.min(1)]),
      startDate: new FormControl('', Validators.required),
      startTime: new FormControl('00:00'),
      endDate: new FormControl('', Validators.required),
      endTime: new FormControl('23:59'),
      packages: new FormArray([
        this.createTicketPackageFormGroup()
      ])
    });
  }

  createTicketPackageFormGroup() {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      quantity: new FormControl(0, [Validators.required, Validators.min(1)])
    });
  }

  addTicketTier() {
    this.ticketTiers.push(this.createTicketTierFormGroup());
  }

  duplicateTicketTier(index: number) {
    const tierToCopy = this.ticketTiers.at(index).value;
    const newTier = new FormGroup({
      name: new FormControl(tierToCopy.name + ' (Copia)', Validators.required),
      maxCapacity: new FormControl(tierToCopy.maxCapacity, [Validators.required, Validators.min(1)]),
      startDate: new FormControl(tierToCopy.startDate, Validators.required),
      startTime: new FormControl(tierToCopy.startTime || '00:00'),
      endDate: new FormControl(tierToCopy.endDate, Validators.required),
      endTime: new FormControl(tierToCopy.endTime || '23:59'),
      packages: new FormArray(
        tierToCopy.packages.map((p: any) => new FormGroup({
          name: new FormControl(p.name, Validators.required),
          price: new FormControl(p.price, [Validators.required, Validators.min(0)]),
          quantity: new FormControl(p.quantity, [Validators.required, Validators.min(1)])
        }))
      )
    });
    this.ticketTiers.push(newTier);
  }

  removeTicketTier(index: number) {
    if (this.ticketTiers.length > 1) {
      this.ticketTiers.removeAt(index);
    }
  }

  addPackage(tierIndex: number) {
    this.getPackages(tierIndex).push(this.createTicketPackageFormGroup());
  }

  removePackage(tierIndex: number, pkgIndex: number) {
    const packages = this.getPackages(tierIndex);
    if (packages.length > 1) {
      packages.removeAt(pkgIndex);
    }
  }

  submitCreateEvent() {
    if (this.createEventForm.invalid) return;

    const hasSpecTime = this.createEventForm.value.hasSpecificTime as boolean;
    const payload = {
      name: this.createEventForm.value.name as string,
      description: this.createEventForm.value.description as string,
      startDate: this.createEventForm.value.startDate as string,
      endDate: this.createEventForm.value.endDate as string,
      maxCapacity: this.createEventForm.value.maxCapacity as number,
      hasSpecificTime: hasSpecTime,
      ticketTiers: this.createEventForm.value.ticketTiers?.map((tier: any) => {
        const sTime = hasSpecTime ? (tier.startTime || '00:00') : '00:00';
        const eTime = hasSpecTime ? (tier.endTime || '23:59') : '23:59';
        return {
          name: tier.name,
          maxCapacity: tier.maxCapacity,
          startDate: tier.startDate ? `${tier.startDate}T${sTime}` : '',
          endDate: tier.endDate ? `${tier.endDate}T${eTime}` : '',
          packages: tier.packages
        };
      }) || []
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
