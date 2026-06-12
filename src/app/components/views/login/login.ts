import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NoctixService } from '../../../services/noctix.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  store = inject(NoctixService);
  router = inject(Router);

  doLogin() {
    this.store.login();
    this.router.navigate(['/']);
  }
}
