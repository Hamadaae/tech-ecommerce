// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// import { App } from './app';
// import { authReducer } from './store/auth/auth.reducer';
// import { AuthEffect } from './store/auth/auth.effects';
// import { CoreModule } from './core/core.module';
// import { HttpClientModule } from '@angular/common/http';

// @NgModule({
//   imports: [
//     BrowserModule,
//     HttpClientModule,
//     CoreModule,
//     StoreModule.forRoot({ auth: authReducer }),
//     EffectsModule.forRoot([AuthEffect]),
//     StoreDevtoolsModule.instrument({ maxAge: 25 }),
//     App
//   ],
//   bootstrap: [App]
// })
// export class AppModule {}