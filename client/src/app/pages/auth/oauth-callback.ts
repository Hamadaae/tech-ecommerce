import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-oauth-callback',
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div>
        <p class="text-center">Signing you in...</p>
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  ngOnInit(): void {
    const provider = this.route.snapshot.data['provider'] as 'discord' | 'github'
      || (this.route.snapshot.url[0]?.path?.includes('discord') ? 'discord' : 'github');

    this.route.queryParamMap.subscribe(params => {
      const code = params.get('code');
      if (code) {
        this.store.dispatch(AuthActions.oauthLogin({ provider, code }));
      } else {
        // Optionally dispatch failure action
        this.store.dispatch(AuthActions.oauthLoginFailure({ error: 'No code provided by provider' }));
      }
    });
  }
}
