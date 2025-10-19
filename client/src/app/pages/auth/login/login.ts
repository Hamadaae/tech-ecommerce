import { Component , inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule , RouterModule],
  templateUrl: './login.html'
})
export class Login {
  loginForm: FormGroup;

  private fb = inject(FormBuilder)
  private store = inject(Store)

  public authError = this.store.selectSignal(selectAuthError)
  public isLoading = this.store.selectSignal(selectAuthLoading)

  constructor(){
    this.loginForm = this.fb.group({
        email : ['', [Validators.required , Validators.email]],
        password : ['', Validators.required]
    })  
  }

  onSubmit(){
    if(this.loginForm.valid){
      const credentials = this.loginForm.value

      this.store.dispatch(AuthActions.login({credentials}))
    }
  }

}
