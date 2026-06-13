import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NoctixService } from '../../../services/noctix.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  store = inject(NoctixService);
  router = inject(Router);

  // Signals for loading and error states as requested
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Reactive Form definition
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  doLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor, ingresá un email válido y una contraseña de al menos 4 caracteres.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Disable the form controls during loading to make absolutely sure they cannot change
    this.loginForm.disable();

    // Simulating API loading with native setTimeout
    setTimeout(() => {
      const emailVal = this.loginForm.value.email;

      // Re-enable in the completion branch (or keep it if navigating away, but re-enabling solves form reuse)
      this.loginForm.enable();

      if (emailVal === 'error@noctix.com') {
        this.isLoading.set(false);
        this.errorMessage.set('Error de Autenticación: Credenciales incorrectas. Probá con otro email.');
      } else {
        this.store.login();
        this.isLoading.set(false);
        this.router.navigate(['/']);
      }
    }, 1500);
  }
}
