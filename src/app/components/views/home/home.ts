import { Component, inject } from '@angular/core';
import { NoctixService } from '../../../services/noctix.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  store = inject(NoctixService);
}
