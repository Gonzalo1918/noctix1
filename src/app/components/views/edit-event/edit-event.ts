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
    maxCapacity: new FormControl(0, [Validators.required, Validators.min(1)]),
    hasSpecificTime: new FormControl(false),
    ticketTiers: new FormArray<any>([])
  });

  get ticketTiers() {
    return this.editEventForm.controls.ticketTiers as FormArray;
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
      endDate: event.endDate || '',
      maxCapacity: (event as any).maxCapacity || 0,
      hasSpecificTime: (event as any).hasSpecificTime || false
    });

    this.ticketTiers.clear();
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      event.ticketTiers.forEach(tier => {
        const pkgs = new FormArray<any>([]);
        if (tier.packages && tier.packages.length > 0) {
          tier.packages.forEach(p => pkgs.push(new FormGroup({
            name: new FormControl(p.name, Validators.required),
            price: new FormControl(p.price, [Validators.required, Validators.min(0)]),
            quantity: new FormControl(p.quantity, [Validators.required, Validators.min(1)])
          })));
        } else {
          // Fallback if no packages exist in this old tier
          pkgs.push(this.createTicketPackageFormGroup());
        }

        let sDate = tier.startDate || '';
        let sTime = '00:00';
        if (sDate.includes('T')) {
          const parts = sDate.split('T');
          sDate = parts[0];
          sTime = parts[1];
        }

        let eDate = tier.endDate || '';
        let eTime = '23:59';
        if (eDate.includes('T')) {
          const parts = eDate.split('T');
          eDate = parts[0];
          eTime = parts[1];
        }

        this.ticketTiers.push(new FormGroup({
          name: new FormControl(tier.name, Validators.required),
          maxCapacity: new FormControl(tier.maxCapacity || 0, [Validators.required, Validators.min(1)]),
          startDate: new FormControl(sDate),
          startTime: new FormControl(sTime),
          endDate: new FormControl(eDate),
          endTime: new FormControl(eTime),
          packages: pkgs
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
      maxCapacity: new FormControl(0, [Validators.required, Validators.min(1)]),
      startDate: new FormControl(''),
      startTime: new FormControl('00:00'),
      endDate: new FormControl(''),
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

  submitEditEvent() {
    if (this.editEventForm.invalid || !this.eventId) return;

    const hasSpecTime = this.editEventForm.value.hasSpecificTime as boolean;
    const eventData = {
      name: this.editEventForm.value.name as string,
      description: this.editEventForm.value.description as string,
      startDate: this.editEventForm.value.startDate as string,
      endDate: this.editEventForm.value.endDate as string,
      maxCapacity: this.editEventForm.value.maxCapacity as number,
      hasSpecificTime: hasSpecTime,
      ticketTiers: this.editEventForm.value.ticketTiers?.map((tier: any) => {
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
