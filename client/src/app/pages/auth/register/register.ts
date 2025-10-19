import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
})
export class Register {
  registerForm: FormGroup;

  // Use inject() for modern Angular dependency injection
  private fb = inject(FormBuilder);
  private store = inject(Store); // <-- Injected Store

  // Selectors as Signals for reactive UI state
  public authError = this.store.selectSignal(selectAuthError);
  public isLoading = this.store.selectSignal(selectAuthLoading);

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }

  passwordMatch(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Destructure to exclude confirmPassword before sending to the service/API
      const { confirmPassword, ...data } = this.registerForm.value;

      // DISPATCH the NgRx action
      this.store.dispatch(AuthActions.register({ data }));
    }
  }
}
