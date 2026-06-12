import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NoctixService } from '../../../services/noctix.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css']
})
export class NavComponent {
  store = inject(NoctixService);
}
