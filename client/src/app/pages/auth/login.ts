// import { Component, inject } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Store } from '@ngrx/store';
// import { login } from '../../store/auth/auth.actions';
// import { selectAuthError, selectAuthLoading } from '../../store/auth/auth.selectors';
// import { Observable } from 'rxjs';
// import { AsyncPipe, CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   templateUrl: './login.html',
//   imports: [CommonModule, ReactiveFormsModule, AsyncPipe
//   ],
// })
// export class LoginComponent {
//   form!: FormGroup;
//   loading$!: Observable<boolean>;
//   error$!: Observable<string | null>;

//   private fb = inject(FormBuilder);
//   private store = inject(Store);

//   ngOnInit() {
//     this.form = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//     });

//     this.loading$ = this.store.select(selectAuthLoading);
//     this.error$ = this.store.select(selectAuthError);
//   }

//   onSubmit() {
//     if (this.form.valid) {
//       this.store.dispatch(login({ credentials: this.form.value }));
//     }
//   }
// }
