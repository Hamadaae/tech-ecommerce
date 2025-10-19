import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { App } from './app/app';
import { authReducer } from './app/store/auth/auth.reducer';
import { AuthEffect } from './app/store/auth/auth.effects';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffect]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }) 
  ]
});
