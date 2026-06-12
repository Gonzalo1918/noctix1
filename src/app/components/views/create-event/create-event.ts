import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoctixService } from '../../../services/noctix.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})
export class CreateEventComponent {
  store = inject(NoctixService);
  router = inject(Router);

  createEventForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    category: new FormControl('Electrónica', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    stock: new FormControl(1, [Validators.required, Validators.min(1)])
  });

  submitCreateEvent() {
    if (this.createEventForm.invalid) return;
    
    // cast is safe since we only invoke upon valid.
    this.store.createEvent(this.createEventForm.value as any);
    this.router.navigate(['/']);
  }
}
